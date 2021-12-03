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
    sql = sql.replace('${RevenueShareType}', (revuenueShareType === '') ? '' : ` AND RevenueShareType = ${revuenueShareType}`)
    sql = sql.replace('${Status}', (status === '') ? '' : `AND Status = ${status}`)
    sql = sql.replace('${CreatedAt}', (createdAt === '') ? '' : `AND Created_at >= "${createdAt}"`)
    const result = (await conn.query({ sql: sql, values: [ `%${username}%`, offset, size ]}));
    return { code: 'common.success', list: result[0] }
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
}

module.exports = service;