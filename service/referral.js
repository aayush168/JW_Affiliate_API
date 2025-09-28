let service = {}
const path = require('path');
const db = require(path.join(rootPath, 'db', 'index.js'));
const moment = require('moment-timezone');

service.getList = async (size, page, username, sTime, eTime, actionType) => {
  try {
    let conn = await db.getConn('extra:read')
    
    let startDate, endDate
    if (sTime !== '') {
      startDate = moment(sTime).format('YYYY-MM-DD 00:00:00')
    }
    if (eTime !== '') {
      endDate = moment(eTime).format('YYYY-MM-DD 23:59:59')
    }
    let sql = actionType === 'search' ? db.sql('referral/getReferralMembers.sql') : db.sql('referral/getReferralMembersExport.sql')
    sql = sql.replace('${Username}', (username === '') ? '' : `AND ReferralUsername = "${username}"`)
    sql = sql.replace('${StartDate}', (sTime === '') ? '' : `AND Created_at >= "${startDate}"`)
    sql = sql.replace('${EndDate}', (eTime === '') ? '' : `AND Created_at <= "${endDate}"`)
    let result
    if (actionType === 'search') {
      result = (await conn.query({ sql: sql, values: [page, size]}));
    } else {
      result = (await conn.query({ sql: sql}));
    }

    let sqlCount = db.sql('referral/getReferralMembersCount.sql')
    sqlCount = sqlCount.replace('${Username}', (username === '') ? '' : `AND ReferralUsername = "${username}"`)
    sqlCount = sqlCount.replace('${StartDate}', (sTime === '') ? '' : `AND Created_at >= "${startDate}"`)
    sqlCount = sqlCount.replace('${EndDate}', (eTime === '') ? '' : `AND Created_at <= "${endDate}"`)
    const rowCount = (await conn.query({ sql: sqlCount }))[0]
    return { code: 'common.success', list: result[0], rowCount: rowCount[0].Count }
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
}

module.exports = service; 