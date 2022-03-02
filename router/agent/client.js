const path = require('path');
const express = require('express')
const router = express.Router();
const logger = require(path.join(rootPath, 'logger', 'index.js'));
const	log = logger.getLogger('agent');
const agentService = require(path.join(rootPath, 'service', 'agent', 'client.js'));
let { agent, validate } = require(path.join(rootPath, 'validator', 'index.js'))
const settingService = require(path.join(rootPath, 'service', 'setting', 'admin.js'));
const controller = require(path.join(rootPath, 'controller', 'index.js'));
const config = require('../../config/index.js');

router.post('/auth/register', agent.agentRegistrationRules(), validate, async function (req, res) {
  try {
    const paymentType = req.body.paymentType;
    const playerSourceType = req.body.playerSourceType;
    const paymentTypeListResult = await settingService.checkPaymentTypeById(paymentType)
    const playerSourceTypeListResult = await settingService.getSourceTypeList()
    if (paymentTypeListResult.code !== 'common.success') {
      return res.status(400).send(paymentTypeListResult)
    }
    if (playerSourceTypeListResult.list.length === 0) {
      return res.status(422).send({ code: 'code.playerSourceType.unknown', msg: 'Invalid Player Source type.' })
    }
    const allowedPlayerSourceType = playerSourceTypeListResult.list.map(x => x.Id);
    for (let i = 0; i < playerSourceType.length; i++) {
      const sourceType = playerSourceType[i];
      if (!allowedPlayerSourceType.includes(sourceType)) {
        return res.status(400).send({ code: 'params.playerSourceType.invalid', msg: 'Invalid Player Source type.' })
      }
    }
    if (paymentTypeListResult.list[0].Code === 'player-account') {
      const result = await agentService.checkAgentPlayerAccountUsername(req.body.playerAccountUsername);
      if (result.code !== 'common.success') {
        return res.status(400).send(result)
      }
    }
    if (paymentTypeListResult.list[0].Code === 'bank-account' || paymentTypeListResult.list[0].Code === 'bdt-bank-account') {
      const result = await agentService.checkAgentBankAccountNumber(req.body.accountNumber);
      if (result.code !== 'common.success') {
        return res.status(400).send(result)
      }
    }
    if (paymentTypeListResult.list[0].Code === 'skrill') {
      const result = await agentService.checkAgentSkrillAdress(req.body.skrillAddress);
      if (result.code !== 'common.success') {
        return res.status(400).send(result)
      }
    }
    if (paymentTypeListResult.list[0].Code === 'usdt') {
      const result = await agentService.checkAgentUsdtAddress(req.body.usdtWallet);
      if (result.code !== 'common.success') {
        return res.status(400).send(result)
      }
    }
    if (paymentTypeListResult.list[0].Code === 'bkash') {
      const result = await agentService.checkAgentBkashAddress(req.body.bkashWallet);
      if (result.code !== 'common.success') {
        return res.status(400).send(result)
      }
    }
    if (paymentTypeListResult.list[0].Code === 'nagad') {
      const result = await agentService.checkAgentNagadAddress(req.body.nagadWallet);
      if (result.code !== 'common.success') {
        return res.status(400).send(result)
      }
    }
    if (paymentTypeListResult.list[0].Code === 'rocket') {
      const result = await agentService.checkAgentRocketAddress(req.body.rocketWallet);
      if (result.code !== 'common.success') {
        return res.status(400).send(result)
      }
    }
    const registerAgentPayload = {
      name: req.body.name,
      username: req.body.username,
      password: req.body.password,
      mobile: req.body.mobile,
      whatsapp: req.body.whatsapp ? req.body.whatsapp : null,
      skype: req.body.skype ? req.body.skype : null,
      email: req.body.email,
      revenueShareType: req.body.revenueShareType,
      playerSourceType: playerSourceType.toString(),
      otherSourceLink: req.body.otherSourceLink ? req.body.otherSourceLink : null
    }
    const result = await agentService.addAgent(registerAgentPayload);
    if (result.code !== 'common.success') {
      return res.status(400).send(result)
    }
    const agentId = result.agentId
    const mode = process.env.mode
    if (mode === 'prod' || mode === 'dev') {
      const result = await addJwPayments(req, paymentTypeListResult, agentId, paymentType)
      if (result.code !== 'common.success') {
        return res.status(400).send(result)
      }
      res.json(result)
    } else if (mode === 'jwbdtprod' || mode === 'jwbdtdev') {
      const result = await addJwBdtPayments(req, paymentTypeListResult, agentId, paymentType)
      if (result.code !== 'common.success') {
        return res.status(400).send(result)
      }
      res.json(result)
    } else {
      res.status(400).send({ msg: 'Feature not available' })
    }
  } catch (err) {
    log.error(err)
    res.status(500).send(err);
  }
})

