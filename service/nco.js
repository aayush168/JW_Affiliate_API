let service = {}
const path = require('path');
const db = require(path.join(rootPath, 'db', 'index.js'));
const moment = require('moment-timezone');

service.getNCOList = async (size, page, username, sTime, eTime) => {
  try {
    let conn = await db.getConn('extra:read')
    let startDate, endDate
    if (sTime !== '') {
      startDate = moment(sTime).format('YYYY-MM-DD 00:00:00')
    }
    if (eTime !== '') {
      endDate = moment(eTime).format('YYYY-MM-DD 23:59:59')
    }
    let sql = db.sql('nco/getNCOList.sql')
    sql = sql.replace('${Username}', (username === '') ? '' : ` WHERE Username LIKE "%${username}%"`)
    sql = sql.replace('${StartDate}', (sTime === '') ? '' : `${username === '' && eTime === '' ? 'WHERE' : 'AND' } CreatedAt >= "${startDate}"`)
    sql = sql.replace('${EndDate}', (eTime === '') ? '' : `${username === '' && sTime === '' ? 'WHERE' : 'AND' } CreatedAt <= "${endDate}"`)
    const result = await conn.query({ sql: sql, values: [page, size] })

    let sqlCount = db.sql('nco/getNCOListCount.sql')
    sqlCount = sqlCount.replace('${Username}', (username === '') ? '' : ` WHERE Username LIKE "%${username}%"`)
    sqlCount = sqlCount.replace('${StartDate}', (sTime === '') ? '' : `${username === '' && eTime === '' ? 'WHERE' : 'AND' } CreatedAt >= "${startDate}"`)
    sqlCount = sqlCount.replace('${EndDate}', (eTime === '') ? '' : `${username === '' && sTime === '' ? 'WHERE' : 'AND' } CreatedAt <= "${endDate}"`)
    const rowCount = (await conn.query({ sql: sqlCount }))[0]
    return { code: 'common.success', list: result[0], rowCount: rowCount[0].Count }
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
}

service.updateNco = async (ncoId, amount) => {
  try {
    let conn = await db.getConn('extra:read')
    let conn1 = await db.getConn('extra:write')
    let nco = (await conn.query({ sql: db.sql('nco/getNCOById.sql'), values: [ ncoId ]}))[0];
    if (nco.length === 0) {
      return { code: "code.nco.noExist", msg: "Nco does not exist" }
    }
    await conn1.query({ sql: db.sql('nco/updateNCO.sql'), values: [amount, ncoId]})
    return { code: 'common.success' }
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
}


service.ncoBatchAdd = async (items) => {
  try {
    let conn = await db.getConn('extra:read')
    let conn1 = await db.getConn('extra:write')
    let validationFailed = false;
    if (items.length > 0) {
      for (const item of items) {
        if (!item.hasOwnProperty('amount') || !item.hasOwnProperty('username') || !item.hasOwnProperty('date')) {
          validationFailed = true;
          break; // Break out of the loop as soon as a validation error is encountered
        }
      }
      if (validationFailed) {
        return { code: "code.file.invalid", msg: "Invalid Data file, Please check the table header format" }
      }
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const money = item.amount.replace(/,/g, '');
        const startDate = moment(item.date).startOf('month').format('YYYY-MM-DD 00:00:00')
        const endDate = moment(item.date).endOf('month').format('YYYY-MM-DD 23:59:59')
        let nco = (await conn.query({ sql: db.sql('nco/getNCOByUsernameDate.sql'), values: [ item.username, startDate, endDate ]}))[0];
        if (nco.length === 0) {
          await conn1.query({ sql: db.sql('nco/addNCO.sql'), values: [item.username, money, item.date]})
        } else {
          await conn1.query({ sql: db.sql('nco/updateNCOBatch.sql'), values: [ money, item.date, nco[0].Id]})
        }
      }
    } else {
      return { code: "code.file.empty", msg: "Empty File" }
    }
    return { code: 'common.success' }
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
}

module.exports = service; 