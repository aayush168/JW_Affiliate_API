let service = {}
const path = require('path');
const db = require(path.join(rootPath, 'db', 'index.js'));
const moment = require('moment-timezone');

service.getList = async (size, page, username, sTime, eTime) => {
  try {
    let conn = await db.getConn('jw')
    let startDate, endDate
    if (sTime !== '') {
      startDate = moment(sTime).format('YYYY-MM-DD 00:00:00')
    }
    if (eTime !== '') {
      endDate = moment(eTime).format('YYYY-MM-DD 23:59:59')
    }
    let agentCode = ''
    let agent = (await conn.query({ sql: db.sql('ftd/getAgentByUsername.sql'), values: [username] }))[0];
    if (agent.length !== 0) {
      agentCode = agent[0].Code
    } else {
      return { code: '“common.error', message: 'Agent not found' }
    }
    let sql = db.sql('report/getTurnoverDeposit.sql')
    const result = await conn.query({ sql: sql, values: [startDate, endDate, agentCode, startDate, endDate, agentCode, page, size] })
    let sqlCount = db.sql('report/getTurnoverDepositCount.sql')
    const rowCount = (await conn.query({ sql: sqlCount, values: [startDate, endDate, agentCode, startDate, endDate, agentCode] }))[0]
    return { code: 'common.success', list: result[0], rowCount: rowCount[0].Count }
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
}

module.exports = service; 