const path = require('path');
const express = require('express')
const router = express.Router();
const logger = require(path.join(rootPath, 'logger', 'index.js'));
const	log = logger.getLogger('agent');
const agentService = require(path.join(rootPath, 'service', 'agent', 'admin.js'));
const controller = require(path.join(rootPath, 'controller', 'index.js'));

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

router.put('/update/:id', async function (req, res) {
  try {
    // 0: Disabled, 1: Enabled
    const allowedStatus = [0, 1]
    const id = req.params.id
    if (!id) {
      return res.status(400).json({ code: 'params.status.required', msg: 'Status required.' })
    }
    const status = parseInt(req.body.status);
    if (!allowedStatus.includes(status)) {
      return res.status(400).json({ code: 'params.status.invalid', msg: 'Invalid status.' })
    }
    const result = await agentService.updateAgentStatus(status, id);
    if (result.code !== 'common.success') {
      return res.status(400).send(result)
    }
    res.json(result)
  } catch (err) {
    log.error(err)
    res.status(500).send(err)
  }
})

router.put('/updatePassword/:id', async function (req, res) {
  try {
    const id = req.params.id
    if (!id) {
      return res.status(400).json({ code: 'params.agentId.required', msg: 'Agent Id is required.' })
    }
    const password = req.body.password
    if (!password) {
      return res.status(400).json({ code: 'params.password.required', msg: 'New password is required.' })
    }
    const result = await agentService.updatePassword(password, id);
    if (result.code !== 'common.success') {
      return res.status(400).send(result)
    }
    res.json(result)
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
    const size = req.query.size ? parseInt(req.query.size) : 20;
    const page = req.query.page ? size * (parseInt(req.query.page) - 1) : 0;
    const startDate = req.query.startDate
    const endDate = req.query.endDate
    const result = await controller.settlement.getSettlementData(startDate, endDate)
    res.json(result)
  } catch (err) {
    log.error(err)
    res.status(500).send(err);
  }
})

module.exports = router;