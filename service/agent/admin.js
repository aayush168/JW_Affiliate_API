let service = {}
const path = require('path');
let db = require(path.join(rootPath, 'db', 'index.js'));
let moment = require('moment-timezone');
let encrypt = require(path.join(rootPath, 'utils', 'encrypt.js'))

service.getAgentList = async (size, offset, { username, createdAt, status, revenueShareType, playerSourceType, paymentType }) => {
  try {
    let conn = await db.getConn('extra:read')
    const mode = process.env.mode;
    let sql
    if (mode === 'jwbdtprod' || mode === 'jwbdtdev') {
      sql = db.sql('agent/getBdtAgentList.sql')
    } else {
      sql = db.sql('agent/getAgentList.sql')
    }
    sql = sql.replace('${RevenueShareType}', (revenueShareType === '') ? '' : ` AND a.RevenueShareType = ${revenueShareType}`)
    sql = sql.replace('${Status}', (status === '') ? '' : `AND a.Status = ${status}`)
    sql = sql.replace('${CreatedAt}', (createdAt === '') ? '' : `AND a.Created_at >= "${createdAt}"`)
    sql = sql.replace('${PaymentTypeId}', (paymentType === '') ? '' : `AND ap.PaymentTypeId = ${paymentType}`)
    sql = sql.replace('${PlayerSoruceType}', (playerSourceType === '') ? '' : `AND FIND_IN_SET(${playerSourceType}, a.PlayerSourceType) > 0`)
    const result = (await conn.query({ sql: sql, values: [ `%${username}%`, offset, size ]}));

    let sqlCount = db.sql('agent/getAgentListCount.sql')
    sqlCount = sqlCount.replace('${RevenueShareType}', (revenueShareType === '') ? '' : ` AND a.RevenueShareType = ${revenueShareType}`)
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

module.exports = service;