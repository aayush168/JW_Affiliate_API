let service = {}
const path = require('path');
let db = require(path.join(rootPath, 'db', 'index.js'));

service.addLog = async ({type, operatorId, agentUsername, actionData, actionCode}) => {
  try {
    let conn = await db.getConn('extra:write')
    await conn.query({ sql: db.sql('log/addLog.sql'), values: [operatorId, agentUsername, type, actionData, actionCode]});
    return { code: 'common.success' }
  } catch (err) {
    console.log(err);
    throw err;
  }
}

service.getLog = async ({size, page, agentUsername}) => {
  try {
    let conn = await db.getConn('extra:read')
    const result = (await conn.query({ sql: db.sql('log/getLog.sql'), values: [`%${agentUsername}%`, page, size]}))[0]
    return { code: 'common.success', list: result }
  } catch (err) {
    console.log(err);
    throw err;
  }
}

module.exports = service;