const path = require('path');
const express = require('express')
const router = express.Router();
const logger = require(path.join(rootPath, 'logger', 'index.js'));
const	log = logger.getLogger('agent');
const agentService = require(path.join(rootPath, 'service', 'agent', 'admin.js'));
let { agent, validate } = require(path.join(rootPath, 'validator', 'index.js'))

router.get('/getList', async function (req, res) {
  try {
    let size = req.query.size ? parseInt(req.query.size) : 20;
    let page = req.query.page ? size * (parseInt(req.query.page) - 1) : 0;
    const params = {
      username: req.query.username ? req.query.username : '',
      createdAt: req.query.createdAt ? req.query.createdAt : '',
      status: parseInt(req.query.status) === 0 || parseInt(req.query.status) === 1 ? parseInt(req.query.status) : '',
      revenueShareType: parseInt(req.query.revenueShareType) ? parseInt(req.query.revenueShareType) : '',
      playerSourceType: parseInt(req.query.playerSourceType) ? parseInt(req.query.playerSourceType) : '',
      paymentType: parseInt(req.query.paymentType) ? parseInt(req.query.paymentType) : req.query.paymentType
    }
    const result = await agentService.getAgentList(size, page, params);
    res.json(result)
  } catch (err) {
    log.error(err)
    res.status(500).send(err);
  }
})

router.post('/update', agent.agentRegistrationRules(), validate, async function (req, res) {
  try {
    res.json({ code: 'common.success' });
    // const paymentType = req.body.paymentType;
    // const registerAgentPayload = {
    //   name: req.body.name,
    //   username: req.body.username,
    //   password: req.body.password,
    //   mobile: req.body.mobile,
    //   whatsapp: req.body.whatsapp ? req.body.whatsapp : null,
    //   skype: req.body.skype ? req.body.skype : null,
    //   email: req.body.email,
    //   revenueShareType: req.body.revenueShareType,
    //   playerSourceType: req.body.playerSourceType,
    //   otherSourceLink: req.body.otherSourceLink ? req.body.otherSourceLink : null
    // }
    // const result = await agentService.addAgent(registerAgentPayload);
    // if (result.code !== 'common.success') {
    //   return res.status(400).send(result)
    // }
    // const agentId = result.agentId
    // let response
    // if (paymentType === 1) {
    //   const payload = {
    //     agentId: agentId,
    //     paymentType: paymentType,
    //     bankName: req.body.bankName,
    //     accountName: req.body.accountName,
    //     accountNumber: req.body.accountNumber,
    //     accountType: req.body.accountType,
    //     isfc: req.body.isfc,
    //     branch: req.body.branch
    //   }
    //   response = await agentService.addAgentBankInfo(payload);
    // } else if (paymentType === 2) {
    //   const payload = {
    //     agentId: agentId,
    //     paymentType: paymentType,
    //     skrillAddress: req.body.skrillAddress
    //   }
    //   response = await agentService.addAgentSkrillInfo(payload);
    // } else if (paymentType === 3) {
    //   const payload = {
    //     agentId: agentId,
    //     paymentType: paymentType,
    //     usdtWallet: req.body.usdtWallet
    //   }
    //   response = await agentService.addAgentUsdtWalletInfo(payload);
    // } else if (paymentType === 4) {
    //   const payload = {
    //     agentId: agentId,
    //     paymentType: paymentType,
    //     playerAccountUsername: req.body.playerAccountUsername
    //   }
    //   response = await agentService.addAgentPlayerInfo(payload);
    // }
    // if (response.code !== 'common.success') {
    //   return res.status(400).send(response)
    // }
    // res.json(response)
  } catch (err) {
    log.error(err)
    res.status(500).send(err);
  }
})

module.exports = router; 