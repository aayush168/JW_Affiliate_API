const path = require('path');

const operator = require(path.join(rootPath, 'router', 'operator.js'))
const role = require(path.join(rootPath, 'router', 'role.js'))
const modules = require(path.join(rootPath, 'router', 'modules.js'))
const agentAdmin = require(path.join(rootPath, 'router', 'agent', 'admin.js'))
const agentClient = require(path.join(rootPath, 'router', 'agent', 'client.js'))
const settingAdmin = require(path.join(rootPath, 'router', 'setting', 'admin.js'))
const settingClient = require(path.join(rootPath, 'router', 'setting', 'client.js'))

const router = {
  operator: operator,
  role: role,
  modules: modules,
  agentAdmin: agentAdmin,
  agentClient: agentClient,
  settingAdmin: settingAdmin,
  settingClient: settingClient
}

module.exports = router