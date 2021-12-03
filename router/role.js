const path = require('path');
const express = require('express')
const router = express.Router();
const logger = require(path.join(rootPath, 'logger', 'index.js'));
const	log = logger.getLogger('role');
const roleService = require(path.join(rootPath, 'service', 'role.js'));

router.get('/getList', async function (req, res) {
  try {
    const result = await roleService.getRoleList();
    res.json(result)
  } catch (err) {
    log.error(err)
    res.status(500).send(err);
  }
})

router.post('/add', async function (req, res) {
  try {
    const name = req.body.name;
    if (!name) {
      return res.status(400).json({ code: 'params.name.required', msg: 'Name is required.' })
    }
    const result = await roleService.addRoleList(name);
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