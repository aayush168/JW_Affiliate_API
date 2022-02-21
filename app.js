global.rootPath = __dirname;

const path = require('path');
const express = require('express');
const session = require('express-session')
const helmet = require('helmet')
const cors = require('cors');
const cron = require('node-cron');
const moment = require('moment-timezone')

const controller = require(path.join(rootPath, 'controller', 'index.js'));

const logger = require(path.join(rootPath, 'logger', 'index.js'));
const	log = logger.getLogger('app');

const db = require('./db');
const router = require('./router');
const s3 = require('./service/awsUpload.js');
const middlewares = require('./middlewares/errorHandler');

const _PORT = (process.env.httpPort) ? process.env.httpPort : 5999;

const app = express();
const appServer = require('http').createServer(app);

app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(session({ 
  secret: 'thisisyouraffiliatecreator',
  resave: true,
  saveUninitialized: true,
  cookie: { maxAge: 12 * 60 * 60 * 1000 }
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/operator', router.operator);
app.use('/role', router.role);
app.use('/modules', router.modules);
app.use('/agent', router.agentAdmin);
app.use('/setting', router.settingAdmin);
app.use('/advertisement', router.advertisementAdmin);

app.use('/api/v1/agent', router.agentClient);
app.use('/api/v1/setting', router.settingClient);
app.use('/api/v1/advertisement', router.advertisementClient);

app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

async function init() {
  try {
    await db.initialize();
    await s3.init();
    const date1 = getSettlementDates()
    controller.settlement.getSettlementData(date1.startDate, date1.endDate)
    cron.schedule('0 30 16 2 * *', () => {
      const date = getSettlementDates()
      log.info(`Monthly Settlement Cronjob started ${date.startDate} to ${date.endDate}`)
      controller.settlement.getSettlementData(date.startDate, date.endDate)
    }, {
      timezone: "Asia/Taipei"
    });
    appServer.listen(_PORT, function () {
      log.info(`Server listening on PORT: ${_PORT} mode: ${process.env.mode || 'prod'}`)
    })
  } catch (err) {
    log.error(err)
  }
}

function getSettlementDates () {
  const dateFormat = 'YYYY-MM-DD'
  const lastMonth = moment().subtract(1, 'months')
  const endDate = moment(lastMonth).endOf('months').format(dateFormat)
  const startDate = moment(lastMonth).startOf('months').format(dateFormat)
  return {
    startDate: startDate,
    endDate: endDate
  }
}

init();