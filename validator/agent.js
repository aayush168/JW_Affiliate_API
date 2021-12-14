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
        .custom((bankName, {req}) => {
          if(req.body.paymentType === 1 && !bankName) {
            throw { code: 'params.bankName.required', msg: 'Bank Name is required'}
          }
          return true
        })
        .isLength({ max: 100 }).withMessage({ code: 'params.bankName.illegal', msg: 'Invalid Bank Name.' }),
      body('accountName')
        .custom((accountName, {req}) => {
          if(req.body.paymentType === 1 && !accountName) {
            throw { code: 'params.accountName.required', msg: 'Account Name is required'}
          }
          return true
        })
        .isLength({ max: 75 }).withMessage({ code: 'params.accountName.illegal', msg: 'Invalid Account Name.' }),
      body('accountType')
        .custom((accountType, {req}) => {
          if(req.body.paymentType === 1 && !accountType) {
            throw { code: 'params.accountType.required', msg: 'Account Type is required'}
          }
          if(accountType) {
            let allowedAccountType = [1,2,3] // 1: Saving, 2: Current, 3: Corporate
            if (!allowedAccountType.includes(accountType)) {
              throw { code: 'params.accountType.invalid', msg: 'Invalid Account Type'}
            }
          }
          return true
        }),
      body('isfc')
        .custom((isfc, {req}) => {
          if(req.body.paymentType === 1 && !isfc) {
            throw { code: 'params.isfc.required', msg: 'ISFC is required'}
          }
          return true
        })
        .isLength({ max: 11 }).withMessage({ code: 'params.isfc.illegal', msg: 'Invalid ISFC.' }),
      body('branch')
        .custom((branch, {req}) => {
          if(req.body.paymentType === 1 && !branch) {
            throw { code: 'params.branch.required', msg: 'Bank Branch is required'}
          }
          return true
        })
        .isLength({ max: 100 }).withMessage({ code: 'params.branch.illegal', msg: 'Invalid Bank Branch Name.' }),
      body('skrillAddress')
        .custom((skrillAddress, {req}) => {
          if(req.body.paymentType === 2 && !skrillAddress) {
            throw { code: 'params.skrillAddress.required', msg: 'Skrill Address is required'}
          }
          return true
        })
        .isLength({ max: 255 }).withMessage({ code: 'params.skrillAddress.illegal', msg: 'Invalid Skrill Address.' }),
      body('usdtWallet')
        .custom((usdtWallet, {req}) => {
          if(req.body.paymentType === 3 && !usdtWallet) {
            throw { code: 'params.usdtWallet.required', msg: 'USDT Wallet is required'}
          }
          return true
        })
        .isLength({ max: 255 }).withMessage({ code: 'params.usdtWallet.illegal', msg: 'Invalid USDT Wallet Address.' }),
      body('playerAccountUsername')
        .custom((playerAccountUsername, {req}) => {
          if(req.body.paymentType === 4 && !playerAccountUsername) {
            throw { code: 'params.playerAccountUsername.required', msg: 'Player Account Username is required'}
          }
          return true
        })
        .isLength({ max: 75 }).withMessage({ code: 'params.playerAccountUsername.illegal', msg: 'Invalid Player Account Username.' })
]

const agentRegistrationRules = () => {
  return [...registrationRules]
}

module.exports = {
  agentRegistrationRules
}
