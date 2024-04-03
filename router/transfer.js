const path = require('path');
const express = require('express')
const router = express.Router();
const logger = require(path.join(rootPath, 'logger', 'index.js'));
const	log = logger.getLogger('transfer');
const { Parser } = require('json2csv');
const transferService = require(path.join(rootPath, 'service', 'transfer.js'));
const moment = require('moment-timezone');

router.get('/getList', async function (req, res) {
  try {
    const size = req.query.size ? parseInt(req.query.size) : 20;
    const page = req.query.page ? size * (parseInt(req.query.page) - 1) : 0;
    const username = req.query.username ? req.query.username : ''
    const addTime = req.query.createdAt ? req.query.createdAt : ''
    const amount = req.query.amount ? req.query.amount : ''
    const type = req.query.type || 'search'
    const status = req.query.status === null || req.query.status === undefined || req.query.status === 'null' ? '' : parseInt(req.query.status)
    const result = await transferService.getTransferLogList(size, page, username, addTime, amount, status, type);
    if (type === 'search') {
      res.json(result)
    } else {
      let fields = [
        {
          label: 'AgentUsername',
          value: 'AgentUsername'
        },
        {
          label: 'PlayerAccount',
          value: 'PlayerAccountUsername'
        },
        {
          label: 'Amount',
          value: 'Money'
        },
        {
          label: 'Status',
          value: 'Status'
        },
        {
          label: 'Date',
          value: 'Created_at'
        }
      ]
      const json2csvParser = new Parser({ fields });
      const csv = json2csvParser.parse(result.list);
      res.attachment(`transfer_log_report_${moment(addTime).format('YYYYMMDD')}.csv`)
      res.status(200).send(csv)
    }
  } catch (err) {
    log.error(err)
    res.status(500).send(err);
  }
})

module.exports = router; 