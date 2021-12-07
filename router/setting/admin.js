const path = require('path');
const express = require('express')
const router = express.Router();
const logger = require(path.join(rootPath, 'logger', 'index.js'));
const	log = logger.getLogger('setting');
const settingService = require(path.join(rootPath, 'service', 'setting', 'admin.js'));

router.get('/paymentType/getList', async function (req, res) {
  try {
    const result = await settingService.getPaymentTypeList();
    res.json(result)
  } catch (err) {
    log.error(err)
    res.status(500).send(err);
  }
})

router.put('/paymentType/update/:id', async function (req, res) {
  try {
    // 0: Disabled, 1: Enabled
    const allowedStatus = [0, 1]
    const id = req.params.id
    if (!id) {
      return res.status(400).json({ code: 'params.paymentType.required', msg: 'Payment Type Id is required.' })
    }
    const status = parseInt(req.body.status);
    if (!allowedStatus.includes(status)) {
      return res.status(400).json({ code: 'params.status.invalid', msg: 'Invalid status.' })
    }
    const result = await settingService.updatePaymentType(status, id);
    if (result.code !== 'common.success') {
      return res.status(400).send(result)
    }
    res.json(result)
  } catch (err) {
    log.error(err)
    res.status(500).send(err)
  }
})

router.get('/sourceType/getList', async function (req, res) {
  try {
    const result = await settingService.getSourceTypeList();
    res.json(result)
  } catch (err) {
    log.error(err)
    res.status(500).send(err);
  }
})

router.put('/sourceType/update/:id', async function (req, res) {
  try {
    // 0: Disabled, 1: Enabled
    const allowedStatus = [0, 1]
    const id = req.params.id
    if (!id) {
      return res.status(400).json({ code: 'params.sourceType.required', msg: 'Payment Type Id is required.' })
    }
    const status = parseInt(req.body.status);
    if (!allowedStatus.includes(status)) {
      return res.status(400).json({ code: 'params.status.invalid', msg: 'Invalid status.' })
    }
    const result = await settingService.updatePlayerSource(status, id);
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