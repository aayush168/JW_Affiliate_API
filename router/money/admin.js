const path = require('path');
const express = require('express')
const router = express.Router();
const logger = require(path.join(rootPath, 'logger', 'index.js'));
const	log = logger.getLogger('moneyAdmin');
const moneyService = require(path.join(rootPath, 'service', 'money', 'admin.js'));

router.get('/withdraw/getList', async function (req, res) {
  try {
  } catch (err) {
    log.error(err)
    res.status(500).send(err);
  }
})

module.exports = router;