const path = require('path')
const { validationResult } = require('express-validator')

const agent = require(path.join(rootPath, 'validator', 'agent.js'))

const validate = (req, res, next) => {
  const errors = validationResult(req)
  if (errors.isEmpty()) {
    return next()
  }
  return res.status(400).send(errors.array()[0]['msg'])
}

module.exports = {
  validate: validate,
  agent: agent
}