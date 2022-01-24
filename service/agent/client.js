let service = {}
const path = require('path');
const db = require(path.join(rootPath, 'db', 'index.js'));
const encrypt = require(path.join(rootPath, 'utils', 'encrypt.js'));
const config = require('../../config/index.js');

service.addAgent = async ({ name, username, password, mobile, whatsapp, skype, email, revenueShareType, playerSourceType, otherSourceLink }) => {
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
    const salt1 = encrypt.getSalt(10)
    const salt2 = encrypt.getSalt(12)
    const encryptPassword = encrypt.encryptPassword(password, salt1, salt2);
    const result = await conn1.execute(db.sql('agent/addAgent.sql'), [ name, username, password, encryptPassword, salt1, salt2, mobile, whatsapp, skype, email, revenueShareType, playerSourceType, otherSourceLink ])
    const agentId = result[0].insertId
    return { code: 'common.success', agentId: agentId }
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
}

service.addAgentBankInfo = async ({ agentId, paymentType, bankName, accountName, accountNumber, accountType, isfc, branch }) => {
  try {
    let conn = await db.getConn('extra:write')
    await conn.execute(db.sql('agent/addBankInfo.sql'), [ agentId, paymentType, bankName, accountName, accountNumber, accountType, isfc, branch ])
    return { code: 'common.success' }
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
}


service.addAgentSkrillInfo = async ({ agentId, paymentType, skrillAddress }) => {
  try {
    let conn = await db.getConn('extra:write')
    await conn.execute(db.sql('agent/addSkrillAddress.sql'), [ agentId, paymentType, skrillAddress ])
    return { code: 'common.success' }
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
}

service.addAgentUsdtWalletInfo = async ({ agentId, paymentType, usdtWallet }) => {
  try {
    let conn = await db.getConn('extra:write')
    await conn.execute(db.sql('agent/addUsdtWallet.sql'), [ agentId, paymentType, usdtWallet ])
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
    const result = (await jwconn.execute(db.sql('agent/ocms/getPlayerAccountByUsername.sql'), [ playerAccountUsername ]))[0]
    if (result.length === 0) {
      return { code: 'code.playerAccountUsername.invalid', msg: 'Invalid Player Account Username' }
    }
    const result1 = (await conn.execute(db.sql('agent/getPlayerAccountByUsername.sql'), [ playerAccountUsername ]))[0]
    if (result1.length > 0) {
      return { code: 'code.playerAccountUsername.exist', msg: 'Player Account already linked to other affiliate account' }
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
    await conn.execute(db.sql('agent/addPlayerAccount.sql'), [ agentId, paymentType, playerAccountUsername ])
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
    let result
    let mode = process.env.mode
    if (mode && mode.includes('bv')) {
      result = (await conn1.query(db.sql('agent/getAgentByUsername.sql'), [ username ]))[0];
    } else {
      result = (await conn.query(db.sql('agent/ocms/getAgentByUsername.sql'), [ username ]))[0];
    }
    if (result.length === 0) {
      return { code: 'code.operator.noExist', user: null }
    }
    let user = result[0]
    if (mode && mode.includes('bv')) {
      const agentData = (await conn.query(db.sql('agent/ocms/getDetailFromAgentChannel.sql'), [ username ]))[0];
      user = {
        ...result[0],
        ...agentData[0],
        OperatorPW: result[0].Password,
        salt1: result[0].Salt1,
        salt2: result[0].Salt2
      }
    } else {
      user = {
        ...user,
        salt1: user.salt
      }
    }
    if (user.Active !== 1) {
      return { code: 'code.account.disabled', user: null }
    }
    if (user.OperatorPW !== encrypt.encryptPassword(password, user.salt1, user.salt2)) {
      return { code: 'code.auth.login.invalid', user: null }
    }
    return { code: 'common.success', user: { id: user.OperatorIdx, username: user.OperatorID, name: user.OperatorName, code: user.Code }}
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
}

module.exports = service;
