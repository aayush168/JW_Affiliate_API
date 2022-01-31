const path = require('path');
const express = require('express')
const router = express.Router();
const logger = require(path.join(rootPath, 'logger', 'index.js'));
const	log = logger.getLogger('advertisement');
const advertisementService = require(path.join(rootPath, 'service', 'advertisement', 'admin.js'));
const multer = require('multer');
const { promisify } = require('util');

const upload = multer({
  limits: {
    fieldSize: 16 * 1024 * 1024
  }
})

router.post('/category/add', async function (req, res) {
  try {
    // 0: Disabled, 1: Enabled
    const allowedStatus = [0, 1]
    const name = req.body.name
    const status = parseInt(req.body.status);
    if (!name) {
      return res.status(400).json({ code: 'params.category.required', msg: 'Category Type is required.' })
    }
    if (!allowedStatus.includes(status)) {
      return res.status(400).json({ code: 'params.status.invalid', msg: 'Invalid status' })
    }
    const result = await advertisementService.addCategory(name, status);
    if (result.code !== 'common.success') {
      return res.status(400).send(result)
    }
    res.json(result)
  } catch (err) {
    log.error(err)
    res.status(500).send(err);
  }
})

router.get('/category/getList', async function (req, res) {
  try {
    const result = await advertisementService.getCategoryList();
    res.json(result)
  } catch (err) {
    log.error(err)
    res.status(500).send(err);
  }
})

router.put('/category/update/:id', async function (req, res) {
  try {
    // 0: Disabled, 1: Enabled
    const allowedStatus = [0, 1]
    const id = req.params.id
    const status = parseInt(req.body.status);
    const name = req.body.name
    if (!id) {
      return res.status(400).json({ code: 'params.category.required', msg: 'Category Type is required.' })
    }
    if (!name) {
      return res.status(400).json({ code: 'params.name.required', msg: 'Category Name is required.' })
    }
    if (!allowedStatus.includes(status)) {
      return res.status(400).json({ code: 'params.status.invalid', msg: 'Invalid status' })
    }
    const result = await advertisementService.updateCategory(name, status, id);
    if (result.code !== 'common.success') {
      return res.status(400).send(result)
    }
    res.json(result)
  } catch (err) {
    log.error(err)
    res.status(500).send(err)
  }
})

router.get('/getList', async function (req, res) {
  try {
    const result = await advertisementService.getBannerList()
    res.json(result)
  } catch (err) {
    log.error(err)
    res.status(500).send(err);
  }
})


router.post('/addBanner', async function (req, res) {
  try {
    let up = await promisify(upload.fields( [{ name: 'advertisementBanner', maxCount: 1 }] ))
    await up(req, res)
    const categoryId = req.body.categoryId
    const description = req.body.description
    if (!categoryId) {
      return res.status(400).json({ code: 'params.categoryId.required', msg: 'Category Id is required' })
    }
    let advertisementBanner
    if (req.files && req.files.advertisementBanner && req.files.advertisementBanner[0]) {
      advertisementBanner = req.files.advertisementBanner[0]
    } else {
      return res.status(400).json({ code: 'params.banner.required', msg: 'Advertisement Banner is required' })
    }
    const result = await advertisementService.addAdvertisementBanner(name, description, advertisementBanner);
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