const path = require('path');
const express = require('express')
const router = express.Router();
const logger = require(path.join(rootPath, 'logger', 'index.js'));
const	log = logger.getLogger('modules');
const logService = require(path.join(rootPath, 'service', 'log.js'));


router.get('/getList', async function (req, res) {
  try {
    const size = req.query.size ? parseInt(req.query.size) : 20;
    const page = req.query.page ? size * (parseInt(req.query.page) - 1) : 0;
    const agentUsername = req.query.agentUsername ? req.query.agentUsername : ''
    const payload = {
      agentUsername: agentUsername,
      size: size,
      page: page
    }
    const result = await logService.getLog(payload);
    if (result.code !== 'common.success') {
      return res.status(400).send(result)
    }
    res.json(result)
  } catch (err) {
    log.error(err)
    res.status(500).send(err);
  }
})


router.post('/add', async function (req, res) {
  try {
    const type = req.body.type
    const operatorId = req.body.operatorId
    const agentUsername = req.body.agentUsername
    const actionData = req.body.actionData
    const actionCode = req.body.actionCode
    if (!type) {
      return res.status(400).json({ code: 'params.type.required', msg: 'Log Type is required' })
    }
    if (!operatorId) {
      return res.status(400).json({ code: 'params.operatorId.required', msg: 'Operator Id is required' })
    }
    const payload = {
      type: type,
      operatorId: operatorId,
      agentUsername: agentUsername,
      actionData: actionData,
      actionCode: actionCode
    }
    const result = await logService.addLog(payload);
    if (result.code !== 'common.success') {
      return res.status(400).send(result)
    }
    res.json(result)
  } catch (err) {
    log.error(err)
    res.status(500).send(err);
  }
})

module.exports = router; 