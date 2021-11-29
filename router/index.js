const path = require('path');

const operator = require(path.join(rootPath, 'router', 'operator.js'))
const role = require(path.join(rootPath, 'router', 'role.js'))
const modules = require(path.join(rootPath, 'router', 'modules.js'))

const router = {
  operator: operator,
  role: role,
  modules: modules,
}

module.exports = router