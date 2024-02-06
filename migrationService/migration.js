let service = {}
const path = require('path');
let db = require(path.join(rootPath, 'db', 'index.js'));

service.addNegativeData = async (payload) => {
  try {
    let conn = await db.getConn('extra:write')
    await conn.query({ sql: db.sql('migration/AddNegativeCarryover.sql'), values: [ payload.Username, payload.Amount, payload.Date ]})
    return { code: 'common.success' }
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
}

module.exports = service;