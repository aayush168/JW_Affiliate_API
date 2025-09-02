const path = require('path');
const express = require('express')
const router = express.Router();
const logger = require(path.join(rootPath, 'logger', 'index.js'));
const	log = logger.getLogger('bonusClient');
const bonusService = require(path.join(rootPath, 'service', 'bonus', 'client.js'));

router.post('/getList', async function (req, res) {
  try {
    let size = req.body.size ? parseInt(req.body.size) : 20;
    let page = req.body.page ? size * (parseInt(req.body.page) - 1) : 0;
    const result = await bonusService.getBonusList(size, page)
    res.json(result)
  } catch (err) {
    log.error(err)
    res.status(500).send(err);
  }
})

module.exports = router; 