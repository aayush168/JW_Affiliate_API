const path = require('path');
const express = require('express')
const router = express.Router();
const logger = require(path.join(rootPath, 'logger', 'index.js'));
const	log = logger.getLogger('modules');
const modulesService = require(path.join(rootPath, 'service', 'modules.js'));

router.get('/getList', async function (req, res) {
  try {
    const roleId = req.query.roleId
    if (!roleId) {
      return res.json({ list: [] })
    }
    const result = await modulesService.getModuleList(roleId);
    res.json(result)
  } catch (err) {
    log.error(err)
    res.status(500).send(err);
  }
})

router.post('/getListByRole', async function (req, res) {
  try {
    const roleId = req.body.roleId
    if (!roleId) {
      return res.json({ list: [] })
    }
    const result = await modulesService.getModuleListByRole(roleId);
    res.json(result)
  } catch (err) {
    log.error(err)
    res.status(500).send(err);
  }
})

router.post('/setAccess', async function (req, res) {
  try {
    const roleId = req.body.roleId
    const moduleItems = req.body.modules
    if (!roleId) {
      return res.status(400).json({ code: 'params.roleId.required', msg: 'Role is required.' })
    }
    if (!moduleItems) {
      return res.status(400).json({ code: 'params.modules.required', msg: 'Modules is required.' })
    }
    const result = await modulesService.setModuleAuthority(roleId, moduleItems);
    res.json(result)
  } catch (err) {
    log.error(err)
    res.status(500).send(err);
  }
})

module.exports = router; 