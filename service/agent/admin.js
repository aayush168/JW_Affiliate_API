let service = {}
const path = require('path');
let db = require(path.join(rootPath, 'db', 'index.js'));
let moment = require('moment-timezone');
let encrypt = require(path.join(rootPath, 'utils', 'encrypt.js'))

service.getAgentList = async (size, offset, { username, name, email, mobile, createdAt, status, revenueShareType, playerSourceType, paymentType }) => {
  try {
    let conn = await db.getConn('extra:read')
    const mode = process.env.mode;
    
    let sql
    if (mode === 'jwbdtprod' || mode === 'jwbdtdev') {
      sql = db.sql('agent/getBdtAgentList.sql')
    } else if (mode.includes('bvprod') || mode.includes('bvdev')) {
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
    sql = sql.replace('${PlayerSoruceType}', (playerSourceType === '') ? '' : `AND FIND_IN_SET(${playerSourceType}, a.PlayerSourceType) > 0`)
    const result = (await conn.query({ sql: sql, values: [ `%${username}%`, offset, size ]}));

    let sqlCount = db.sql('agent/getAgentListCount.sql')
    sqlCount = sqlCount.replace('${Name}', (name === '') ? '' : ` AND a.Name LIKE "%${name}%"`)
    sqlCount = sqlCount.replace('${Email}', (email === '') ? '' : ` AND a.Email LIKE "%${email}%"`)
    sqlCount = sqlCount.replace('${Mobile}', (mobile === '') ? '' : ` AND a.Mobile LIKE "%${mobile}%"`)
    sqlCount = sqlCount.replace('${Status}', (status === '') ? '' : `AND a.Status = ${status}`)
    sqlCount = sqlCount.replace('${CreatedAt}', (createdAt === '') ? '' : `AND a.Created_at >= "${createdAt}"`)
    sqlCount = sqlCount.replace('${PaymentTypeId}', (paymentType === '') ? '' : `AND ap.PaymentTypeId = ${paymentType}`)
    sqlCount = sqlCount.replace('${PlayerSoruceType}', (playerSourceType === '') ? '' : `AND FIND_IN_SET(${playerSourceType}, a.PlayerSourceType)`)
    const rowCount = (await conn.query({ sql: sqlCount, values: [ `%${username}%` ]}))[0];
    return { code: 'common.success', list: result[0], rowCount: rowCount[0].Count }
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
}


service.updateAgentProfile = async ({ name, username, password, mobile, email, whatsapp, skype, playerSourceType, otherSourceLink, status, remark }, id) => {
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
    await conn1.execute(db.sql('agent/updateAgentProfile.sql'), [ name, username, password, agentPassword, salt1, salt2, mobile, whatsapp, skype, email, playerSourceType, otherSourceLink, status, remark, id ])
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
    await conn1.execute(db.sql('agent/updateAgentStatus.sql'), [ status, remark, id ])
    return { code: 'common.success' }
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
}

service.updatePassword = async (password, id) => {
  try {
    let conn = await db.getConn('extra:read')
    let conn1 = await db.getConn('extra:write')
    let operator = (await conn.execute(db.sql('agent/getAgentById.sql'), [ id ]))[0];
    if (operator.length === 0) {
      return { code: "code.agent.noExist", msg: "Agent Not Found" }
    }
    const salt1 = encrypt.getSalt(10)
    const salt2 = encrypt.getSalt(12)
    const operatorPwd = encrypt.encryptPassword(password, salt1, salt2);
    await conn1.execute(db.sql('agent/updatePassword.sql'), [ password, operatorPwd, salt1, salt2, id ])
    return { code: 'common.success' }
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
}

service.updateUsername = async (username, id) => {
  try {
    let conn = await db.getConn('extra:read')
    let conn1 = await db.getConn('extra:write')
    let operator = (await conn.execute(db.sql('agent/getAgentById.sql'), [ id ]))[0];
    if (operator.length === 0) {
      return { code: "code.agent.noExist", msg: "Agent Not Found" }
    }
    const agent = (await conn.query(db.sql('agent/getAgentByUsername.sql'), [ username ]))[0]
    if (agent.length > 0) {
      return { code: 'code.username.exist', msg: 'Username is already taken' }
    }
    await conn1.execute(db.sql('agent/updateUsername.sql'), [ username, id ])
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
    const result = (await conn.execute(db.sql('agent/getAgentRegisteredCount.sql'), [start, end]))[0]
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
    if (mode && mode.includes('bv')) {
      agentOCMS = (await conn2.query(db.sql('agent/ocms/getDetailFromAgentChannel.sql'), [ username ]))[0];
    } else {
      agentOCMS = (await conn2.query(db.sql('agent/ocms/getAgentByUsername.sql'), [ username ]))[0];
    }
    if (agentOCMS.length > 0) {
      return { code: 'code.username.exist', msg: 'Username is already taken' }
    }
    const salt1 = encrypt.getSalt(10)
    const salt2 = encrypt.getSalt(12)
    const encryptPassword = encrypt.encryptPassword(password, salt1, salt2);
    await conn1.execute(db.sql('agent/addAgentManual.sql'), [ name, username, password, encryptPassword, salt1, salt2 ])
    return { code: 'common.success' }
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
}


service.updateAgentBankInfo = async ({ agentId, paymentType, bankName, accountName, accountNumber, accountType, ifsc, branch }) => {
  try {
    let conn = await db.getConn('extra:write')
    await conn.execute(db.sql('agent/updateBankInfo.sql'), [ bankName, accountName, accountNumber, accountType, ifsc, branch, paymentType, agentId ])
    return { code: 'common.success' }
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
}


service.updateAgentSkrillInfo = async ({ agentId, paymentType, skrillAddress }) => {
  try {
    let conn = await db.getConn('extra:write')
    await conn.execute(db.sql('agent/updateSkrillAddress.sql'), [ skrillAddress, paymentType, agentId ])
    return { code: 'common.success' }
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
}

service.updateAgentUsdtWalletInfo = async ({ agentId, paymentType, usdtWallet }) => {
  try {
    let conn = await db.getConn('extra:write')
    await conn.execute(db.sql('agent/updateUsdtWallet.sql'), [ usdtWallet, paymentType, agentId ])
    return { code: 'common.success' }
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
}

service.updateAgentPlayerInfo = async ({ agentId, paymentType, playerAccountUsername }) => {
  try {
    let conn = await db.getConn('extra:write')
    await conn.execute(db.sql('agent/updatePlayerAccount.sql'), [ playerAccountUsername, paymentType, agentId ])
    return { code: 'common.success' }
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
}


service.updateAgentBdtBankInfo = async ({ agentId, paymentType, bankName, accountName, accountNumber, accountType, branch }) => {
  try {
    let conn = await db.getConn('extra:write')
    await conn.execute(db.sql('agent/updateBdtBankInfo.sql'), [ bankName, accountName, accountNumber, accountType, branch, paymentType, agentId ])
    return { code: 'common.success' }
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
}


service.updateAgentBkashInfo = async ({ agentId, paymentType, bkashWallet }) => {
  try {
    let conn = await db.getConn('extra:write')
    await conn.execute(db.sql('agent/updateBkashWallet.sql'), [ bkashWallet, paymentType, agentId ])
    return { code: 'common.success' }
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
}

service.updateAgentNagadtInfo = async ({ agentId, paymentType, nagadWallet }) => {
  try {
    let conn = await db.getConn('extra:write')
    await conn.execute(db.sql('agent/updateNagadWallet.sql'), [ nagadWallet, paymentType, agentId ])
    return { code: 'common.success' }
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
}

service.updateAgentRocketInfo = async ({ agentId, paymentType, rocketWallet }) => {
  try {
    let conn = await db.getConn('extra:write')
    await conn.execute(db.sql('agent/updateRocketWallet.sql'), [ rocketWallet, paymentType, agentId ])
    return { code: 'common.success' }
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
}

service.updateAgentBvBankInfo = async ({ agentId, paymentType, bankName, accountName, accountNumber, branch }) => {
  try {
    let conn = await db.getConn('extra:write')
    await conn.execute(db.sql('agent/updateBvBankInfo.sql'), [ bankName, accountName, accountNumber, branch, paymentType, agentId ])
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
    const result1 = (await conn.execute(db.sql('agent/getPlayerAccountByUsername.sql'), [ playerAccountUsername ]))[0]
    if (result1.length > 0) {
      if (result1[0].AgentId === agentId && result1[0].PlayerAccountUsername === playerAccountUsername) {
        return { code: 'common.success' }
      }
      return { code: 'code.playerAccountUsername.exist', msg: 'Player Account already linked to other affiliate account' }
    }
    const result = (await jwconn.execute(db.sql('agent/ocms/getPlayerAccountByUsername.sql'), [ playerAccountUsername ]))[0]
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
    const result = (await conn.execute(db.sql('agent/getAgentBankAccount.sql'), [ accountNumber ]))[0]
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
    const result = (await conn.execute(db.sql('agent/getAgentSkrillAddress.sql'), [ skrillAddress ]))[0]
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
    const result = (await conn.execute(db.sql('agent/getAgentUsdtWallet.sql'), [ usdtWallet ]))[0]
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
    const result = (await conn.execute(db.sql('agent/getAgentBkashWallet.sql'), [ bkashWallet ]))[0]
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
    const result = (await conn.execute(db.sql('agent/getAgentNagadWallet.sql'), [ nagadWallet ]))[0]
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
    const result = (await conn.execute(db.sql('agent/getAgentRocketWallet.sql'), [ rocketWallet ]))[0]
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