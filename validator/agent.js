const { body } = require('express-validator')

const registrationRules = [
  body('name')
    .exists().withMessage({ code: 'params.name.required', msg: 'Name is required.' })
    .isLength({ min: 1 }).withMessage({ code: 'params.name.isEmpty', msg: 'Name is required.' }),
  body('username')
    .exists().withMessage({ code: 'params.username.required', msg: 'Username is required.' })
    .isLength({ min: 1 }).withMessage({ code: 'params.username.required', msg: 'Username is required.' }),
  body('password')
    .exists().withMessage({ code: 'params.password.required', msg: 'Password is required.' })
    .isLength({ min: 5, max: 50 }).withMessage({ code: 'params.password.invalid', msg: 'Password should be between 5 to 50 characters.' }),
  body('mobile')
    .exists().withMessage({ code: 'params.mobile.required', msg: 'Mobile number is required.' })
    .custom(mobile => {
      if(mobile) {
        let valid = /^[0-9]*$/.test(mobile)
        if (!valid) {
          throw { code: 'params.mobile.invalid', msg: 'Invalid Mobile Number'}
        }
      }
      return true
    }),
  body('email')
    .exists().withMessage({ code: 'params.email.required', msg: 'Email is required.' })
    .isEmail().withMessage({ code: 'params.email.invalid', msg: 'Invalid Email'}),
  body('whatsapp')
    .custom(whatsapp => {
      if(whatsapp) {
        let valid = /^[0-9]*$/.test(whatsapp)
        if (!valid) {
          throw { code: 'params.mobile.invalid', msg: 'Invalid Whatsapp Number'}
        }
      }
      return true
    }),
    body('skype')
      .custom(skype => {
        return true
      }),
    body('revenueShareType')
      .exists().withMessage({ code: 'params.revenueShareType.required', msg: 'Revenue Share Type is required.' })
      .custom(revenueShareType => {
        if(revenueShareType) {
          let allowedRevenueShareType = [1,2] // 1: Weekly Revenue Share, 2: Monthly Revenue Share
          if (!allowedRevenueShareType.includes(revenueShareType)) {
            throw { code: 'params.revenueShareType.invalid', msg: 'Invalid Revenue Share Type'}
          }
        }
        return true
      }),
      body('playerSourceType')
        .exists().withMessage({ code: 'params.playerSourceType.required', msg: 'Player Source type is required.' })
        .isArray().withMessage({ code: 'params.playerSourceType.invalid', msg: 'Invalid Player Source type.' }),
      body('paymentType')
        .exists().withMessage({ code: 'params.paymentType.required', msg: 'Payment type is required.' }),
      body('bankName')
        .isLength({ max: 100 }).withMessage({ code: 'params.bankName.illegal', msg: 'Invalid Bank Name.' }),
      body('accountName')
        .isLength({ max: 75 }).withMessage({ code: 'params.accountName.illegal', msg: 'Invalid Account Name.' }),
      body('isfc')
        .isLength({ max: 11 }).withMessage({ code: 'params.isfc.illegal', msg: 'Invalid ISFC.' }),
      body('branch')
        .isLength({ max: 100 }).withMessage({ code: 'params.branch.illegal', msg: 'Invalid Bank Branch Name.' }),
      body('skrillAddress')
        .isLength({ max: 255 }).withMessage({ code: 'params.skrillAddress.illegal', msg: 'Invalid Skrill Address.' }),
      body('usdtWallet')
        .isLength({ max: 255 }).withMessage({ code: 'params.usdtWallet.illegal', msg: 'Invalid USDT Wallet Address.' }),
      body('playerAccountUsername')
        .isLength({ max: 75 }).withMessage({ code: 'params.playerAccountUsername.illegal', msg: 'Invalid Player Account Username.' })
]

const agentRegistrationRules = () => {
  return [...registrationRules]
}

module.exports = {
  agentRegistrationRules
}
