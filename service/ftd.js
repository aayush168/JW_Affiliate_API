let service = {}
const path = require('path');
const db = require(path.join(rootPath, 'db', 'index.js'));
const moment = require('moment-timezone');

service.getList = async (size, page, username, sTime, eTime, actionType) => {
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
    }
    let sql = actionType === 'search' ? db.sql('ftd/getFirstDepositMembers.sql') : db.sql('ftd/getFirstDepositMembersExport.sql')
    sql = sql.replace('${AgentCode}', (agentCode === '') ? '' : `WHERE a.Code = "${agentCode}"`)
    sql = sql.replace('${StartDate}', (sTime === '') ? '' : `${username === '' && eTime === '' ? 'WHERE' : 'AND' } ma.FirstDepositTime >= "${startDate}"`)
    sql = sql.replace('${EndDate}', (eTime === '') ? '' : `${username === '' && sTime === '' ? 'WHERE' : 'AND' } ma.FirstDepositTime <= "${endDate}"`)
    let result
    if (actionType === 'search') {
      result = (await conn.query({ sql: sql, values: [page, size] }))
    } else {
      result = (await conn.query({ sql: sql }))
    }

    let sqlCount = db.sql('ftd/getFirstDepositMembersCount.sql')
    sqlCount = sqlCount.replace('${AgentCode}', (agentCode === '') ? '' : ` WHERE a.Code = "${agentCode}"`)
    sqlCount = sqlCount.replace('${StartDate}', (sTime === '') ? '' : `${username === '' && eTime === '' ? 'WHERE' : 'AND' } ma.FirstDepositTime >= "${startDate}"`)
    sqlCount = sqlCount.replace('${EndDate}', (eTime === '') ? '' : `${username === '' && sTime === '' ? 'WHERE' : 'AND' } ma.FirstDepositTime <= "${endDate}"`)
    const rowCount = (await conn.query({ sql: sqlCount }))[0]
    return { code: 'common.success', list: result[0], rowCount: rowCount[0].Count }
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
}

module.exports = service; 