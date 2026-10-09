const path = require('path');
const express = require('express')
const router = express.Router();
const logger = require(path.join(rootPath, 'logger', 'index.js'));
const	log = logger.getLogger('operator');
const operatorService = require(path.join(rootPath, 'service', 'operator.js'));
const auth = require(path.join(rootPath, 'middlewares', 'auth.js'));

router.use(auth.skipPublic(auth.OPERATOR_PUBLIC_PATHS, auth.requireOperatorAuth));

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

router.post('/password/change', async function (req, res) {
  try {
    const operatorId = auth.getOperatorId(req)
    if (!operatorId) {
      return res.status(401).json({ code: 'code.auth.unauthorized', msg: 'Not logged in.' })
    }
    const oldPassword = req.body.oldPassword
    const newPassword = req.body.newPassword
    if (!oldPassword) {
      return res.status(400).json({ code: 'params.oldPassword.required', msg: 'Current password is required.' })
    }
    if (!newPassword) {
      return res.status(400).json({ code: 'params.newPassword.required', msg: 'New password is required.' })
    }
    if (newPassword.length < 5 || newPassword.length > 50) {
      return res.status(400).json({ code: 'params.newPassword.invalid', msg: 'New password must be between 5 and 50 characters.' })
    }
    const result = await operatorService.changePassword(operatorId, oldPassword, newPassword)
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
    res.json({
      user: result.user,
      accessToken: auth.signOperatorToken(result.user)
    })
  } catch (err) {
    log.error(err)
    res.status(500).send(err)
  }
})

const checkLoginHandler = async function (req, res) {
  try {
    const operator = auth.readOperatorFromRequest(req)
    if (!operator || !operator.id) {
      return res.json({ user: null })
    }
    const result = await operatorService.getSessionUser(operator.id)
    if (!result.user) {
      return res.json({ user: null })
    }
    res.json({ user: result.user })
  } catch (err) {
    log.error(err);
    res.status(500).send(err)
  }
}

router.post('/checkLogin', checkLoginHandler)

router.post('/logout', async function (req, res) {
  try {
    res.status(200).json({ code: 'common.success' })
  } catch (err) {
    log.error(err)
    res.status(500).send(err)
  }
})

module.exports = router; 