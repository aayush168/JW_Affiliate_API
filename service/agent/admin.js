let service = {}
const path = require('path');
let db = require(path.join(rootPath, 'db', 'index.js'));
let moment = require('moment-timezone');

service.getAgentList = async (size, offset, { username, createdAt, status, revenueShareType, playerSourceType, paymentType }) => {
  try {
    let conn = await db.getConn('read')
    let startTime
    if (createdAt !== '') {
      startTime = moment(createdAt).format('YYYY-MM-DD 00:00:00')
    }
    let sql = db.sql('agent/getAgentList.sql')
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

service.updateAgentStatus = async (status, id) => {
  try {
    let conn = await db.getConn('read')
    let conn1 = await db.getConn('write')
    let agent = (await conn.query(db.sql('agent/getAgentById.sql'), [ id ]))[0];
    if (agent.length === 0) {
      return { code: "code.agent.noExist", msg: "Agent Not Found" }
    }
    await conn1.execute(db.sql('agent/updateAgentStatus.sql'), [ status, id ])
    return { code: 'common.success' }
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
}

module.exports = service;