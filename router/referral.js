const path = require('path');
const express = require('express')
const router = express.Router();
const logger = require(path.join(rootPath, 'logger', 'index.js'));
const	log = logger.getLogger('Referral');
const referralService = require(path.join(rootPath, 'service', 'referral.js'));
const { Parser } = require('json2csv');
const moment = require('moment-timezone');

router.get('/getList', async function (req, res) {
  try {
    const size = req.query.size ? parseInt(req.query.size) : 20;
    const page = req.query.page ? size * (parseInt(req.query.page) - 1) : 0;
    const username = req.query.username ? req.query.username : ''
    const startDate = req.query.startDate ? req.query.startDate : ''
    const endDate = req.query.endDate ? req.query.endDate : ''
    const actionType = req.query.actionType ? req.query.actionType : 'search'
    // if (!username && actionType === 'export') {
    //   return res.status(400).send({ code: 'code.username.required', message: 'Username is required' })
    // }
    if (!startDate && actionType === 'export') {
      return res.status(400).send({ code: 'code.startDate.required', message: 'Start date is required' })
    }
    if (!endDate && actionType === 'export') {
      return res.status(400).send({ code: 'code.endDate.required', message: 'End date is required' })
    }
    const result = await referralService.getList(size, page, username, startDate, endDate, actionType);
    if (actionType === 'search') {
      res.json(result);
    } else {
      let fields = [
        {
          label: 'Username',
          value: 'Username'
        },
        {
          label: 'Referral Username',
          value: 'ReferralUsername'
        },
        {
          label: 'Valid Referral',
          value: 'IsValidReferral'
        },
        {
          label: 'Add Time',
          value: 'Created_at'
        },
      ]
      const json2csvParser = new Parser({ fields });
      const csv = json2csvParser.parse(result.list);
      res.attachment(`referral_list_${moment(startDate).format('YYYY-MM-DD')} to ${moment(endDate).format('YYYY-MM-DD')}.csv`)
      res.status(200).send(csv)
    }
  } catch (err) {
    log.error(err)
    res.status(500).send(err);
  }
})

module.exports = router;