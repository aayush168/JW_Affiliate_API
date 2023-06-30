let service = {}
const path = require('path');
const db = require(path.join(rootPath, 'db', 'index.js'));
const moment = require('moment-timezone');

service.getCreditLogList = async (size, page, username, addTime, amount) => {
  try {
    let conn = await db.getConn('extra:read')
    let startTime
    if (addTime !== '') {
      startTime = moment(addTime).format('YYYY-MM-DD 00:00:00')
    }
    let sql = db.sql('credit/getCreditLogs.sql')
    sql = sql.replace('${Username}', (username === '') ? '' : ` WHERE c.Username LIKE "%${username}%"`)
    sql = sql.replace('${AddTime}', (addTime === '') ? '' : `${username === '' && amount === '' ? 'WHERE' : 'AND' } cl.Created_at >= "${startTime}"`)
    sql = sql.replace('${Amount}', (amount === '') ? '' : `${username === '' && addTime === '' ? 'WHERE' : 'AND' } cl.Amount LIKE "%${amount}%"`)
    const result = await conn.query({ sql: sql, values: [page, size] })

    let sqlCount = db.sql('credit/getCreditLogsCount.sql')
    sqlCount = sqlCount.replace('${Username}', (username === '') ? '' : ` WHERE c.Username LIKE "%${username}%"`)
    sqlCount = sqlCount.replace('${AddTime}', (addTime === '') ? '' : `${username === '' && amount === '' ? 'WHERE' : 'AND' } cl.Created_at >= "${startTime}"`)
    sqlCount = sqlCount.replace('${Amount}', (amount === '') ? '' : `${username === '' && addTime === '' ? 'WHERE' : 'AND' } cl.Amount LIKE "%${amount}%"`)
    const rowCount = (await conn.query({ sql: sqlCount }))[0]
    return { code: 'common.success', list: result[0], rowCount: rowCount[0].Count }
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
}

service.getAgentList = async (size, page, username) => {
  try {
    let conn = await db.getConn('extra:read')
    let sql = db.sql('credit/getAgentList.sql')
    let sqlCount = db.sql('credit/getAgentListCount.sql')
    const result = await conn.query({ sql: sql, values: [`%${username}%`, page, size] })
    const rowCount = (await conn.query({ sql: sqlCount, values: [`%${username}%`, page, size] }))[0]
    return { code: 'common.success', list: result[0], rowCount: rowCount[0].Count }
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
}

service.updateCredit = async (agentId, operatorId, amount, type, memo) => {
  try {
    let conn = await db.getConn('extra:read')
    let conn1 = await db.getConn('extra:write')
    let customer = (await conn.query({ sql: db.sql('credit/getAgentAccount.sql'), values: [ agentId ]}))[0];
    let dbCreditBalance;
    if (customer.length === 0) {
      dbCreditBalance = 0;
    } else {
      dbCreditBalance = customer[0].Balance
    }
    let creditAmount
    if (type === 2) {
      creditAmount = amount * -1
    } else {
      creditAmount = amount
    }
    const newBalance = dbCreditBalance + creditAmount
    if (type === 2 && newBalance < 0) {
      return { code: "code.agent.insufficientBalance", msg: "Customer has insufficient balance." }
    }
    if (customer.length === 0) {
      console.log('test');
      await conn1.query({ sql: db.sql('credit/addCredit.sql'), values: [agentId, newBalance]})
    } else {
      await conn1.query({ sql: db.sql('credit/updateCredit.sql'), values: [newBalance, agentId]})
    }
    await conn1.query({ sql: db.sql('credit/addCreditLog.sql'), values: [agentId, operatorId, creditAmount, memo]})
    return { code: 'common.success' }
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
}


module.exports = service; 