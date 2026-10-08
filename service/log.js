let service = {}
const path = require('path');
let db = require(path.join(rootPath, 'db', 'index.js'));

const SENSITIVE_ACTION_DATA_KEYS = ['password', 'unhashedpassword', 'cpassword', 'oldpassword', 'newpassword']

function sanitizeActionData(actionData) {
  if (actionData == null || actionData === '') {
    return actionData
  }
  let data = actionData
  if (typeof data === 'string') {
    try {
      data = JSON.parse(data)
    } catch (err) {
      return actionData
    }
  }
  if (typeof data !== 'object' || Array.isArray(data)) {
    return data
  }
  const sanitized = {}
  Object.keys(data).forEach((key) => {
    if (!SENSITIVE_ACTION_DATA_KEYS.includes(String(key).toLowerCase())) {
      sanitized[key] = data[key]
    }
  })
  return sanitized
}

service.addAgentLog = async ({type, operatorId, agentUsername, actionData, actionCode}) => {
  try {
    let conn = await db.getConn('extra:write')
    const sanitizedActionData = sanitizeActionData(actionData)
    await conn.query({ sql: db.sql('log/addAgentLog.sql'), values: [operatorId, agentUsername, type, JSON.stringify(sanitizedActionData), actionCode]});
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
    const list = (result || []).map((row) => {
      if (!row.ActionData) {
        return row
      }
      const sanitized = sanitizeActionData(row.ActionData)
      return {
        ...row,
        ActionData: typeof sanitized === 'string' ? sanitized : JSON.stringify(sanitized)
      }
    })
    return { code: 'common.success', list: list, rowCount: rowCount[0].Count }
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
