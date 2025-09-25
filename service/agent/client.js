let service = {}
const path = require('path');
const db = require(path.join(rootPath, 'db', 'index.js'));
const encrypt = require(path.join(rootPath, 'utils', 'encrypt.js'));
const mail = require(path.join(rootPath, 'utils', 'sendEmail.js'));
const ocms = require(path.join(rootPath, 'ocms', 'index.js'));
const mode = process.env.mode
const moment = require('moment-timezone');

service.addAgent = async ({ name, username, password, mobile, whatsapp, skype, email, businessEmail, revenueShareType, playerSourceType, otherSourceLink, ipAddress, telegram, dob, referralUsername }) => {
  try {
    const conn = await db.getConn('extra:read')
    const conn1 = await db.getConn('extra:write')
    const conn2 = await db.getConn('jw')
    const agent = (await conn.query(db.sql('agent/getAgentByUsername.sql'), [ username ]))[0]
    if (agent.length > 0) {
      return { code: 'code.username.exist', msg: 'Username is already taken' }
    }
    let agentOCMS;
    if (mode && mode === 'siprod') {
      agentOCMS = (await conn2.query(db.sql('agent/ocms/getAgentByUsername.sql'), [ username ]))[0]
    } else {
      agentOCMS = (await conn2.query(db.sql('agent/ocms/getDetailFromAgentChannel.sql'), [ username ]))[0];
    }
    if (agentOCMS.length > 0) {
      return { code: 'code.username.exist', msg: 'Username is already taken' }
    }
    const agentMobile = (await conn.query(db.sql('agent/getAgentByMobile.sql'), [ mobile ]))[0]
    if (agentMobile.length > 0) {
      return { code: 'code.phone.exist', msg: 'Number is already taken' }
    }
    const agentEmail = (await conn.query(db.sql('agent/getAgentByEmail.sql'), [ email ]))[0]
    if (agentEmail.length > 0) {
      return { code: 'code.email.exist', msg: 'Email is already taken' }
    }
    const agentBusinessEmail = (await conn.query(db.sql('agent/getAgentByBusinessEmail.sql'), [ businessEmail ]))[0]
    if (agentBusinessEmail.length > 0) {
      return { code: 'code.businessEmail.exist', msg: 'Business Email is already taken' }
    }
    if (whatsapp) {
      const agentWhatsapp = (await conn.query(db.sql('agent/getAgentByWhatsapp.sql'), [ whatsapp ]))[0]
      if (agentWhatsapp.length > 0) {
        return { code: 'code.whatsapp.exist', msg: 'Whatsapp id is already taken' }
      }
    }
    if (skype) {
      const agentSkype = (await conn.query(db.sql('agent/getAgentBySkype.sql'), [ skype ]))[0]
      if (agentSkype.length > 0) {
        return { code: 'code.skype.exist', msg: 'Skype id is already taken' }
      }
    }
    if (telegram) {
      const agentTelegram = (await conn.query(db.sql('agent/getAgentByTelegram.sql'), [ telegram ]))[0]
      if (agentTelegram.length > 0) {
        return { code: 'code.telegram.exist', msg: 'Telegram id is already taken' }
      }
    }
    let status = 0;
    if (mode && mode.includes('dev') || mode.includes('bvprod_jw') || mode === 'prod' || mode === 'jwbdtprod' || mode === 'jwpkrprod') {
      try {
        await ocms.createAgent(username, name);
        status = 1;
      } catch (err) {
        if (err.response.body.code === 'channel.name.exist') {
          return { code: 'channel.name.exist', msg: 'Name is already taken' }
        }
        console.log(err.response.body, 'ocms error');
        throw new Error(err);
      }
    }
    const salt1 = encrypt.getSalt(10)
    const salt2 = encrypt.getSalt(12)
    const encryptPassword = encrypt.encryptPassword(password, salt1, salt2);
    const result = await conn1.query({ sql: db.sql('agent/addAgent.sql'), values: [ name, username, password, encryptPassword, salt1, salt2, mobile, whatsapp, skype, email, businessEmail, revenueShareType, playerSourceType, otherSourceLink, ipAddress, telegram, dob, referralUsername, status ]})
    const agentId = result[0].insertId
    return { code: 'common.success', agentId: agentId }
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
}

service.updateProfile = async (id, email, businessEmail, phone, whatsapp, skype) => {
  try {
    let conn = await db.getConn('extra:read')
    let conn1 = await db.getConn('extra:write')
    let agent = (await conn.query(db.sql('agent/getAgentById.sql'), [ id ]))[0];
    if (agent.length === 0) {
      return { code: "code.agent.noExist", msg: "Agent Not Found" }
    }
    const agentMobile = (await conn.query(db.sql('agent/getAgentByMobile.sql'), [ phone ]))[0]
    if (agentMobile.length > 0) {
      return { code: 'code.phone.exist', msg: 'Number is already taken' }
    }
    const agentEmail = (await conn.query(db.sql('agent/getAgentByEmail.sql'), [ email ]))[0]
    if (agentEmail.length > 0) {
      return { code: 'code.email.exist', msg: 'Email is already taken' }
    }
    const agentBusinessEmail = (await conn.query(db.sql('agent/getAgentByBusinessEmail.sql'), [ businessEmail ]))[0]
    if (agentBusinessEmail.length > 0) {
      return { code: 'code.businessEmail.exist', msg: 'Business Email is already taken' }
    }
    await conn1.query({ sql: db.sql('agent/updateProfile.sql'), values: [ email, businessEmail, phone, whatsapp, skype, id ]})
    return { code: 'common.success' }
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
}


service.resetPassword = async (id, oldPassword, newPassword) => {
  try {
    let conn = await db.getConn('extra:read')
    let conn1 = await db.getConn('extra:write')
    let user = (await conn.query(db.sql('agent/getAgentById.sql'), [ id ]))[0][0];
    if (user.Password !== encrypt.encryptPassword(oldPassword, user.Salt1, user.Salt2)) {
      return { code: 'code.password.invalid', msg: 'Old Password does not match.' }
    }
    const salt1 = encrypt.getSalt(10)
    const salt2 = encrypt.getSalt(12)
    const encryptPassword = encrypt.encryptPassword(newPassword, salt1, salt2);
    await conn1.query({ sql: db.sql('agent/updatePassword.sql'), values: [ encryptPassword, newPassword, salt1, salt2, id ]})
    return { code: 'common.success' }
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
}


function generateResetLink(baseUrl, langCode, userId, token) {
  return `${baseUrl}/${langCode}/reset-password?token=${token}&userId=${userId}`;
}

function generateExpiryTime() {
  const expiryTime = moment().add(30, 'minutes').format('YYYY-MM-DD HH:mm:ss'); // Set expiry 30 minutes from now
  return expiryTime;
}

function checkTokenExpiry(storedExpiryTime) {
  const currentTime = moment().format('YYYY-MM-DD HH:mm:ss');
  const isExpired = moment(storedExpiryTime).isAfter(currentTime); // Checks if current time is after the expiry time
  return isExpired;
}

service.forgotPassword = async (email, langCode, currency) => {
  try {
    if (currency !== 'PKR') {
      return { code: 'code.system.support', msg: 'Feature not supported' }
    }
    const baseUrl = 'https://jeetwinaffiliates.com'
    let conn = await db.getConn('extra:read')
    let conn1 = await db.getConn('extra:write')
    let result = (await conn.query(db.sql('agent/getAgentByEmail.sql'), [ email ]))[0];
    if (result.length === 0) {
      return { code: 'code.email.invalid', msg: 'Invalid email' }
    }
    const resetToken = encrypt.generateResetToken();
    const user = result[0]
    const userId = user.Id
    const link = generateResetLink(baseUrl, langCode, userId, resetToken)
    const expiryTime = generateExpiryTime()
    // need to hash resetToken
    await conn1.query(db.sql('agent/addAgentResetPassword.sql'), [ userId, link, expiryTime, resetToken ]);
    mail.sendMail(email, link);
    return { code: 'common.success' }
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
}

service.resetPasswordTokenVerify = async (token, userId) => {
  try {
    let conn = await db.getConn('extra:read')
    let result = (await conn.query(db.sql('agent/getResetPasswordToken.sql'), [ token, userId ]))[0];
    if (result.length === 0) {
      return { code: 'code.token.noExist', msg: 'Invalid token' }
    }
    const tokenData = result[0]
    const expiryTime = tokenData.ExpiryTime
    const validToken = checkTokenExpiry(expiryTime);
    if (!validToken) {
      return { code: 'code.token.expired', msg: 'Token Expired' }
    }
    return { code: 'common.success' }
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
}

service.resetNewPassword = async (id, password, newPassword) => {
  try {
    let conn = await db.getConn('extra:read')
    let conn1 = await db.getConn('extra:write')
    let user = (await conn.query(db.sql('agent/getAgentById.sql'), [ id ]))[0];
    if (user.length === 0) {
      return { code: 'code.user.noExist', msg: 'Invalid User, Please try again' }
    }
    if (password !== newPassword) {
      return { code: 'code.password.invalid', msg: 'Password does not match.' }
    }
    const salt1 = encrypt.getSalt(10)
    const salt2 = encrypt.getSalt(12)
    const encryptPassword = encrypt.encryptPassword(password, salt1, salt2);
    await conn1.query({ sql: db.sql('agent/updatePassword.sql'), values: [ encryptPassword, newPassword, salt1, salt2, id ]})
    return { code: 'common.success' }
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
}

service.getBalance = async (id) => {
  try {
    let conn = await db.getConn('extra:read')
    let result = (await conn.query({ sql: db.sql('agent/getBalance.sql'), values: [ id ] }))[0];
    let balance = 0;
    if (result.length > 0) {
      balance = result[0].Balance;
    }
    return { code: 'common.success', balance: balance }
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
}

service.getAgentPaymentInfo = async (id) => {
  try {
    let conn = await db.getConn('extra:read')
    let result = (await conn.query({ sql: db.sql('agent/getPaymentInfo.sql'), values: [ id ] }))[0];
    if (result.length > 0) {
      return { code: 'common.success', data: result[0] }
    } else {
      return { code: 'common.success', data: {} }
    }
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
}

service.addAgentBankInfo = async ({ agentId, paymentType, bankName, accountName, accountNumber, bankAccountType, isfc, branch }) => {
  try {
    let conn = await db.getConn('extra:write')
    await conn.query({ sql: db.sql('agent/addBankInfo.sql'), values: [ agentId, paymentType, bankName, accountName, accountNumber, bankAccountType, isfc, branch ]})
    return { code: 'common.success' }
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
}

service.addAgentIntBankInfo = async ({ agentId, paymentType, bankName, accountName, accountNumber, bankAccountType, swiftCode, currency, branch }) => {
  try {
    const remarks = ""
    let conn = await db.getConn('extra:write')
    await conn.query({ sql: db.sql('agent/addIntBankInfo.sql'), values: [ agentId, paymentType, bankName, accountName, accountNumber, bankAccountType, swiftCode, currency, branch, remarks ]})
    return { code: 'common.success' }
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
}

service.addAgentSkrillInfo = async ({ agentId, paymentType, skrillAddress }) => {
  try {
    let conn = await db.getConn('extra:write')
    await conn.query({ sql: db.sql('agent/addSkrillAddress.sql'), values: [ agentId, paymentType, skrillAddress ]})
    return { code: 'common.success' }
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
}

service.addAgentUsdtWalletInfo = async ({ agentId, paymentType, usdtWallet }) => {
  try {
    let conn = await db.getConn('extra:write')
    await conn.query({ sql: db.sql('agent/addUsdtWallet.sql'), values: [ agentId, paymentType, usdtWallet ]})
    return { code: 'common.success' }
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
}

service.checkAgentPlayerAccountUsername = async (playerAccountUsername) => {
  try {
    let jwconn = await db.getConn('jw');
    let conn = await db.getConn('extra:read');
    const result = (await jwconn.query({ sql: db.sql('agent/ocms/getPlayerAccountByUsername.sql'), values: [ playerAccountUsername ]}))[0]
    if (result.length === 0) {
      return { code: 'code.playerAccountUsername.invalid', msg: 'Invalid Player Account Username' }
    }
    const result1 = (await conn.query({ sql: db.sql('agent/getPlayerAccountByUsername.sql'), values: [ playerAccountUsername ]}))[0]
    if (result1.length > 0) {
      return { code: 'code.playerAccountUsername.exist', msg: 'Player Account already linked to other affiliate account' }
    }
    return { code: 'common.success' }
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
}

service.checkAgentBankAccountNumber = async (accountNumber) => {
  try {
    let conn = await db.getConn('extra:read');
    const result = (await conn.query({ sql: db.sql('agent/getAgentBankAccount.sql'), values: [ accountNumber ]}))[0]
    if (result.length > 0) {
      return { code: 'code.accountNumber.exist', msg: 'Bank Account Number is already linked with other account' }
    }
    return { code: 'common.success' }
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
}

service.checkAgentIntBankAccountNumber = async (accountNumber) => {
  try {
    let conn = await db.getConn('extra:read');
    const result = (await conn.query({ sql: db.sql('agent/getAgentIntBankAccount.sql'), values: [ accountNumber ]}))[0]
    if (result.length > 0) {
      return { code: 'code.accountNumber.exist', msg: 'Bank Account Number is already linked with other account' }
    }
    return { code: 'common.success' }
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
}

service.checkAgentSkrillAdress = async (skrillAddress) => {
  try {
    let conn = await db.getConn('extra:read');
    const result = (await conn.query({ sql: db.sql('agent/getAgentSkrillAddress.sql'), values: [ skrillAddress ]}))[0]
    if (result.length > 0) {
      return { code: 'code.skrillAddress.exist', msg: 'Skrill Address is already linked with other account' }
    }
    return { code: 'common.success' }
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
}

service.checkAgentUsdtAddress = async (usdtWallet) => {
  try {
    let conn = await db.getConn('extra:read');
    const result = (await conn.query({ sql: db.sql('agent/getAgentUsdtWallet.sql'), values: [ usdtWallet ]}))[0]
    if (result.length > 0) {
      return { code: 'code.usdtWallet.exist', msg: 'USDT Wallet Account is already linked with other account' }
    }
    return { code: 'common.success' }
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
}

service.checkAgentBkashAddress = async (bkashWallet) => {
  try {
    let conn = await db.getConn('extra:read');
    const result = (await conn.query({ sql: db.sql('agent/getAgentBkashWallet.sql'), values: [ bkashWallet ]}))[0]
    if (result.length > 0) {
      return { code: 'code.bkashWallet.exist', msg: 'Bkash Wallet Account is already linked with other account' }
    }
    return { code: 'common.success' }
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
}

service.checkAgentNagadAddress = async (nagadWallet) => {
  try {
    let conn = await db.getConn('extra:read');
    const result = (await conn.query({ sql: db.sql('agent/getAgentNagadWallet.sql'), values: [ nagadWallet ]}))[0]
    if (result.length > 0) {
      return { code: 'code.nagadWallet.exist', msg: 'Nagad Wallet Account is already linked with other account' }
    }
    return { code: 'common.success' }
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
}

service.checkAgentRocketAddress = async (rocketWallet) => {
  try {
    let conn = await db.getConn('extra:read');
    const result = (await conn.query({ sql: db.sql('agent/getAgentRocketWallet.sql'), values: [ rocketWallet ]}))[0]
    if (result.length > 0) {
      return { code: 'code.rocketWallet.exist', msg: 'Rocket Wallet Account is already linked with other account' }
    }
    return { code: 'common.success' }
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
}

service.addAgentPlayerInfo = async ({ agentId, paymentType, playerAccountUsername }) => {
  try {
    let conn = await db.getConn('extra:write')
    await conn.query({ sql: db.sql('agent/addPlayerAccount.sql'), values: [ agentId, paymentType, playerAccountUsername ]})
    return { code: 'common.success' }
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
}


service.addAgentBdtBankInfo = async ({ agentId, paymentType, bankName, accountName, accountNumber, bankAccountType, branch }) => {
  try {
    let conn = await db.getConn('extra:write')
    await conn.query({ sql: db.sql('agent/addBdtBankInfo.sql'), values: [ agentId, paymentType, bankName, accountName, accountNumber, bankAccountType, branch ]})
    return { code: 'common.success' }
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
}


service.addAgentBkashInfo = async ({ agentId, paymentType, bkashWallet }) => {
  try {
    let conn = await db.getConn('extra:write')
    await conn.query({ sql: db.sql('agent/addBkashWallet.sql'), values: [ agentId, paymentType, bkashWallet ]})
    return { code: 'common.success' }
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
}

service.addAgentNagadtInfo = async ({ agentId, paymentType, nagadWallet }) => {
  try {
    let conn = await db.getConn('extra:write')
    await conn.query({ sql: db.sql('agent/addNagadWallet.sql'), values: [ agentId, paymentType, nagadWallet ]})
    return { code: 'common.success' }
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
}

service.addAgentRocketInfo = async ({ agentId, paymentType, rocketWallet }) => {
  try {
    let conn = await db.getConn('extra:write')
    await conn.query({ sql: db.sql('agent/addRocketWallet.sql'), values: [ agentId, paymentType, rocketWallet ]})
    return { code: 'common.success' }
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
}

service.addAgentBvBankInfo = async ({ agentId, paymentType, bankName, accountName, accountNumber, branch }) => {
  try {
    let conn = await db.getConn('extra:write')
    await conn.query({ sql: db.sql('agent/addBvBankInfo.sql'), values: [ agentId, paymentType, bankName, accountName, accountNumber, branch ]})
    return { code: 'common.success' }
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
}

service.addAgent12BetBankInfo = async ({ agentId, paymentType, bankName, accountName, accountNumber }) => {
  try {
    let conn = await db.getConn('extra:write')
    await conn.query({ sql: db.sql('agent/add12BetBankInfo.sql'), values: [ agentId, paymentType, bankName, accountName, accountNumber ]})
    return { code: 'common.success' }
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
}

service.login = async (username, password) => {
  try {
    let conn = await db.getConn('jw')
    let conn1 = await db.getConn('extra:read')
    let mode = process.env.mode
    let result = (await conn1.query(db.sql('agent/getAgentByUsername.sql'), [ username ]))[0];
    if (result.length === 0) {
      return { code: 'code.agent.noExist', user: null }
    }
    if (result[0].Status === 3) {
      return { code: 'code.account.rejected', user: null }
    }
    let agentData = (await conn.query(db.sql('agent/ocms/getDetailFromAgentChannel.sql'), [ username ]))[0];
    if (agentData.length === 0 || result[0].Status === 2) {
      return { code: 'code.account.review', user: null }
    }
    if (result[0].Status !== 1) {
      return { code: 'code.account.disabled', user: null }
    }
    let user = {
      ...result[0],
      ...agentData[0]
    }
    if (user.Password !== encrypt.encryptPassword(password, user.Salt1, user.Salt2)) {
      return { code: 'code.auth.login.invalid', user: null }
    }
    return { code: 'common.success', user: { id: user.Id, username: user.Username, name: user.Name, agentCodeName: user.AgentCodeName, email: user.Email, businessEmail: user.BusinessEmail || '', phone: user.Mobile, code: user.Code, accountType: user.AccountType, created: user.Created_at, whatsapp: user.Whatsapp, skype: user.Skype, token: user.Token }}
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
}

service.getDomainList = async (agentId) => {
  try {
    let conn = await db.getConn('jw')
    let result = (await conn.query({ sql: db.sql('agent/ocms/getDomainUrl.sql'), values: [ agentId ] }))[0];
    return { code: 'common.success', list: result }
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
}

service.getWithdrawList = async (size, page, startDate, endDate, agentId) => {
  try {
    let conn = await db.getConn('extra:read')
    let result = (await conn.query({ sql: db.sql('agent/getWithdrawList.sql'), values: [ agentId, `${startDate} 00:00:00`, `${endDate} 23:59:59`, page, size ] }))[0];
    const rowCount = (await conn.query({ sql: db.sql('agent/getWithdrawListCount.sql'), values: [ agentId, `${startDate} 00:00:00`, `${endDate} 23:59:59`, ] }))[0]
    return { code: 'common.success', list: result, rowCount: rowCount[0].Count }
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
}

service.getCreditList = async (size, page, startDate, endDate, agentId) => {
   try {
    let conn = await db.getConn('extra:read')
    let result = (await conn.query({ sql: db.sql('agent/getCreditList.sql'), values: [ agentId, `${startDate} 00:00:00`, `${endDate} 23:59:59`, page, size ] }))[0];
    const rowCount = (await conn.query({ sql: db.sql('agent/getCreditListCount.sql'), values: [ agentId, `${startDate} 00:00:00`, `${endDate} 23:59:59`, ] }))[0]
    return { code: 'common.success', list: result, rowCount: rowCount[0].Count }
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
}

module.exports = service;
