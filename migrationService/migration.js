let service = {}
const path = require('path');
let db = require(path.join(rootPath, 'db', 'index.js'));

service.getAgentData = async () => {
  try {
    let conn = await db.getConn('jw')
    const result = (await conn.execute(db.sql('migration/ocms/getAgentDetailOCMS.sql')))[0]
    return { code: 'common.success', list: result }
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
}

service.addAgentData = async (payload) => {
  try {
    let conn = await db.getConn('extra:write')
    await conn.execute(db.sql('migration/labs/addAgent.sql'), [ payload.Name, payload.Username, payload.Password, payload.Salt1, payload.Salt2 ])
    return { code: 'common.success' }
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
}

module.exports = service;