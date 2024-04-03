let service = {}
const path = require('path');
const db = require(path.join(rootPath, 'db', 'index.js'));
const moment = require('moment-timezone');

service.getTransferLogList = async (size, page, username, addTime, amount, status, type) => {
  try {
    let conn = await db.getConn('extra:read')
    let startTime
    if (addTime !== '') {
      startTime = moment(addTime).format('YYYY-MM-DD 00:00:00')
    }
    let sql
    if (type === 'search') {
      sql = db.sql('transfer/getTransferLogs.sql')
    } else {
      sql = db.sql('transfer/getTransferLogsExport.sql')
    }
    sql = sql.replace('${Username}', (username === '') ? '' : ` WHERE c.Username LIKE "%${username}%"`)
    sql = sql.replace('${AddTime}', (addTime === '') ? '' : `${username === '' && amount === '' ? 'WHERE' : 'AND' } cl.Created_at >= "${startTime}"`)
    sql = sql.replace('${Amount}', (amount === '') ? '' : `${username === '' && addTime === '' ? 'WHERE' : 'AND' } cl.Money LIKE "%${amount}%"`)
    sql = sql.replace('${Status}', (status === '') ? '' : `${username === '' && amount === '' && addTime === '' ? 'WHERE' : 'AND' } cl.Status = ${status}`)
    let result
    if (type === 'search') {
      result = await conn.query({ sql: sql, values: [page, size] })
    } else {
      result = await conn.query({ sql: sql })
      return { code: 'common.success', list: result[0] }
    }
    let sqlCount = db.sql('transfer/getTransferLogsCount.sql')
    sqlCount = sqlCount.replace('${Username}', (username === '') ? '' : ` WHERE c.Username LIKE "%${username}%"`)
    sqlCount = sqlCount.replace('${AddTime}', (addTime === '') ? '' : `${username === '' && amount === '' && status === '' ? 'WHERE' : 'AND' } cl.Created_at >= "${startTime}"`)
    sqlCount = sqlCount.replace('${Amount}', (amount === '') ? '' : `${username === '' && addTime === '' && status === '' ? 'WHERE' : 'AND' } cl.Money LIKE "%${amount}%"`)
    sqlCount = sqlCount.replace('${Status}', (status === '') ? '' : `${username === '' && amount === '' && addTime === '' ? 'WHERE' : 'AND' } cl.Status = ${status}`)
    const rowCount = (await conn.query({ sql: sqlCount }))[0]
    return { code: 'common.success', list: result[0], rowCount: rowCount[0].Count }
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
}

module.exports = service; 