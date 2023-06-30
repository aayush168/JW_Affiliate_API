let service = {}
const path = require('path');
let db = require(path.join(rootPath, 'db', 'index.js'));

service.addAgentLog = async ({type, operatorId, agentUsername, actionData, actionCode}) => {
  try {
    let conn = await db.getConn('extra:write')
    await conn.query({ sql: db.sql('log/addAgentLog.sql'), values: [operatorId, agentUsername, type, JSON.stringify(actionData), actionCode]});
    return { code: 'common.success' }
  } catch (err) {
    console.log(err);
    throw err;
  }
}

service.getAgentLog = async ({size, page, agentUsername}) => {
  try {
    let conn = await db.getConn('extra:read')
    const result = (await conn.query({ sql: db.sql('log/getAgentLog.sql'), values: [`%${agentUsername}%`, page, size]}))[0]
    const rowCount = (await conn.query({ sql: db.sql('log/getAgentLogCount.sql'), values: [ `%${agentUsername}%` ]}))[0];
    return { code: 'common.success', list: result, rowCount: rowCount[0].Count }
  } catch (err) {
    console.log(err);
    throw err;
  }
}

service.getWithdrawLog = async ({size, page, agentUsername}) => {
  try {
    let conn = await db.getConn('extra:read')
    const result = (await conn.query({ sql: db.sql('log/getWithdrawLog.sql'), values: [`%${agentUsername}%`, page, size]}))[0]
    const rowCount = (await conn.query({ sql: db.sql('log/getWithdrawLogCount.sql'), values: [ `%${agentUsername}%` ]}))[0];
    return { code: 'common.success', list: result, rowCount: rowCount[0].Count }
  } catch (err) {
    console.log(err);
    throw err;
  }
}

module.exports = service;