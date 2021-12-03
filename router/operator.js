const path = require('path');
const express = require('express')
const router = express.Router();
const logger = require(path.join(rootPath, 'logger', 'index.js'));
const	log = logger.getLogger('operator');
const operatorService = require(path.join(rootPath, 'service', 'operator.js'));

router.get('/getList', async function (req, res) {
  try {
    const username = req.query.username ? req.query.username : ''
    const createdAt = req.query.createdAt ? req.query.createdAt : '' 
    const result = await operatorService.getOperatorList(username, createdAt);
    res.json(result)
  } catch (err) {
    log.error(err)
    res.status(500).send(err);
  }
})

router.post('/add', async function (req, res) {
  try {
    const name = req.body.name;
    const username = req.body.username;
    const password = req.body.password;
    const status = req.body.status
    if (!name) {
      return res.status(400).json({ code: 'params.name.required', msg: 'Name is required.' })
    }
    if (!username) {
      return res.status(400).json({ code: 'params.username.required', msg: 'Username is required.' })
    }
    if (!password) {
      return res.status(400).json({ code: 'params.password.required', msg: 'Password is required.' })
    }
    if (status === undefined || status === null) {
      return res.status(400).json({ code: 'params.status.required', msg: 'Status is required.' })
    }
    const result = await operatorService.addOperator(name, username, password, status)
    if (result.code !== 'common.success') {
      return res.status(400).send(result)
    }
    res.send(result)
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
      return res.status(400).json({ code: 'params.operatorId.required', msg: 'Operator Id is required.' })
    }
    const name = req.body.name
    const username = req.body.username
    const status = parseInt(req.body.status);
    const roleId = req.body.roleId ? parseInt(req.body.roleId) : null
    if (!allowedStatus.includes(status)) {
      return res.status(400).json({ code: 'params.status.invalid', msg: 'Invalid account status.' })
    }
    if (!name) {
      return res.status(400).json({ code: 'params.name.required', msg: 'Operator Name is required.' })
    }
    if (!username) {
      return res.status(400).json({ code: 'params.username.required', msg: 'Operator username is required.' })
    }
    const result = await operatorService.updateOperator(name, username, status, roleId, id);
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
      return res.status(400).json({ code: 'params.operatorId.required', msg: 'Operator Id is required.' })
    }
    const password = req.body.password
    if (!password) {
      return res.status(400).json({ code: 'params.password.required', msg: 'New password is required.' })
    }
    const result = await operatorService.updatePassword(password, id);
    if (result.code !== 'common.success') {
      return res.status(400).send(result)
    }
    res.json(result)
  } catch (err) {
    log.error(err)
    res.status(500).send(err)
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
    let result = await operatorService.login(username, password)
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