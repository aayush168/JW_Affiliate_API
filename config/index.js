const path = require('path');
const mode = (process.env.mode) ? process.env.mode : 'prod';
const db = require(path.join(rootPath, 'config', mode,  `config.database.json`));
const app = require(path.join(rootPath, 'config', mode, `config.app.json`));
const commission = require(path.join(rootPath, 'config', mode, `config.commission.json`));
const settings = require(path.join(rootPath, 'config', mode, `config.settings.json`));
const ocms = require(path.join(rootPath, "config", mode, `config.ocms.json`));
const enumStatus = require(path.join(rootPath, 'config', `config.enum.json`));

let config = {
  db: db,
  app: app,
  commission: commission,
  settings: settings,
  ocms: ocms,
  enum: enumStatus
};

module.exports = config;