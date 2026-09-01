let service = {}
const path = require('path');
const db = require(path.join(rootPath, 'db', 'index.js'));
const moment = require('moment-timezone');
const playerPerformanceController = require(path.join(rootPath, 'controller', 'playerPerformance.js'));

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
    let sql = actionType === 'search' ? db.sql('report/getTurnoverDeposit.sql') : db.sql('report/getTurnoverDepositExport.sql')
    let result
    sql = sql.replace('${AgentCode}', (agentCode === '') ? '' : `AND AgentCode = "${agentCode}"`)
    sql = sql.replace('${AgentCodeColumn}', (agentCode === '') ? '' : `AND AgentCode = "${agentCode}"`)
    if (actionType === 'search') {
      result = (await conn.query({ sql: sql, values: [startDate, endDate, startDate, endDate, page, size] }))
    } else {
      result = (await conn.query({ sql: sql, values: [startDate, endDate, startDate, endDate] }))
    }
    let sqlCount = db.sql('report/getTurnoverDepositCount.sql')
    sqlCount = sqlCount.replace('${AgentCode}', (agentCode === '') ? '' : `AND AgentCode = "${agentCode}"`)
    sqlCount = sqlCount.replace('${AgentCodeColumn}', (agentCode === '') ? '' : `AND AgentCode = "${agentCode}"`)
    const rowCount = (await conn.query({ sql: sqlCount, values: [startDate, endDate, startDate, endDate] }))[0]
    return { code: 'common.success', list: result[0], rowCount: rowCount[0].Count }
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
}

function toMemberIdArray (memberIds) {
  let parsedMemberIds = memberIds
  if (typeof memberIds === 'string') {
    try {
      parsedMemberIds = JSON.parse(memberIds)
    } catch (err) {
      parsedMemberIds = memberIds.split(',')
    }
  }
  const values = Array.isArray(parsedMemberIds) ? parsedMemberIds : [parsedMemberIds]
  return [...new Set(values
    .map(memberId => Number(memberId))
    .filter(memberId => Number.isInteger(memberId) && memberId > 0))]
}

async function getAgentMembers (conn, agentCode, playerUsername) {
  const username = playerUsername || ''
  const skipUsernameFilter = username === '' ? 1 : 0
  const members = (await conn.query({
    sql: db.sql('report/getMembersByAgent.sql'),
    values: [agentCode, skipUsernameFilter, `%${username}%`]
  }))[0]
  return members.map(member => ({
    memberId: Number(member.MemberId),
    username: member.Username
  }))
}

service.getPerformanceList = async (size, page, agentUsername, playerUsername, requestedExcludeMemberIds, startDate, endDate, actionType) => {
  try {
    let conn = await db.getConn('jw')
    let agentCode = ''
    let agent = (await conn.query({ sql: db.sql('ftd/getAgentByUsername.sql'), values: [agentUsername] }))[0]
    if (agent.length !== 0) {
      agentCode = agent[0].Code
    }
    if (agentCode === '') {
      return { code: 'code.agent.notFound', message: 'Agent not found' }
    }

    const memberOptions = await getAgentMembers(conn, agentCode, playerUsername)
    const validMemberIds = new Set(memberOptions.map(member => member.memberId))
    const excludedMemberIds = toMemberIdArray(requestedExcludeMemberIds)
      .filter(memberId => validMemberIds.has(memberId))

    const pageIndex = actionType === 'export' ? 0 : page
    const pageSize = actionType === 'export' ? 999999 : size
    const result = await playerPerformanceController.getPlayerPerformance(
      agentCode,
      startDate,
      endDate,
      playerUsername || '',
      pageIndex,
      pageSize,
      false,
      excludedMemberIds
    )

    return {
      code: 'common.success',
      list: result.data,
      total: result.total,
      rowCount: result.totalCount,
      members: memberOptions
    }
  } catch (err) {
    console.log(err)
    throw new Error(err)
  }
}

module.exports = service; 