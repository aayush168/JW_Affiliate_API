const path = require('path');
const express = require('express')
const router = express.Router();
const logger = require(path.join(rootPath, 'logger', 'index.js'));
const	log = logger.getLogger('FTD');
const ftdService = require(path.join(rootPath, 'service', 'ftd.js'));

router.get('/getList', async function (req, res) {
  try {
    const size = req.query.size ? parseInt(req.query.size) : 20;
    const page = req.query.page ? size * (parseInt(req.query.page) - 1) : 0;
    const username = req.query.username ? req.query.username : ''
    const startDate = req.query.startDate ? req.query.startDate : ''
    const endDate = req.query.endDate ? req.query.endDate : ''
    const result = await ftdService.getList(size, page, username, startDate, endDate);
    res.json(result)
  } catch (err) {
    log.error(err)
    res.status(500).send(err);
  }
})

module.exports = router; 