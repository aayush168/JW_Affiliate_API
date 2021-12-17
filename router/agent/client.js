const path = require('path');
const express = require('express')
const router = express.Router();
const logger = require(path.join(rootPath, 'logger', 'index.js'));
const	log = logger.getLogger('agent');
const agentService = require(path.join(rootPath, 'service', 'agent', 'client.js'));
let { agent, validate } = require(path.join(rootPath, 'validator', 'index.js'))
const settingService = require(path.join(rootPath, 'service', 'setting', 'admin.js'));

router.post('/auth/register', agent.agentRegistrationRules(), validate, async function (req, res) {
  try {
    const paymentType = req.body.paymentType;
    const playerSourceType = req.body.playerSourceType;
    const paymenTypeListResult = await settingService.checkPaymentTypeById(paymentType)
    const playerSourceTypeListResult = await settingService.getSourceTypeList()
    if (paymenTypeListResult.code !== 'common.success') {
      return res.status(400).send(paymenTypeListResult)
    }
    if (playerSourceTypeListResult.list.length === 0) {
      return res.status(422).send({ code: 'code.playerSourceType.unknown', msg: 'Invalid Player Source type.' })
    }
    const allowedPlayerSourceType = playerSourceTypeListResult.list.map(x => x.Id);
    for (let i = 0; i < playerSourceType.length; i++) {
      const sourceType = playerSourceType[i];
      if (!allowedPlayerSourceType.includes(sourceType)) {
        throw { code: 'params.playerSourceType.invalid', msg: 'Invalid Player Source type.' }
      }
    }
    if (paymenTypeListResult.list[0].Code === 'player-account') {
      const result = await agentService.checkAgentPlayerAccountUsername(req.body.playerAccountUsername);
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
    let response
    if (paymenTypeListResult.list[0].Code === 'bank-account') {
      const bankName = req.body.bankName;
      const accountName = req.body.accountName;
      const accountNumber = req.body.accountNumber;
      const accountType = req.body.accountType;
      const isfc = req.body.isfc;
      const branch = req.body.branch;
      if (!bankName) {
        return res.status(400).json({ code: 'params.bankName.required', msg: 'Bank Name is required.' })
      }
      if (!accountName) {
        return res.status(400).json({ code: 'params.accountName.required', msg: 'Account name is required.' })
      }
      if (!accountNumber) {
        return res.status(400).json({ code: 'params.accountNumber.required', msg: 'Account Number is required.' })
      }
      if (!accountType) {
        return res.status(400).json({ code: 'params.accountType.required', msg: 'Account Type is required.' })
      }
      if (!isfc) {
        return res.status(400).json({ code: 'params.isfc.required', msg: 'ISFC is required.' })
      }
      if (!branch) {
        return res.status(400).json({ code: 'params.branch.required', msg: 'Bank Branch is required.' })
      }
      let allowedAccountType = [1,2,3] // 1: Saving, 2: Current, 3: Corporate
      if (!allowedAccountType.includes(accountType)) {
        throw { code: 'params.accountType.invalid', msg: 'Invalid Account Type' }
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
    } else if (paymenTypeListResult.list[0].Code === 'skrill') {
      const skrillAddress = req.body.skrillAddress
      if (!skrillAddress) {
        return res.status(400).json({ code: 'params.skrillId.required', msg: 'Skrill Id is required.' })
      }
      const payload = {
        agentId: agentId,
        paymentType: paymentType,
        skrillAddress: skrillAddress
      }
      response = await agentService.addAgentSkrillInfo(payload);
    } else if (paymenTypeListResult.list[0].Code === 'usdt') {
      const usdtWallet = req.body.usdtWallet
      if (!usdtWallet) {
        return res.status(400).json({ code: 'params.usdtWallet.required', msg: 'USDT Wallet Id is required.' })
      }
      const payload = {
        agentId: agentId,
        paymentType: paymentType,
        usdtWallet: usdtWallet
      }
      response = await agentService.addAgentUsdtWalletInfo(payload);
    } else if (paymenTypeListResult.list[0].Code === 'player-account') {
      const playerAccountUsername = req.body.playerAccountUsername
      if (!playerAccountUsername) {
        return res.status(400).json({ code: 'params.playerAccount.required', msg: 'Player Account Username is required.' })
      }
      const payload = {
        agentId: agentId,
        paymentType: paymentType,
        playerAccountUsername: playerAccountUsername
      }
      response = await agentService.addAgentPlayerInfo(payload);
    }
    if (response.code !== 'common.success') {
      return res.status(400).send(response)
    }
    res.json(response)
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
    req.session.user = result.user;
    res.json({ user: result.user })
  } catch (err) {
    log.error(err)
    res.status(500).send(err)
  }
})

router.post('/checklogin', async function (req, res) {
  try {
    if (req.session.user) {
      return res.json({ user: req.session.user });
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

module.exports = router; 