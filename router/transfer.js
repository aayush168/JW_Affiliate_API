const path = require('path');
const express = require('express')
const router = express.Router();
const logger = require(path.join(rootPath, 'logger', 'index.js'));
const	log = logger.getLogger('transfer');
const transferService = require(path.join(rootPath, 'service', 'transfer.js'));

router.get('/getList', async function (req, res) {
  try {
    const size = req.query.size ? parseInt(req.query.size) : 20;
    const page = req.query.page ? size * (parseInt(req.query.page) - 1) : 0;
    const username = req.query.username ? req.query.username : ''
    const addTime = req.query.createdAt ? req.query.createdAt : ''
    const amount = req.query.amount ? req.query.amount : ''
    const result = await transferService.getTransferLogList(size, page, username, addTime, amount);
    res.json(result)
  } catch (err) {
    log.error(err)
    res.status(500).send(err);
  }
})

module.exports = router; 