const path = require('path');
const express = require('express')
const router = express.Router();
const logger = require(path.join(rootPath, 'logger', 'index.js'));
const	log = logger.getLogger('moneyAdmin');
const moneyService = require(path.join(rootPath, 'service', 'money', 'admin.js'));

router.get('/withdraw/getList', async (req, res) => {
  try {
    const { size = 20, page = 1, ...queryParams } = req.query;
    const params = {
      username: queryParams.username || '',
      createdAt: queryParams.createdAt || '',
      status: [1, 2, 3].includes(parseInt(queryParams.status)) ? parseInt(queryParams.status) : '',
    };

    const calculatedPage = Math.max(1, parseInt(page));
    const calculatedSize = Math.max(1, parseInt(size));
    const startIndex = (calculatedPage - 1) * calculatedSize;

    const result = await moneyService.getWithdrawRequest(calculatedSize, startIndex, params);
    if (result.code !== 'common.success') {
      return res.status(400).send(result)
    }
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});

router.get('/withdraw/transfer', async (req, res) => {
  try {
    const { withdrawId } = req.body;
    
    if (!withdrawId) {
      return res.status(400).json({ code: 'params.withdrawId.required', msg: 'Withdraw Id is required' });
    }

    const result = await moneyService.transferWithdrawRequestOCMS(withdrawId);
    if (result.code !== 'common.success') {
      return res.status(400).send(result)
    }
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});

module.exports = router;