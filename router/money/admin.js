const path = require('path');
const express = require('express')
const router = express.Router();
const logger = require(path.join(rootPath, 'logger', 'index.js'));
const	log = logger.getLogger('moneyAdmin');
const moneyService = require(path.join(rootPath, 'service', 'money', 'admin.js'));

router.get('/withdraw/getList', async (req, res) => {
  try {
    const params = {
      username: req.query.username || '',
      createdAt: req.query.createdAt || '',
      status: [0, 1, 2, 3].includes(parseInt(req.query.status)) ? parseInt(req.query.status) : '',
    };

    const page = parseInt(req.query.page);
    const size = parseInt(req.query.size);
    const startIndex = (page - 1) * size;
    const result = await moneyService.getWithdrawRequest(size, startIndex, params);
    if (result.code !== 'common.success') {
      return res.status(400).send(result)
    }
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});

router.post('/withdraw/transfer', async (req, res) => {
  try {
    const { withdrawId, operatorId } = req.body;
    
    if (!withdrawId) {
      return res.status(400).json({ code: 'params.withdrawId.required', msg: 'Withdraw Id is required' });
    }
    if (!operatorId) {
      return res.status(400).json({ code: 'params.operatorId.required', msg: 'Operator Id is required' });
    }
    const result = await moneyService.transferBalancePlayerAccount(withdrawId, operatorId);
    if (result.code !== 'common.success') {
      return res.status(400).send(result)
    }
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});

router.post('/withdraw/reject', async (req, res) => {
  try {
    const { withdrawId, operatorId } = req.body;
    
    if (!withdrawId) {
      return res.status(400).json({ code: 'params.withdrawId.required', msg: 'Withdraw Id is required' });
    }
    if (!operatorId) {
      return res.status(400).json({ code: 'params.operatorId.required', msg: 'Operator Id is required' });
    }
    const result = await moneyService.rejectWithdrawRequest(withdrawId, operatorId);
    if (result.code !== 'common.success') {
      return res.status(400).send(result)
    }
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});

router.post('/withdraw/transfer/batch', async (req, res) => {
  try {
    const operatorId = req.body.operatorId;
    if (!operatorId) {
      return res.status(400).json({ code: 'params.operatorId.required', msg: 'Operator Id is required' });
    }
    const result = await moneyService.batchTransferPlayerAccount(operatorId);
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