router.post('/auth/login', async function (req, res) {
  try {
    const username = req.body.username
    const password = req.body.password
    if (!username) {
      return res.status(400).json({ code: 'params.username.required', msg: 'Username is required.' })
    }
    if (!password) {
      return res.status(400).json({ code: 'params.password.required', msg: 'Password is required.' })
    }
    let result = await agentService.login(username, password)
    if (!result.user) {
      return res.status(401).send(result)
    }
    req.session.client = result.user;
    res.json({ user: result.user })
  } catch (err) {
    log.error(err)
    res.status(500).send(err)
  }
})

router.post('/checklogin', async function (req, res) {
  try {
    if (req.session.client) {
      return res.json({ user: req.session.client });
    }
    res.json({ user: null })
  } catch (err) {
    log.error(err);
    res.status(500).send(err)
  }
})

router.post('/logout', async function (req, res) {
  try {
    req.session.user = null;
    req.session.destroy();
    res.status(200).end();
    return;
  } catch (err) {
    log.error(err)
    res.status(500).send(err)
  }
})

router.post('/revenue/estimate/data', async function (req, res) {
  try {
    const agentCode = req.body.agentCode;
    const start = req.body.start;
    const end = req.body.end;
    if (!start) {
      return res.status(400).json({ code: 'params.start.required', msg: 'Start Date is required.' })
    }
    if (!end) {
      return res.status(400).json({ code: 'params.end.required', msg: 'End Date is required.' })
    }
    let result = await controller.revenue.getEstimateRevenue(agentCode, start, end)
    res.json(result)
  } catch (err) {
    log.error(err)
    res.status(500).send(err)
  }
});

router.get('/player/getList', async function (req, res) {
  try {
    const size = req.query.size ? parseInt(req.query.size) : 20;
    const page = req.query.page ? size * (parseInt(req.query.page) - 1) : 0;
    const agentCode = req.query.agentCode;
    const username = req.query.username
    const startDate = req.query.startDate
    const endDate = req.query.endDate
    const status = req.query.status === null || req.query.status === undefined || req.query.status === 'null' ? '' : parseInt(req.query.status)
    const result = await controller.playerlist.getPlayers(agentCode, startDate, endDate, username, status, page);
    res.json(result)
  } catch (err) {
    log.error(err)
    res.status(500).send(err);
  }
})

router.get('/player/realtime/data', async function (req, res) {
  try {
    const size = req.query.size ? parseInt(req.query.size) : 20;
    const page = req.query.page ? size * (parseInt(req.query.page) - 1) : 0;
    const agentCode = req.query.agentCode;
    const username = req.query.username
    const startDate = req.query.startDate
    const endDate = req.query.endDate
    const result = await controller.realtimePlayerPerformance.getRealtimePlayerPerformance(agentCode, startDate, endDate, username, page);
    res.json(result)
  } catch (err) {
    log.error(err)
    res.status(500).send(err);
  }
});

router.get('/player/performance/data', async function (req, res) {
  try {
    const size = req.query.size ? parseInt(req.query.size) : 20;
    const page = req.query.page ? size * (parseInt(req.query.page) - 1) : 0;
    const agentCode = req.query.agentCode;
    const username = req.query.username
    const startDate = req.query.startDate
    const endDate = req.query.endDate
    const result = await controller.playerPerformance.getPlayerPerformance(agentCode, startDate, endDate, username, page);
    res.json(result)
  } catch (err) {
    log.error(err)
    res.status(500).send(err);
  }
});


router.get('/setting/getList', async function (req, res) {
  try {
    const settingData = {
      setting: config.settings,
      commission: config.commission
    }
    res.json(settingData)
  } catch (err) {
    log.error(err)
    res.status(500).send(err);
  }
});

