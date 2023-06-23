let service = {}
const path = require('path');
const db = require(path.join(rootPath, 'db', 'index.js'));
const encrypt = require(path.join(rootPath, 'utils', 'encrypt.js'));
const ocms = require(path.join(rootPath, 'ocms', 'index.js'));
const mode = process.env.mode

service.addAgent = async ({ name, username, password, mobile, whatsapp, skype, email, revenueShareType, playerSourceType, otherSourceLink, ipAddress, telegram }) => {
  try {
    const conn = await db.getConn('extra:read')
    const conn1 = await db.getConn('extra:write')
    const conn2 = await db.getConn('jw')
    
    const agent = (await conn.query(db.sql('agent/getAgentByUsername.sql'), [ username ]))[0]
    if (agent.length > 0) {
      return { code: 'code.username.exist', msg: 'Username is already taken' }
    }
    const agentOCMS = (await conn2.query(db.sql('agent/ocms/getAgentByUsername.sql'), [ username ]))[0]
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
    if (mode && mode.includes('dev') || mode.includes('bvprod_jw') || mode === 'prod' || mode === 'jwbdtprod') {
      await ocms.createAgent(username);
      status = 1;
    }
    const salt1 = encrypt.getSalt(10)
    const salt2 = encrypt.getSalt(12)
    const encryptPassword = encrypt.encryptPassword(password, salt1, salt2);
    const result = await conn1.query({ sql: db.sql('agent/addAgent.sql'), values: [ name, username, password, encryptPassword, salt1, salt2, mobile, whatsapp, skype, email, revenueShareType, playerSourceType, otherSourceLink, ipAddress, telegram, status ]})
    const agentId = result[0].insertId
    return { code: 'common.success', agentId: agentId }
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
}

service.updateProfile = async (id, email, phone, whatsapp, skype) => {
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
    await conn1.query({ sql: db.sql('agent/updateProfile.sql'), values: [ email, phone, whatsapp, skype, id ]})
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
    let agentData
    if (mode && (mode.includes('bv') || mode.includes('ape') || mode.includes('12betkh'))) {
      agentData = (await conn.query(db.sql('agent/ocms/getDetailFromAgentChannel.sql'), [ username ]))[0];
    } else {
      agentData = (await conn.query(db.sql('agent/ocms/getAgentByUsername.sql'), [ username ]))[0];
    }
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
    return { code: 'common.success', user: { id: user.Id, username: user.Username, name: user.Name, email: user.Email, phone: user.Mobile, code: user.Code, accountType: user.AccountType, created: user.Created_at, whatsapp: user.Whatsapp, skype: user.Skype }}
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

module.exports = service;
