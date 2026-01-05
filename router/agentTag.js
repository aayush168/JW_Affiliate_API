const path = require('path');
const express = require('express')
const router = express.Router();
const logger = require(path.join(rootPath, 'logger', 'index.js'));
const log = logger.getLogger('agentTag');
const agentTagService = require(path.join(rootPath, 'service', 'agentTag.js'));

router.get('/getList', async function (req, res) {
  try {
    const size = req.query.size ? parseInt(req.query.size) : 20;
    const page = req.query.page ? size * (parseInt(req.query.page) - 1) : 0;
    const name = req.query.name ? req.query.name : ''
    const status = req.query.status ? req.query.status : ''
    const result = await agentTagService.getTagList(size, page, name, status);
    res.json(result)
  } catch (err) {
    log.error(err)
    res.status(500).send(err);
  }
})

router.get('/getAllList', async function (req, res) {
  try {
    const result = await agentTagService.getAllTagList();
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
    const name = req.body.name;
    const color = req.body.color;
    const status = req.body.status;
    const operatorId = req.body.operatorId;
    if (!name) {
      return res.status(400).json({ code: 'params.name.required', msg: 'Name is required.' })
    }
    if (!color) {
      return res.status(400).json({ code: 'params.color.required', msg: 'Color is required.' })
    }
    if (!operatorId) {
      return res.status(400).json({ code: 'params.operatorId.required', msg: 'Operator Id is required.' })
    }
    const memo = req.body.memo ? req.body.memo : '';
    const result = await agentTagService.addTag(name, color, memo, status, operatorId);
    if (result.code !== 'common.success') {
      return res.status(400).send(result)
    }
    res.json(result)
  } catch (err) {
    log.error(err)
    res.status(500).send(err);
  }
})

router.put('/update/:id', async function (req, res) {
  try {
    const id = req.params.id;
    const color = req.body.color;
    const allowedStatus = [0, 1];
    const status = parseInt(req.body.status);
    if (!allowedStatus.includes(status)) {
      return res.status(400).json({ code: 'params.status.invalid', msg: 'Invalid status.' })
    }
    const operatorId = req.body.operatorId;
    if (!id) {
      return res.status(400).json({ code: 'params.id.required', msg: 'Id is required.' })
    }
    if (!color) {
      return res.status(400).json({ code: 'params.color.required', msg: 'Color is required.' })
    }
    if (!operatorId) {
      return res.status(400).json({ code: 'params.operatorId.required', msg: 'Operator Id is required.' })
    }
    const memo = req.body.memo ? req.body.memo : '';
    const result = await agentTagService.updateTag(id, color, memo, status, operatorId);
    if (result.code !== 'common.success') {
      return res.status(400).send(result)
    }
    res.json(result)
  } catch (err) {
    log.error(err)
    res.status(500).send(err);
  }
})

router.get('/agent/getTagList/:agentId', async function (req, res) {
  try {
    const agentId = req.params.agentId;
    if (!agentId) {
      return res.status(400).json({ code: 'params.agentId.required', msg: 'Agent Id is required.' })
    }
    const result = await agentTagService.getTagListByAgentId(agentId);
    if (result.code !== 'common.success') {
      return res.status(400).send(result)
    }
    res.json(result)
  } catch (err) {
    log.error(err)
    res.status(500).send(err);
  }
})

router.post('/agent/assignTag', async function (req, res) {
  try {
    const agentId = req.body.agentId;
    const tagIds = req.body.tagIds;
    const operatorId = req.body.operatorId;
    if (!agentId) {
      return res.status(400).json({ code: 'params.agentId.required', msg: 'Agent Id is required.' })
    }
    if (!tagIds) {
      return res.status(400).json({ code: 'params.tagIds.required', msg: 'Tag Ids are required.' })
    }
    if (!operatorId) {
      return res.status(400).json({ code: 'params.operatorId.required', msg: 'Operator Id is required.' })
    }
    const result = await agentTagService.assignTag(agentId, tagIds, operatorId);
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