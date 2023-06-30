const path = require('path');
const express = require('express')
const router = express.Router();
const logger = require(path.join(rootPath, 'logger', 'index.js'));
const	log = logger.getLogger('agentCredit');
const creditService = require(path.join(rootPath, 'service', 'credit.js'));

router.get('/getList', async function (req, res) {
  try {
    const size = req.query.size ? parseInt(req.query.size) : 20;
    const page = req.query.page ? size * (parseInt(req.query.page) - 1) : 0;
    const username = req.query.username ? req.query.username : ''
    const addTime = req.query.createdAt ? req.query.createdAt : ''
    const amount = req.query.amount ? req.query.amount : ''
    const result = await creditService.getCreditLogList(size, page, username, addTime, amount);
    res.json(result)
  } catch (err) {
    log.error(err)
    res.status(500).send(err);
  }
})

router.post('/add', async function (req, res) {
  try {
    const agentId = req.body.agentId
    const operatorId = req.body.operatorId
    const amount = req.body.amount
    const memo = req.body.memo
    if (!agentId) {
      return res.status(400).json({ code: 'params.agentId.required', msg: 'AgentId is required.' })
    }
    if (!operatorId) {
      return res.status(400).json({ code: 'params.operatorId.required', msg: 'OperatorId is required.' })
    }
    if (!amount) {
      return res.status(400).json({ code: 'params.amount.required', msg: 'Amount is required.' })
    }
    if (amount < 0) {
      return res.status(400).json({ code: 'params.amount.invalid', msg: 'Invalid amount' })
    }
    const type = 1
    const campaignId = null
    const result = await creditService.updateCredit(agentId, operatorId, amount, type, memo, campaignId);
    if (result.code !== 'common.success') {
      return res.status(400).send(result)
    }
    res.json(result)
  } catch (err) {
    log.error(err)
    res.status(500).send(err);
  }
})

router.post('/deduct', async function (req, res) {
  try {
    const agentId = req.body.agentId
    const operatorId = req.body.operatorId
    const amount = req.body.amount
    const memo = req.body.memo
    let campaignId = req.body.campaignId
    if (!agentId) {
      return res.status(400).json({ code: 'params.agentId.required', msg: 'Agent Id is required.' })
    }
    if (!operatorId) {
      return res.status(400).json({ code: 'params.operatorId.required', msg: 'OperatorId is required.' })
    }
    if (!amount) {
      return res.status(400).json({ code: 'params.amount.required', msg: 'Amount is required.' })
    }
    if (amount < 0) {
      return res.status(400).json({ code: 'params.amount.invalid', msg: 'Invalid amount' })
    }
    const type = 2
    if (!campaignId) {
      campaignId = null
    }
    const result = await creditService.updateCredit(agentId, operatorId, amount, type, memo, campaignId);
    if (result.code !== 'common.success') {
      return res.status(400).send(result)
    }
    res.json(result)
  } catch (err) {
    log.error(err)
    res.status(500).send(err);
  }
})

router.get('/agent/getList', async function (req, res) {
  try {
    const size = req.query.size ? parseInt(req.query.size) : 20;
    const page = req.query.page ? size * (parseInt(req.query.page) - 1) : 0;
    const username = req.query.username ? req.query.username : ''
    const result = await creditService.getAgentList(size, page, username);
    res.json(result)
  } catch (err) {
    log.error(err)
    res.status(500).send(err);
  }
})

module.exports = router; 