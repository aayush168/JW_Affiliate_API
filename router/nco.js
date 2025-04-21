const path = require('path');
const express = require('express')
const router = express.Router();
const logger = require(path.join(rootPath, 'logger', 'index.js'));
const	log = logger.getLogger('NCO');
const ncoService = require(path.join(rootPath, 'service', 'nco.js'));
const multer = require('multer');
let xlstojson = require('xls-to-json-lc')
let xlsxtojson = require('xlsx-to-json-lc')
const { promisify } = require('util');
let fs = require('fs');
let stat = promisify(fs.stat);
let mkdir = promisify(fs.mkdir);

const upload = multer({
  storage: multer.diskStorage({
    destination: async function (req, file, cb) {
      let dirName = './uploads/';
      try {
        await stat(dirName)
        cb(null, dirName)
      } catch (error) {
        if (error && error.code === 'ENOENT') {
          await mkdir(dirName);
          cb(null, dirName)
        }
      }
    },
    filename: function (req, file, cb) {
      let datetimestamp = Date.now();
      cb(null, file.fieldname + '-' + datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length - 1])
    },
    fileFilter: function (req, file, cb) {
      let filetypes = ['xls', 'xlsx']
      console.log(file.originalname.split('.'))
      if (filetypes.indexOf(file.originalname.split('.')[file.originalname.split('.').length - 1]) === -1) {
        cb({ error: "Invalid File type" });
      }
      cb(null, true)
    },
  })
})

router.get('/getList', async function (req, res) {
  try {
    const size = req.query.size ? parseInt(req.query.size) : 20;
    const page = req.query.page ? size * (parseInt(req.query.page) - 1) : 0;
    const username = req.query.username ? req.query.username : ''
    const startDate = req.query.startDate ? req.query.startDate : ''
    const endDate = req.query.endDate ? req.query.endDate : ''
    const result = await ncoService.getNCOList(size, page, username, startDate, endDate);
    res.json(result)
  } catch (err) {
    log.error(err)
    res.status(500).send(err);
  }
})

router.post('/update', async function (req, res) {
  try {
    const ncoId = req.body.ncoId
    const amount = req.body.amount
    if (!ncoId) {
      return res.status(400).json({ code: 'params.ncoId.required', msg: 'NcoId is required.' })
    }
    if (!amount) {
      return res.status(400).json({ code: 'params.amount.required', msg: 'Amount is required.' })
    }
    const result = await ncoService.updateNco(ncoId, amount);
    if (result.code !== 'common.success') {
      return res.status(400).send(result)
    }
    res.json(result)
  } catch (err) {
    log.error(err)
    res.status(500).send(err);
  }
})

router.post('/batch/add', upload.single('addNcoFile'), async function (req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ code: 'params.file.required', msg: 'File is required.' })
    }
    const operatorId = req.body.operatorId
    // if (!operatorId) {
    //   return res.status(400).json({ code: 'params.operatorId.required', msg: 'OperatorId is required.' })
    // }
    let exceltojson = req.file.originalname.split('.')[req.file.originalname.split('.').length - 1] === 'xlsx' ? xlsxtojson : xlstojson;
    exceltojson({
      input: req.file.path,
      output: null,
      lowerCaseHeaders: true
    }, async function (err, result) {
      if (err) {
        log.error(err);
        throw err
      }
      let response = await ncoService.ncoBatchAdd(result)
      if (response.code !== 'common.success') {
        return res.status(400).send(response)
      }
      res.json(response)
    })
  } catch (err) {
    log.error(err)
    res.status(500).send(err);
  }
})

module.exports = router; 