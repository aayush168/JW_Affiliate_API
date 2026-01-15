const { body } = require('express-validator')

const registrationRules = [
  body('name')
    .exists().withMessage({ code: 'params.name.required', msg: 'Name is required.' })
    .isLength({ min: 1 }).withMessage({ code: 'params.name.isEmpty', msg: 'Name is required.' }),
  body('username')
    .exists().withMessage({ code: 'params.username.required', msg: 'Username is required.' })
    .isLength({ min: 1 }).withMessage({ code: 'params.username.required', msg: 'Username is required.' })
    .custom(username => {
      if(username) {
        let valid = /^[a-zA-Z0-9]*$/.test(username)
        if (!valid) {
          throw { code: 'params.username.invalid', msg: 'Invalid Username'}
        }
      }
      return true
    }),
  body('password')
    .exists().withMessage({ code: 'params.password.required', msg: 'Password is required.' })
    .isLength({ min: 5, max: 50 }).withMessage({ code: 'params.password.invalid', msg: 'Password should be between 5 to 50 characters.' }),
  body('mobile')
    .exists().withMessage({ code: 'params.mobile.required', msg: 'Mobile number is required.' })
    // .custom(mobile => {
    //   if(mobile) {
    //     let valid = /^[0-9]*$/.test(mobile)
    //     if (!valid) {
    //       throw { code: 'params.mobile.invalid', msg: 'Invalid Mobile Number'}
    //     }
    //   }
    //   return true
    // }),
    .custom(mobile => {
      return true
    }),
  body('email')
    .exists().withMessage({ code: 'params.email.required', msg: 'Email is required.' })
    .isEmail().withMessage({ code: 'params.email.invalid', msg: 'Invalid Email'}),
]

const agentRegistrationRules = () => {
  return [...registrationRules]
}

module.exports = {
  agentRegistrationRules
}
