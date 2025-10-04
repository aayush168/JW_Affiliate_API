const path = require('path');
const express = require('express')
const router = express.Router();
const logger = require(path.join(rootPath, 'logger', 'index.js'));
const log = logger.getLogger('Report');
const reportService = require(path.join(rootPath, 'service', 'report.js'));
const { Parser } = require('json2csv');
const moment = require('moment-timezone');


router.get('/deposit-turnover/getList', async function (req, res) {
  try {
    const size = req.query.size ? parseInt(req.query.size) : 20;
    const page = req.query.page ? size * (parseInt(req.query.page) - 1) : 0;
    const username = req.query.username ? req.query.username : ''
    const startDate = req.query.startDate ? req.query.startDate : ''
    const endDate = req.query.endDate ? req.query.endDate : ''
    const actionType = req.query.actionType ? req.query.actionType : 'search'
    // if (username === '') {
    //   return res.status(400).send({ code: 'code.username.required', message: 'Username is required' })
    // }
    if (startDate === '') {
      return res.status(400).send({ code: 'code.startDate.required', message: 'Start date is required' })
    }
    if (endDate === '') {
      return res.status(400).send({ code: 'code.endDate.required', message: 'End date is required' })
    }

    // Validate date range - should not exceed 3 months
    const startMoment = moment(startDate, 'YYYY-MM-DD');
    const endMoment = moment(endDate, 'YYYY-MM-DD');
    
    if (!startMoment.isValid()) {
      return res.status(400).send({ code: 'code.startDate.invalid', message: 'Invalid start date format. Use YYYY-MM-DD' })
    }
    
    if (!endMoment.isValid()) {
      return res.status(400).send({ code: 'code.endDate.invalid', message: 'Invalid end date format. Use YYYY-MM-DD' })
    }
    
    if (endMoment.isBefore(startMoment)) {
      return res.status(400).send({ code: 'code.dateRange.invalid', message: 'End date must be after start date' })
    }
    
    const daysDifference = endMoment.diff(startMoment, 'days');
    const maxDays = 92; // 3 months = 92 days max
    
    if (daysDifference > maxDays) {
      return res.status(400).send({ 
        code: 'code.dateRange.exceeded', 
        message: `Date range cannot exceed 3 months (${maxDays} days). Current range: ${daysDifference} days` 
      })
    }

    const result = await reportService.getList(size, page, username, startDate, endDate, actionType);
    if (result.code !== 'common.success') {
      return res.status(400).send({ code: result.code, message: result.message })
    }
    if (actionType === 'search') {
      res.json(result)
    } else {
      let fields = [
        {
          label: 'Player Username',
          value: 'Username'
        },
        {
          label: 'Total Turnover',
          value: 'TotalTurnover'
        },
        {
          label: 'Total Deposit',
          value: 'TotalDeposit'
        }
      ]
      const json2csvParser = new Parser({ fields });
      const csv = json2csvParser.parse(result.list);
      res.attachment(`deposit_turnover_list_${moment(startDate).format('YYYY-MM-DD')} to ${moment(endDate).format('YYYY-MM-DD')}.csv`)
      res.status(200).send(csv)
    }
  } catch (err) {
    log.error(err)
    res.status(500).send(err);
  }
})

module.exports = router; 