let service = {}
const path = require('path');
let db = require(path.join(rootPath, 'db', 'index.js'));

service.getAgentData = async () => {
  try {
    let conn = await db.getConn('jw')
    const result = (await conn.execute(db.sql('migration/ocms/getAgentDetailOCMS.sql')))[0]
    return { code: 'common.success', data: result }
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
}

// service.addAgentData = async (payload) => {
//   try {
//     let conn = await db.getConn('extra:write')
//     const result = (await conn.execute(db.sql('migration//labs/addAgentDataFromOCMS.sql')))[0]
//     return { code: 'common.success', data: result }
//   } catch (err) {
//     console.log(err);
//     throw new Error(err);
//   }
// }

module.exports = service;