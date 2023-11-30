const path = require('path');
const express = require('express')
const router = express.Router();
const logger = require(path.join(rootPath, 'logger', 'index.js'));
const	log = logger.getLogger('agent');
const agentService = require(path.join(rootPath, 'service', 'agent', 'admin.js'));
const controller = require(path.join(rootPath, 'controller', 'index.js'));
const { Parser } = require('json2csv');
const moment = require('moment-timezone');
const settingService = require(path.join(rootPath, 'service', 'setting', 'admin.js'));

router.get('/getList', async (req, res) => {
  try {
    const { size = 20, page = 1, ...queryParams } = req.query;
    const params = {
      username: queryParams.username || '',
      name: queryParams.name || '',
      email: queryParams.email || '',
      mobile: queryParams.mobile || '',
      createdAt: queryParams.createdAt || '',
      status: [0, 1, 2, 3, 4].includes(parseInt(queryParams.status)) ? parseInt(queryParams.status) : '',
      playerSourceType: parseInt(queryParams.playerSourceType) || '',
      accountType: parseInt(queryParams.accountType) || '',
      paymentType: queryParams.paymentType || ''
    };

    const calculatedPage = Math.max(1, parseInt(page));
    const calculatedSize = Math.max(1, parseInt(size));
    const startIndex = (calculatedPage - 1) * calculatedSize;

    const result = await agentService.getAgentList(calculatedSize, startIndex, params);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});

router.put('/updateProfile/:id', async function (req, res) {
  try {
    // 0: Disabled, 1: Enabled, 2: In review 3: Rejected
    const allowedStatus = [0, 1, 2, 3, 4]
    const id = req.params.id
    const password = req.body.password
    const mobile = req.body.mobile
    const email = req.body.email
    const whatsapp = req.body.whatsapp
    const skype = req.body.skype
    const playerSourceType = req.body.playerSourceType
    const status = req.body.status
    const remark = req.body.remark
    const telegram = req.body.telegram
    const otherSourceLink = req.body.otherSourceLink
    if (!id) {
      return res.status(400).json({ code: 'params.id.required', msg: 'Unknown Error' })
    }
    if (!allowedStatus.includes(status)) {
      return res.status(400).json({ code: 'params.status.invalid', msg: 'Invalid status' })
    }
    if (!password) {
      return res.status(400).json({ code: 'params.password.required', msg: 'Password is required' })
    }
    const payload = {
      password: password,
      mobile: mobile,
      email: email,
      whatsapp: whatsapp,
      skype: skype,
      playerSourceType: playerSourceType.toString(),
      status: status,
      otherSourceLink: otherSourceLink,
      remark: remark,
      telegram: telegram
    }
    const result = await agentService.updateAgentProfile(payload, id);
    if (result.code !== 'common.success') {
      return res.status(400).send(result)
    }
    res.json(result)
  } catch (err) {
    log.error(err)
    res.status(500).send(err)
  }
})

router.put('/updateAccountType', async function (req, res) {
  try {
    // 1: Normal, 2: Blacklisted 
    const allowedBankAccountType = [1, 2]
    const agentId = req.body.agentId
    const accountType = req.body.accountType
    if (!agentId) {
      return res.status(400).json({ code: 'params.id.required', msg: 'Id is required' })
    }
    if (!accountType) {
      return res.status(400).json({ code: 'params.type.required', msg: 'Invalid Account Type' })
    }
    if (!allowedBankAccountType.includes(accountType)) {
      return res.status(400).json({ code: 'params.status.invalid', msg: 'Invalid Account Type' })
    }
    const payload = {
      agentId: agentId,
      accountType: accountType
    }
    const result = await agentService.updateAgentAccountType(payload);
    if (result.code !== 'common.success') {
      return res.status(400).send(result)
    }
    res.json(result)
  } catch (err) {
    log.error(err)
    res.status(500).send(err)
  }
})

router.put('/updatePayment/:id', async function (req, res) {
  try {
    const agentId = parseInt(req.params.id)
    const paymentType = req.body.paymentTypeId;
    const paymentTypeListResult = await settingService.checkPaymentTypeById(paymentType)
    if (!agentId) {
      return res.status(400).json({ code: 'params.agentId.required', msg: 'Unknown Error' })
    }
    if (paymentTypeListResult.code !== 'common.success') {
      return res.status(400).send(paymentTypeListResult)
    }
    if (paymentTypeListResult.list[0].Code === 'player-account') {
      const result = await agentService.checkAgentPlayerAccountUsername(req.body.playerAccountUsername, agentId);
      if (result.code !== 'common.success') {
        return res.status(400).send(result)
      }
    }
    if (paymentTypeListResult.list[0].Code.includes('bank-account')) {
      const result = await agentService.checkAgentBankAccountNumber(req.body.accountNumber, agentId);
      if (result.code !== 'common.success') {
        return res.status(400).send(result)
      }
    }
    if (paymentTypeListResult.list[0].Code === 'skrill') {
      const result = await agentService.checkAgentSkrillAdress(req.body.skrillAddress, agentId);
      if (result.code !== 'common.success') {
        return res.status(400).send(result)
      }
    }
    if (paymentTypeListResult.list[0].Code === 'usdt') {
      const result = await agentService.checkAgentUsdtAddress(req.body.usdtWallet, agentId);
      if (result.code !== 'common.success') {
        return res.status(400).send(result)
      }
    }
    if (paymentTypeListResult.list[0].Code === 'bkash') {
      const result = await agentService.checkAgentBkashAddress(req.body.bkashWallet, agentId);
      if (result.code !== 'common.success') {
        return res.status(400).send(result)
      }
    }
    if (paymentTypeListResult.list[0].Code === 'nagad') {
      const result = await agentService.checkAgentNagadAddress(req.body.nagadWallet, agentId);
      if (result.code !== 'common.success') {
        return res.status(400).send(result)
      }
    }
    if (paymentTypeListResult.list[0].Code === 'rocket') {
      const result = await agentService.checkAgentRocketAddress(req.body.rocketWallet, agentId);
      if (result.code !== 'common.success') {
        return res.status(400).send(result)
      }
    }
    const mode = process.env.mode
    if (mode === 'prod' || mode === 'dev') {
      const result = await updateJwPayments(req, paymentTypeListResult, agentId, paymentType)
      if (result.code !== 'common.success') {
        return res.status(400).send(result)
      }
      res.json(result)
    } else if (mode === 'jwbdtprod') {
      const result = await updateBdtPayments(req, paymentTypeListResult, agentId, paymentType)
      if (result.code !== 'common.success') {
        return res.status(400).send(result)
      }
      res.json(result)
    } else if (mode.includes('bvprod')) {
      const result = await updateBvPayments(req, paymentTypeListResult, agentId, paymentType)
      if (result.code !== 'common.success') {
        return res.status(400).send(result)
      }
      res.json(result)
    } else if (mode.includes('12betkh')) {
      const result = await update12BetkhPayments(req, paymentTypeListResult, agentId, paymentType)
      if (result.code !== 'common.success') {
        return res.status(400).send(result)
      }
      res.json(result)
    } else {
      res.status(400).send({ msg: 'Feature not available' })
    }
  } catch (err) {
    log.error(err)
    res.status(500).send(err)
  }
})

router.get('/getAgentRegisteredToday', async function (req, res) {
  try {
    const result = await agentService.getAgentRegisteredToday();
    res.json(result)
  } catch (err) {
    log.error(err)
    res.status(500).send(err);
  }
})

router.get('/settlement/getList', async function (req, res) {
  try {
    if (!global.fetchingSettlement) {
      global.fetchingSettlement = true;
      const size = req.query.size ? parseInt(req.query.size) : 20;
      const page = req.query.page ? size * (parseInt(req.query.page) - 1) : 0;
      const startDate = req.query.startDate
      const endDate = req.query.endDate
      const type = req.query.type
      const result = await controller.settlement.getSettlementData(startDate, endDate)
      if (type === 'search') {
        res.json(result)
      } else {
        let fields = [
          {
            label: 'Username',
            value: 'name'
          },
          {
            label: 'Members',
            value: 'members'
          },
          {
            label: 'Total Members',
            value: 'totalMembers'
          },
          {
            label: 'First Deposit Members',
            value: 'firstDeposit'
          },
          {
            label: 'Active Members',
            value: 'activeMembers'
          },
          {
            label: 'Turnover',
            value: 'turnover'
          },
          {
            label: 'Revenue',
            value: 'revenue'
          },
          {
            label: 'Promotion',
            value: 'promotion'
          },
          {
            label: 'Carried Negative Revenue',
            value: 'carried'
          },
          {
            label: 'Reached Level',
            value: 'level'
          },
          {
            label: 'Earning',
            value: 'earning'
          },
          {
            label: 'Member Deposits',
            value: 'memberDeposit'
          },
          {
            label: 'Deduction',
            value: 'deduction'
          },
        ]
        const json2csvParser = new Parser({ fields });
        const csv = json2csvParser.parse(result.affiliates);
        res.attachment(`settlement_detail_report_${moment(startDate).format('YYYYMMDD')}_${moment(endDate).format('YYYYMMDD')}.csv`)
        res.status(200).send(csv)
      }
    } else {
      return res.status(400).json({ code: 'code.report.queue', msg: 'Settlement is being processed. Please try again after some time' })
    }
  } catch (err) {
    log.error(err)
    res.status(500).send(err);
  } finally {
    this.fetchingSettlement = false;
  }
})

router.post('/register/manual', async function (req, res) {
  try {
    const username = req.body.username;
    const name = req.body.name;
    const password = req.body.password
    if (!username) {
      return res.status(400).json({ code: 'params.username.required', msg: 'Username is required.' })
    }
    if (!name) {
      return res.status(400).json({ code: 'params.name.required', msg: 'Full Name is required.' })
    }
    if (!password) {
      return res.status(400).json({ code: 'params.password.required', msg: 'Password is required.' })
    }
    const result = await agentService.addAgent(name, username, password);
    if (result.code !== 'common.success') {
      return res.status(400).send(result)
    }
    res.json(result)
  } catch (err) {
    log.error(err)
    res.status(500).send(err);
  }
})


async function updateJwPayments (req, paymentTypeListResult, agentId, paymentType) {
  try {
    let response
    if (paymentTypeListResult.list[0].Code === 'bank-account') {
      const bankName = req.body.bankName;
      const accountName = req.body.accountName;
      const accountNumber = req.body.accountNumber;
      const bankAccountType = req.body.bankAccountType;
      const ifsc = req.body.ifsc;
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
      if (!bankAccountType) {
        return { code: 'params.bankAccountType.required', msg: 'Bank Account Type is required.' }
      }
      if (!ifsc) {
        return { code: 'params.ifsc.required', msg: 'IFSC is required.' }
      }
      if (!branch) {
        return { code: 'params.branch.required', msg: 'Bank Branch is required.' }
      }
      let allowedBankAccountType = [1,2,3] // 1: Saving, 2: Current, 3: Corporate
      if (!allowedBankAccountType.includes(bankAccountType)) {
        return { code: 'params.accountType.invalid', msg: 'Invalid Account Type' }
      }
      const payload = {
        agentId: agentId,
        paymentType: paymentType,
        bankName: bankName,
        accountName: accountName,
        accountNumber: accountNumber,
        bankAccountType: bankAccountType,
        ifsc: ifsc,
        branch: branch
      }
      response = await agentService.updateAgentBankInfo(payload);
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
      response = await agentService.updateAgentSkrillInfo(payload);
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
      response = await agentService.updateAgentUsdtWalletInfo(payload);
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
      response = await agentService.updateAgentPlayerInfo(payload);
    }
    if (response.code !== 'common.success') {
      return { code: 'params.unknown.error', msg: 'Unknown Error' }
    }
    return response
  } catch (err) {
    throw err;
  }
}

async function updateBdtPayments (req, paymentTypeListResult, agentId, paymentType) {
  try {
    let response
    if (paymentTypeListResult.list[0].Code === 'bdt-bank-account') {
      const bankName = req.body.bankName;
      const accountName = req.body.accountName;
      const accountNumber = req.body.accountNumber;
      const bankAccountType = req.body.bankAccountType;
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
      if (!bankAccountType) {
        return { code: 'params.bankAccountType.required', msg: 'Bank Account Type is required.' }
      }
      if (!branch) {
        return { code: 'params.branch.required', msg: 'Bank Branch is required.' }
      }
      let allowedBankAccountType = [1,2,3] // 1: Saving, 2: Current, 3: Corporate
      if (!allowedBankAccountType.includes(bankAccountType)) {
        return { code: 'params.accountType.invalid', msg: 'Invalid Account Type' }
      }
      const payload = {
        agentId: agentId,
        paymentType: paymentType,
        bankName: bankName,
        accountName: accountName,
        accountNumber: accountNumber,
        bankAccountType: bankAccountType,
        branch: branch
      }
      response = await agentService.updateAgentBdtBankInfo(payload);
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
      response = await agentService.updateAgentBkashInfo(payload);
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
      response = await agentService.updateAgentNagadtInfo(payload);
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
      response = await agentService.updateAgentRocketInfo(payload);
    }
    else if (paymentTypeListResult.list[0].Code === 'player-account') {
      const playerAccountUsername = req.body.playerAccountUsername
      if (!playerAccountUsername) {
        return { code: 'params.playerAccount.required', msg: 'Player Account Username is required.' }
      }
      const payload = {
        agentId: agentId,
        paymentType: paymentType,
        playerAccountUsername: playerAccountUsername
      }
      response = await agentService.updateAgentPlayerInfo(payload);
    }
    if (response.code !== 'common.success') {
      return { code: 'params.unknown.error', msg: 'Unknown Error' }
    }
    return response
  } catch (err) {
    throw err
  }
}

async function updateBvPayments (req, paymentTypeListResult, agentId, paymentType) {
  try {
    let response
    if (paymentTypeListResult.list[0].Code === 'bv-bank-account') {
      const bankName = req.body.bankName;
      const accountName = req.body.accountName;
      const accountNumber = req.body.accountNumber;
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
      if (!branch) {
        return { code: 'params.branch.required', msg: 'Bank Branch is required.' }
      }
      const payload = {
        agentId: agentId,
        paymentType: paymentType,
        bankName: bankName,
        accountName: accountName,
        accountNumber: accountNumber,
        branch: branch
      }
      response = await agentService.updateAgentBvBankInfo(payload);
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
      response = await agentService.updateAgentNagadtInfo(payload);
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
      response = await agentService.updateAgentRocketInfo(payload);
    }
    if (response.code !== 'common.success') {
      return { code: 'params.unknown.error', msg: 'Unknown Error' }
    }
    return response
  } catch (err) {
    throw err;
  }
}

async function update12BetkhPayments (req, paymentTypeListResult, agentId, paymentType) {
  try {
    let response
    if (paymentTypeListResult.list[0].Code === '12bet-bank-account') {
      const bankName = req.body.bankName;
      const accountName = req.body.accountName;
      const accountNumber = req.body.accountNumber;
      if (!bankName) {
        return { code: 'params.bankName.required', msg: 'Bank Name is required.' }
      }
      if (!accountName) {
        return { code: 'params.accountName.required', msg: 'Account name is required.' }
      }
      if (!accountNumber) {
        return { code: 'params.accountNumber.required', msg: 'Account Number is required.' }
      }
      const payload = {
        agentId: agentId,
        paymentType: paymentType,
        bankName: bankName,
        accountName: accountName,
        accountNumber: accountNumber,
      }
      response = await agentService.update12BetBankInfo(payload);
    }
    if (response.code !== 'common.success') {
      return { code: 'params.unknown.error', msg: 'Unknown Error' }
    }
    return response
  } catch (err) {
    throw err;
  }
}

module.exports = router;
