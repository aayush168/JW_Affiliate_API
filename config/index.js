let path = require('path');
let mode = (process.env.mode) ? process.env.mode : 'prod';
let db = require(path.join(rootPath, 'config', mode,  `config.database.json`));

let config = {
  db: db
};

module.exports = config;