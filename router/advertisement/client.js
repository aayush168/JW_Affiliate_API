const path = require('path');
const express = require('express')
const router = express.Router();
const logger = require(path.join(rootPath, 'logger', 'index.js'));
const	log = logger.getLogger('advertisement');
const advertisementService = require(path.join(rootPath, 'service', 'advertisement', 'client.js'));

router.get('/getList', async function (req, res) {
  try {
    const result = await advertisementService.getBannerList();
    res.json(result)
  } catch (err) {
    log.error(err)
    res.status(500).send(err);
  }
})

module.exports = router; 