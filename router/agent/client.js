const path = require('path');
const express = require('express')
const router = express.Router();
const logger = require(path.join(rootPath, 'logger', 'index.js'));
const	log = logger.getLogger('agent');
const agentService = require(path.join(rootPath, 'service', 'agent', 'client.js'));
let { agent, validate } = require(path.join(rootPath, 'validator', 'index.js'))


router.post('/auth/register', agent.agentRegistrationRules(), validate, async function (req, res) {
  try {
    const paymentType = req.body.paymentType;
    if (paymentType === 4) {
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
      playerSourceType: req.body.playerSourceType,
      otherSourceLink: req.body.otherSourceLink ? req.body.otherSourceLink : null
    }
    const result = await agentService.addAgent(registerAgentPayload);
    if (result.code !== 'common.success') {
      return res.status(400).send(result)
    }
    const agentId = result.agentId
    let response
    if (paymentType === 1) {
      const payload = {
        agentId: agentId,
        paymentType: paymentType,
        bankName: req.body.bankName,
        accountName: req.body.accountName,
        accountNumber: req.body.accountNumber,
        accountType: req.body.accountType,
        isfc: req.body.isfc,
        branch: req.body.branch
      }
      response = await agentService.addAgentBankInfo(payload);
    } else if (paymentType === 2) {
      const payload = {
        agentId: agentId,
        paymentType: paymentType,
        skrillAddress: req.body.skrillAddress
      }
      response = await agentService.addAgentSkrillInfo(payload);
    } else if (paymentType === 3) {
      const payload = {
        agentId: agentId,
        paymentType: paymentType,
        usdtWallet: req.body.usdtWallet
      }
      response = await agentService.addAgentUsdtWalletInfo(payload);
    } else if (paymentType === 4) {
      const payload = {
        agentId: agentId,
        paymentType: paymentType,
        playerAccountUsername: req.body.playerAccountUsername
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