let service = {}
const path = require('path');
const db = require(path.join(rootPath, 'db', 'index.js'));

service.getBonusList = async (size, offset) => {
  try {
    let conn = await db.getConn('extra:read')
    let sql = db.sql('bonus/client/getAffiliateBonus.sql')
    const result = (await conn.query({ sql: sql, values: [ offset, size ]}));
    let sqlCount = db.sql('bonus/client/getAffiliateBonusCount.sql')
    const rowCount = (await conn.query({ sql: sqlCount}))[0];
    return { code: 'common.success', list: result[0], rowCount: rowCount[0].Count }
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
}

module.exports = service;
