let service = {}
const path = require('path');
const db = require(path.join(rootPath, 'db', 'index.js'));

service.getTagList = async (size, page, name, status) => {
  try {
    let conn = await db.getConn('extra:read')
    let sql = db.sql('agentTag/getTagList.sql')
    sql = sql.replace('${Name}', (name === '') ? '' : ` AND at.Name LIKE "%${name}%"`)
    sql = sql.replace('${Status}', (status === '') ? '' : ` AND at.Status = ${status}`)
    const result = await conn.query({ sql: sql, values: [page, size] })
    let sqlCount = db.sql('agentTag/getTagListCount.sql')
    sqlCount = sqlCount.replace('${Name}', (name === '') ? '' : ` AND Name LIKE "%${name}%"`)
    sqlCount = sqlCount.replace('${Status}', (status === '') ? '' : ` AND Status = ${status}`)
    const rowCount = (await conn.query({ sql: sqlCount }))[0]
    return { code: 'common.success', list: result[0], rowCount: rowCount[0].Count }
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
}

service.getAllTagList = async () => {
  try {
    let conn = await db.getConn('extra:read')
    const result = await conn.query({ sql: db.sql('agentTag/getAllTagList.sql') })
    return { code: 'common.success', list: result[0] }
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
}

service.addTag = async (name, color, memo, status, operatorId) => {
  try {
    let conn = await db.getConn('extra:write')
    await conn.query({ sql: db.sql('agentTag/addTag.sql'), values: [name, color, memo, status, operatorId] })
    return { code: 'common.success' }
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
}

service.updateTag = async (id, color, memo, status, operatorId) => {
  try {
    let conn = await db.getConn('extra:write')
    await conn.query({ sql: db.sql('agentTag/updateTag.sql'), values: [color, memo, status, operatorId, id] })
    return { code: 'common.success' }
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
}

service.getTagListByAgentId = async (agentId) => {
  try {
    let conn = await db.getConn('extra:read')
    const result = await conn.query({ sql: db.sql('agentTag/getTagListByAgentId.sql'), values: [agentId] })
    return { code: 'common.success', list: result[0] }
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
}

service.assignTag = async (agentId, tagIds, operatorId) => {
  try {
    let conn = await db.getConn('extra:write')
    await conn.query({ sql: db.sql('agentTag/removeAgentTagMapping.sql'), values: [agentId] })
    if (tagIds.length === 0) {
      return { code: 'common.success' }
    }
    for (const tagId of tagIds) {
      await conn.query({ sql: db.sql('agentTag/addAgentTagMapping.sql'), values: [agentId, tagId, operatorId] })
    }
    return { code: 'common.success' }
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
}

service.getSettlementAgentTagList = async () => {
  try {
    let conn = await db.getConn('extra:read')
    const result = await conn.query({ sql: db.sql('agentTag/settlement/getAgentTagList.sql') })
    console.log(result[0], 'agent settlement tag list');
    return { code: 'common.success', list: result[0] }
  } catch (err) {
    return { code: 'common.error', list: [] }
  }
}

module.exports = service; 