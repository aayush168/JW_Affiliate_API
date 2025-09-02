const path = require('path');
const express = require('express')
const router = express.Router();
const logger = require(path.join(rootPath, 'logger', 'index.js'));
const	log = logger.getLogger('bonus');
const bonusService = require(path.join(rootPath, 'service', 'bonus', 'admin.js'));
const multer = require('multer');

const upload = multer({
  fileFilter: function (req, file, cb) {
    let filetypes = ['jpg','svg','png','jpeg'];
    if (filetypes.indexOf(file.originalname.split('.')[file.originalname.split('.').length - 1]) === -1) {
      cb({ error: "Invalid File type" });
    }
    cb(null, true)
  },
  limits: {
    fieldSize: 10 * 1024 * 1024
  }
})

router.post('/getList', async function (req, res) {
  try {
    let size = req.body.size ? parseInt(req.body.size) : 20;
    let page = req.body.page ? size * (parseInt(req.body.page) - 1) : 0;
    const status = req.body.status === null ? '' : parseInt(req.body.status)
    const result = await bonusService.getBonusList(status, size, page)
    res.json(result)
  } catch (err) {
    log.error(err)
    res.status(500).send(err);
  }
})

router.post('/add', upload.single('banner'), async function (req, res) {
  try {
    // 0: Disabled, 1: Enabled
    const allowedStatus = [0, 1]
    const name = req.body.name
    const description = req.body.description
    const status = parseInt(req.body.status)
    const order = parseInt(req.body.order)
    if (!allowedStatus.includes(status)) {
      return res.status(400).json({ code: 'params.status.invalid', msg: 'Invalid status' })
    }
    if (!order) {
      return res.status(400).json({ code: 'params.order.required', msg: 'Order is required' })
    }
    let bannerFile
    if (!req.file && req.file.fieldname !== 'banner') {
      return res.status(400).json({ code: 'params.banner.required', msg: 'Banner is required' })
    } else {
      bannerFile = req.file
    }
    const result = await bonusService.addAffiliateBonus(name, description, bannerFile, status, order);
    if (result.code !== 'common.success') {
      return res.status(400).send(result)
    }
    res.json(result)
  } catch (err) {
    log.error(err)
    res.status(500).send(err);
  }
})

router.put('/update/:id', upload.single('banner'), async function (req, res) {
  try {
    const id = req.params.id
    // 0: Disabled, 1: Enabled
    const allowedStatus = [0, 1]
    const name = req.body.name
    const description = req.body.description
    const status = parseInt(req.body.status)
    const order = parseInt(req.body.order)
    if (!allowedStatus.includes(status)) {
      return res.status(400).json({ code: 'params.status.invalid', msg: 'Invalid status' })
    }
    if (!order) {
      return res.status(400).json({ code: 'params.order.required', msg: 'Order is required' })
    }
    let bannerFile
    if (!req.file) {
      bannerFile = false
    } else {
      bannerFile = req.file
    }
    const result = await bonusService.updateAffiliateBonus(name, description, bannerFile, status, order, id);
    if (result.code !== 'common.success') {
      return res.status(400).send(result)
    }
    res.json(result)
  } catch (err) {
    log.error(err)
    res.status(500).send(err)
  }
})

module.exports = router; 