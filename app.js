global.rootPath = __dirname;
global.fetchingSettlement = false;

const path = require('path');
const express = require('express');
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
const sessionConfig = require('./middlewares/sessionConfig');
const auth = require('./middlewares/auth');

const _PORT = (process.env.httpPort) ? process.env.httpPort : 5999;

const app = express();
const appServer = require('http').createServer(app);

app.set('trust proxy', 1);
app.use(helmet());
app.use(cors({
  origin: sessionConfig.corsOrigin,
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/operator', router.operator);
app.use('/role', auth.requireOperatorAuth, router.role);
app.use('/modules', auth.requireOperatorAuth, router.modules);
app.use('/agent', auth.requireOperatorAuth, router.agentAdmin);
app.use('/setting', auth.requireOperatorAuth, router.settingAdmin);
app.use('/advertisement', auth.requireOperatorAuth, router.advertisementAdmin);
app.use('/bonus', auth.requireOperatorAuth, router.bonusAdmin);
app.use('/log', auth.requireOperatorAuth, router.log);
app.use('/credit', auth.requireOperatorAuth, router.credit);
app.use('/money', auth.requireOperatorAuth, router.moneyAdmin);
app.use('/nco', auth.requireOperatorAuth, router.nco);
app.use('/ftd', auth.requireOperatorAuth, router.ftd);
app.use('/referral', auth.requireOperatorAuth, router.referral);
app.use('/report', auth.requireOperatorAuth, router.report);
app.use('/tag', auth.requireOperatorAuth, router.agentTag);

app.use('/api/v1/agent', router.agentClient);
app.use('/api/v1/setting', router.settingClient);
app.use('/api/v1/advertisement', router.advertisementClient);
app.use('/api/v1/money', auth.requireAgentAuth, router.moneyClient);
app.use('/api/v1/bonus', router.bonusClient);

app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

async function init() {
  try {
    if (!process.env.mode) {
      throw { msg: 'mode should be set' }
    }
    await db.initialize();
    await s3.init();
    cron.schedule('0 30 13 1 * *', () => {
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