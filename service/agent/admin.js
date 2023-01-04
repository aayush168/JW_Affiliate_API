let service = {}
const path = require('path');
let db = require(path.join(rootPath, 'db', 'index.js'));
let moment = require('moment-timezone');
let encrypt = require(path.join(rootPath, 'utils', 'encrypt.js'))
const mode = process.env.mode;

service.getAgentList = async (size, offset, { username, name, email, mobile, createdAt, status, playerSourceType, paymentType, accountType }) => {
  try {
    let conn = await db.getConn('extra:read')
    
    let sql
    if (mode === 'jwbdtprod') {
      sql = db.sql('agent/getBdtAgentList.sql')
    } else if (mode.includes('bvprod') || mode.includes('12betkh') || mode.includes('apeprod')) {
      sql = db.sql('agent/getBvAgentList.sql')
    } else {
      sql = db.sql('agent/getAgentList.sql')
    }
    sql = sql.replace('${Name}', (name === '') ? '' : ` AND a.Name LIKE "%${name}%"`)
    sql = sql.replace('${Email}', (email === '') ? '' : ` AND a.Email LIKE "%${email}%"`)
    sql = sql.replace('${Mobile}', (mobile === '') ? '' : ` AND a.Mobile LIKE "%${mobile}%"`)
    sql = sql.replace('${Status}', (status === '') ? '' : `AND a.Status = ${status}`)
    sql = sql.replace('${CreatedAt}', (createdAt === '') ? '' : `AND a.Created_at >= "${createdAt}"`)
    sql = sql.replace('${PaymentTypeId}', (paymentType === '') ? '' : `AND ap.PaymentTypeId = ${paymentType}`)
    sql = sql.replace('${AccountType}', (accountType === '') ? '' : `AND a.AccountType = ${accountType}`)
    sql = sql.replace('${PlayerSoruceType}', (playerSourceType === '') ? '' : `AND FIND_IN_SET(${playerSourceType}, a.PlayerSourceType) > 0`)
    const result = (await conn.query({ sql: sql, values: [ `%${username}%`, offset, size ]}));

    let sqlCount = db.sql('agent/getAgentListCount.sql')
    sqlCount = sqlCount.replace('${Name}', (name === '') ? '' : ` AND a.Name LIKE "%${name}%"`)
    sqlCount = sqlCount.replace('${Email}', (email === '') ? '' : ` AND a.Email LIKE "%${email}%"`)
    sqlCount = sqlCount.replace('${Mobile}', (mobile === '') ? '' : ` AND a.Mobile LIKE "%${mobile}%"`)
    sqlCount = sqlCount.replace('${Status}', (status === '') ? '' : `AND a.Status = ${status}`)
    sqlCount = sqlCount.replace('${CreatedAt}', (createdAt === '') ? '' : `AND a.Created_at >= "${createdAt}"`)
    sqlCount = sqlCount.replace('${PaymentTypeId}', (paymentType === '') ? '' : `AND ap.PaymentTypeId = ${paymentType}`)
    sqlCount = sqlCount.replace('${AccountType}', (accountType === '') ? '' : `AND a.AccountType = ${accountType}`)
    sqlCount = sqlCount.replace('${PlayerSoruceType}', (playerSourceType === '') ? '' : `AND FIND_IN_SET(${playerSourceType}, a.PlayerSourceType)`)
    const rowCount = (await conn.query({ sql: sqlCount, values: [ `%${username}%` ]}))[0];
    return { code: 'common.success', list: result[0], rowCount: rowCount[0].Count }
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
}


service.updateAgentProfile = async ({ name, username, password, mobile, email, whatsapp, skype, playerSourceType, otherSourceLink, status, remark, telegram }, id) => {
  try {
    let conn = await db.getConn('extra:read')
    let conn1 = await db.getConn('extra:write')
    let agent = (await conn.query(db.sql('agent/getAgentById.sql'), [ id ]))[0];
    if (agent.length === 0) {
      return { code: "code.agent.noExist", msg: "Agent Not Found" }
    }
    if (agent[0].Username !== username) {
      const agentUsername = (await conn.query(db.sql('agent/getAgentByUsername.sql'), [ username ]))[0]
      if (agentUsername.length > 0) {
        return { code: 'code.username.exist', msg: 'Username is already taken' }
      }
    }
    const salt1 = encrypt.getSalt(10)
    const salt2 = encrypt.getSalt(12)
    const agentPassword = encrypt.encryptPassword(password, salt1, salt2);
    await conn1.query({ sql: db.sql('agent/updateAgentProfile.sql'), values: [ name, username, password, agentPassword, salt1, salt2, mobile, whatsapp, skype, email, playerSourceType, otherSourceLink, status, remark, telegram, id ]})
    return { code: 'common.success' }
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
}

service.updateAgentStatus = async (status, id, remark) => {
  try {
    let conn = await db.getConn('extra:read')
    let conn1 = await db.getConn('extra:write')
    let agent = (await conn.query(db.sql('agent/getAgentById.sql'), [ id ]))[0];
    if (agent.length === 0) {
      return { code: "code.agent.noExist", msg: "Agent Not Found" }
    }
    await conn1.query({ sql: db.sql('agent/updateAgentStatus.sql'), values: [ status, remark, id ]})
    return { code: 'common.success' }
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
}

service.getAgentRegisteredToday = async () => {
  try {
    let conn = await db.getConn('extra:read')
    const start = moment().format('YYYY-MM-DD 00:00:00')
    const end = moment().format('YYYY-MM-DD 23:59:59')
    const result = (await conn.query({ sql: db.sql('agent/getAgentRegisteredCount.sql'), values: [start, end]}))[0]
    return { code: 'common.success', detail: result[0] }
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
}

service.addAgent = async (name, username, password) => {
  try {
    const conn = await db.getConn('extra:read')
    const conn1 = await db.getConn('extra:write')
    const conn2 = await db.getConn('jw')
    const agent = (await conn.query(db.sql('agent/getAgentByUsername.sql'), [ username ]))[0]
    if (agent.length > 0) {
      return { code: 'code.username.exist', msg: 'Username is already taken' }
    }
    let mode = process.env.mode
    let agentOCMS
    if (mode && mode.includes('bv') || mode.includes('ape') || mode.includes('12bet')) {
      agentOCMS = (await conn2.query(db.sql('agent/ocms/getDetailFromAgentChannel.sql'), [ username ]))[0];
    } else {
      agentOCMS = (await conn2.query(db.sql('agent/ocms/getAgentByUsername.sql'), [ username ]))[0];
    }
    if (agentOCMS.length > 0 && agent.length > 0) {
      return { code: 'code.username.exist', msg: 'Username is already taken' }
    }
    const salt1 = encrypt.getSalt(10)
    const salt2 = encrypt.getSalt(12)
    const encryptPassword = encrypt.encryptPassword(password, salt1, salt2);
    await conn1.query({ sql: db.sql('agent/addAgentManual.sql'), values: [ name, username, password, encryptPassword, salt1, salt2 ]})
    return { code: 'common.success' }
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
}

service.updateAgentAccountType = async ({ accountType, agentId }) => {
  try {
    let conn = await db.getConn('extra:read')
    let conn1 = await db.getConn('extra:write')
    let agent = (await conn.query(db.sql('agent/getAgentById.sql'), [ agentId ]))[0];
    if (agent.length === 0) {
      return { code: "code.agent.noExist", msg: "Agent Not Found" }
    }
    await conn1.query({ sql: db.sql('agent/updateAccountType.sql'), values: [ accountType, agentId ]})
    return { code: 'common.success' }
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
}

service.updateAgentBankInfo = async ({ agentId, paymentType, bankName, accountName, accountNumber, bankAccountType, ifsc, branch }) => {
  try {
    let conn = await db.getConn('extra:write')
    await conn.query({ sql: db.sql('agent/updateBankInfo.sql'), values: [ bankName, accountName, accountNumber, bankAccountType, ifsc, branch, paymentType, agentId ]})
    return { code: 'common.success' }
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
}


service.updateAgentSkrillInfo = async ({ agentId, paymentType, skrillAddress }) => {
  try {
    let conn = await db.getConn('extra:write')
    await conn.query({ sql: db.sql('agent/updateSkrillAddress.sql'), values: [ skrillAddress, paymentType, agentId ]})
    return { code: 'common.success' }
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
}

service.updateAgentUsdtWalletInfo = async ({ agentId, paymentType, usdtWallet }) => {
  try {
    let conn = await db.getConn('extra:write')
    await conn.query({ sql: db.sql('agent/updateUsdtWallet.sql'), values: [ usdtWallet, paymentType, agentId ]})
    return { code: 'common.success' }
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
}

service.updateAgentPlayerInfo = async ({ agentId, paymentType, playerAccountUsername }) => {
  try {
    let conn = await db.getConn('extra:write')
    await conn.query({ sql: db.sql('agent/updatePlayerAccount.sql'), values: [ playerAccountUsername, paymentType, agentId ]})
    return { code: 'common.success' }
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
}


service.updateAgentBdtBankInfo = async ({ agentId, paymentType, bankName, accountName, accountNumber, bankAccountType, branch }) => {
  try {
    let conn = await db.getConn('extra:write')
    await conn.query({ sql: db.sql('agent/updateBdtBankInfo.sql'), values: [ bankName, accountName, accountNumber, bankAccountType, branch, paymentType, agentId ]})
    return { code: 'common.success' }
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
}


service.updateAgentBkashInfo = async ({ agentId, paymentType, bkashWallet }) => {
  try {
    let conn = await db.getConn('extra:write')
    await conn.query({ sql: db.sql('agent/updateBkashWallet.sql'), values: [ bkashWallet, paymentType, agentId ]})
    return { code: 'common.success' }
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
}

service.updateAgentNagadtInfo = async ({ agentId, paymentType, nagadWallet }) => {
  try {
    let conn = await db.getConn('extra:write')
    await conn.query({ sql: db.sql('agent/updateNagadWallet.sql'), values: [ nagadWallet, paymentType, agentId ]})
    return { code: 'common.success' }
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
}

service.updateAgentRocketInfo = async ({ agentId, paymentType, rocketWallet }) => {
  try {
    let conn = await db.getConn('extra:write')
    await conn.query({ sql: db.sql('agent/updateRocketWallet.sql'), values: [ rocketWallet, paymentType, agentId ]})
    return { code: 'common.success' }
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
}

service.updateAgentBvBankInfo = async ({ agentId, paymentType, bankName, accountName, accountNumber, branch }) => {
  try {
    let conn = await db.getConn('extra:write')
    await conn.query({ sql: db.sql('agent/updateBvBankInfo.sql'), values: [ bankName, accountName, accountNumber, branch, paymentType, agentId ]})
    return { code: 'common.success' }
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
}

service.update12BetBankInfo = async ({ agentId, paymentType, bankName, accountName, accountNumber }) => {
  try {
    let conn = await db.getConn('extra:write')
    await conn.query({ sql: db.sql('agent/update12BetBankInfo.sql'), values: [ bankName, accountName, accountNumber, paymentType, agentId ]})
    return { code: 'common.success' }
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
}

service.checkAgentPlayerAccountUsername = async (playerAccountUsername, agentId) => {
  try {
    let jwconn = await db.getConn('jw');
    let conn = await db.getConn('extra:read');
    const result1 = (await conn.query({ sql: db.sql('agent/getPlayerAccountByUsername.sql'), values: [ playerAccountUsername ]}))[0]
    if (result1.length > 0) {
      if (result1[0].AgentId === agentId && result1[0].PlayerAccountUsername === playerAccountUsername) {
        return { code: 'common.success' }
      }
      return { code: 'code.playerAccountUsername.exist', msg: 'Player Account already linked to other affiliate account' }
    }
    const result = (await jwconn.query({ sql: db.sql('agent/ocms/getPlayerAccountByUsername.sql'), values: [ playerAccountUsername ]}))[0]
    if (result.length === 0) {
      return { code: 'code.playerAccountUsername.invalid', msg: 'Invalid Player Account Username' }
    }
    return { code: 'common.success' }
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
}

service.checkAgentBankAccountNumber = async (accountNumber, agentId) => {
  try {
    let conn = await db.getConn('extra:read');
    const result = (await conn.query({ sql: db.sql('agent/getAgentBankAccount.sql'), values: [ accountNumber ]}))[0]
    if (result.length > 0) {
      if (result[0].AgentId === agentId && result[0].AccountNumber === accountNumber) {
        return { code: 'common.success' }
      }
      return { code: 'code.accountNumber.exist', msg: 'Bank Account Number is already linked with other account' }
    }
    return { code: 'common.success' }
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
}

service.checkAgentSkrillAdress = async (skrillAddress, agentId) => {
  try {
    let conn = await db.getConn('extra:read');
    const result = (await conn.query({ sql: db.sql('agent/getAgentSkrillAddress.sql'), values: [ skrillAddress ]}))[0]
    if (result.length > 0) {
      if (result[0].AgentId === agentId && result[0].SkrillAddress === skrillAddress) {
        return { code: 'common.success' }
      }
      return { code: 'code.skrillAddress.exist', msg: 'Skrill Address is already linked with other account' }
    }
    return { code: 'common.success' }
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
}

service.checkAgentUsdtAddress = async (usdtWallet, agentId) => {
  try {
    let conn = await db.getConn('extra:read');
    const result = (await conn.query({ sql: db.sql('agent/getAgentUsdtWallet.sql'), values: [ usdtWallet ]}))[0]
    if (result.length > 0) {
      if (result[0].AgentId === agentId && result[0].USDTAddress === usdtWallet) {
        return { code: 'common.success' }
      }
      return { code: 'code.usdtWallet.exist', msg: 'USDT Wallet Account is already linked with other account' }
    }
    return { code: 'common.success' }
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
}

service.checkAgentBkashAddress = async (bkashWallet, agentId) => {
  try {
    let conn = await db.getConn('extra:read');
    const result = (await conn.query({ sql: db.sql('agent/getAgentBkashWallet.sql'), values: [ bkashWallet ]}))[0]
    if (result.length > 0) {
      if (result[0].AgentId === agentId && result[0].BkashAddress === bkashWallet) {
        return { code: 'common.success' }
      }
      return { code: 'code.bkashWallet.exist', msg: 'Bkash Wallet Account is already linked with other account' }
    }
    return { code: 'common.success' }
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
}

service.checkAgentNagadAddress = async (nagadWallet, agentId) => {
  try {
    let conn = await db.getConn('extra:read');
    const result = (await conn.query({ sql: db.sql('agent/getAgentNagadWallet.sql'), values: [ nagadWallet ]}))[0]
    if (result.length > 0) {
      if (result[0].AgentId === agentId && result[0].NagadAddress === nagadWallet) {
        return { code: 'common.success' }
      }
      return { code: 'code.nagadWallet.exist', msg: 'Nagad Wallet Account is already linked with other account' }
    }
    return { code: 'common.success' }
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
}

service.checkAgentRocketAddress = async (rocketWallet, agentId) => {
  try {
    let conn = await db.getConn('extra:read');
    const result = (await conn.query({ sql: db.sql('agent/getAgentRocketWallet.sql'), values: [ rocketWallet ]}))[0]
    if (result.length > 0) {
      if (result[0].AgentId === agentId && result[0].RocketAddress === rocketWallet) {
        return { code: 'common.success' }
      }
      return { code: 'code.rocketWallet.exist', msg: 'Rocket Wallet Account is already linked with other account' }
    }
    return { code: 'common.success' }
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
}

module.exports = service;