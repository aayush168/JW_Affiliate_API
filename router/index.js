const path = require('path');

const operator = require(path.join(rootPath, 'router', 'operator.js'))
const role = require(path.join(rootPath, 'router', 'role.js'))
const modules = require(path.join(rootPath, 'router', 'modules.js'))
const credit = require(path.join(rootPath, 'router', 'credit.js'))
const agentAdmin = require(path.join(rootPath, 'router', 'agent', 'admin.js'))
const agentClient = require(path.join(rootPath, 'router', 'agent', 'client.js'))
const settingAdmin = require(path.join(rootPath, 'router', 'setting', 'admin.js'))
const settingClient = require(path.join(rootPath, 'router', 'setting', 'client.js'))
const advertisementAdmin = require(path.join(rootPath, 'router', 'advertisement', 'admin.js'))
const advertisementClient = require(path.join(rootPath, 'router', 'advertisement', 'client.js'))

const log = require(path.join(rootPath, 'router', 'log.js'))

const router = {
  operator: operator,
  role: role,
  modules: modules,
  agentAdmin: agentAdmin,
  agentClient: agentClient,
  settingAdmin: settingAdmin,
  settingClient: settingClient,
  advertisementAdmin: advertisementAdmin,
  advertisementClient: advertisementClient,
  log: log,
  credit: credit
}

module.exports = router