async function addJwPayments (req, paymentTypeListResult, agentId, paymentType) {
  try {
    let response
    if (paymentTypeListResult.list[0].Code === 'bank-account') {
      const bankName = req.body.bankName;
      const accountName = req.body.accountName;
      const accountNumber = req.body.accountNumber;
      const accountType = req.body.accountType;
      const isfc = req.body.isfc;
      const branch = req.body.branch;
      if (!bankName) {
        return { code: 'params.bankName.required', msg: 'Bank Name is required.' }
      }
      if (!accountName) {
        return { code: 'params.accountName.required', msg: 'Account name is required.' }
      }
      if (!accountNumber) {
        return { code: 'params.accountNumber.required', msg: 'Account Number is required.' }
      }
      if (!accountType) {
        return { code: 'params.accountType.required', msg: 'Account Type is required.' }
      }
      if (!isfc) {
        return { code: 'params.isfc.required', msg: 'ISFC is required.' }
      }
      if (!branch) {
        return { code: 'params.branch.required', msg: 'Bank Branch is required.' }
      }
      let allowedAccountType = [1,2,3] // 1: Saving, 2: Current, 3: Corporate
      if (!allowedAccountType.includes(accountType)) {
        return { code: 'params.accountType.invalid', msg: 'Invalid Account Type' }
      }
      const payload = {
        agentId: agentId,
        paymentType: paymentType,
        bankName: bankName,
        accountName: accountName,
        accountNumber: accountNumber,
        accountType: accountType,
        isfc: isfc,
        branch: branch
      }
      response = await agentService.addAgentBankInfo(payload);
    } else if (paymentTypeListResult.list[0].Code === 'skrill') {
      const skrillAddress = req.body.skrillAddress
      if (!skrillAddress) {
        return { code: 'params.skrillId.required', msg: 'Skrill Id is required.' }
      }
      const payload = {
        agentId: agentId,
        paymentType: paymentType,
        skrillAddress: skrillAddress
      }
      response = await agentService.addAgentSkrillInfo(payload);
    } else if (paymentTypeListResult.list[0].Code === 'usdt') {
      const usdtWallet = req.body.usdtWallet
      if (!usdtWallet) {
        return { code: 'params.usdtWallet.required', msg: 'USDT Wallet Id is required.' }
      }
      const payload = {
        agentId: agentId,
        paymentType: paymentType,
        usdtWallet: usdtWallet
      }
      response = await agentService.addAgentUsdtWalletInfo(payload);
    } else if (paymentTypeListResult.list[0].Code === 'player-account') {
      const playerAccountUsername = req.body.playerAccountUsername
      if (!playerAccountUsername) {
        return { code: 'params.playerAccount.required', msg: 'Player Account Username is required.' }
      }
      const payload = {
        agentId: agentId,
        paymentType: paymentType,
        playerAccountUsername: playerAccountUsername
      }
      response = await agentService.addAgentPlayerInfo(payload);
    }
    if (response.code !== 'common.success') {
      return { code: 'params.unknown.error', msg: 'Unknown Error' }
    }
    return response
  } catch (err) {
    throw err;
  }
}

async function addJwBdtPayments (req, paymentTypeListResult, agentId, paymentType) {
  try {
    let response
    if (paymentTypeListResult.list[0].Code === 'bdt-bank-account') {
      const bankName = req.body.bankName;
      const accountName = req.body.accountName;
      const accountNumber = req.body.accountNumber;
      const accountType = req.body.accountType;
      const branch = req.body.branch;
      if (!bankName) {
        return { code: 'params.bankName.required', msg: 'Bank Name is required.' }
      }
      if (!accountName) {
        return { code: 'params.accountName.required', msg: 'Account name is required.' }
      }
      if (!accountNumber) {
        return { code: 'params.accountNumber.required', msg: 'Account Number is required.' }
      }
      if (!accountType) {
        return { code: 'params.accountType.required', msg: 'Account Type is required.' }
      }
      if (!branch) {
        return { code: 'params.branch.required', msg: 'Bank Branch is required.' }
      }
      let allowedAccountType = [1,2,3] // 1: Saving, 2: Current, 3: Corporate
      if (!allowedAccountType.includes(accountType)) {
        return { code: 'params.accountType.invalid', msg: 'Invalid Account Type' }
      }
      const payload = {
        agentId: agentId,
        paymentType: paymentType,
        bankName: bankName,
        accountName: accountName,
        accountNumber: accountNumber,
        accountType: accountType,
        branch: branch
      }
      response = await agentService.addAgentBdtBankInfo(payload);
    } else if (paymentTypeListResult.list[0].Code === 'bkash') {
      const bkashWallet = req.body.bkashWallet
      if (!bkashWallet) {
        return { code: 'params.bkashWallet.required', msg: 'Wallet Address is required.' }
      }
      const payload = {
        agentId: agentId,
        paymentType: paymentType,
        bkashWallet: bkashWallet
      }
      response = await agentService.addAgentBkashInfo(payload);
    } else if (paymentTypeListResult.list[0].Code === 'nagad') {
      const nagadWallet = req.body.nagadWallet
      if (!nagadWallet) {
        return { code: 'params.nagadWallet.required', msg: 'Wallet Address is required.' }
      }
      const payload = {
        agentId: agentId,
        paymentType: paymentType,
        nagadWallet: nagadWallet
      }
      response = await agentService.addAgentNagadtInfo(payload);
    } else if (paymentTypeListResult.list[0].Code === 'rocket') {
      const rocketWallet = req.body.rocketWallet
      if (!rocketWallet) {
        return { code: 'params.rocketWallet.required', msg: 'Wallet Address is required.' }
      }
      const payload = {
        agentId: agentId,
        paymentType: paymentType,
        rocketWallet: rocketWallet
      }
      response = await agentService.addAgentRocketInfo(payload);
    }
    if (response.code !== 'common.success') {
      return { code: 'params.unknown.error', msg: 'Unknown Error' }
    }
    return response
  } catch (err) {
    throw err
  }
}

module.exports = router;
