global.rootPath = __dirname;

const path = require('path');
const express = require('express');
const session = require('express-session')
const helmet = require('helmet')
const cors = require('cors');
const logger = require(path.join(rootPath, 'logger', 'index.js'));
const	log = logger.getLogger('app');

const db = require('./db');
const router = require('./router');
const middlewares = require('./middlewares/errorHandler');

const _PORT = (process.env.httpPort) ? process.env.httpPort : 5999;

const app = express();
const appServer = require('http').createServer(app);

app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(session({ 
  secret: 'thisisyouraffiliatecreator',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 12 * 60 * 60 * 1000 }
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/operator', router.operator);
app.use('/role', router.role);
app.use('/modules', router.modules);
app.use('/agent', router.agentAdmin);

app.use('/api/v1/agent', router.agentClient);

app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

async function init() {
  try {
    await db.initialize();
    appServer.listen(_PORT, function () {
      log.info(`Server listening on PORT: ${_PORT} mode: ${process.env.mode || 'prod'}`)
    })
  } catch (err) {
    log.error(err)
  }
}

init();