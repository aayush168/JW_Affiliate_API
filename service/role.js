let service = {}
const path = require('path');
let db = require(path.join(rootPath, 'db', 'index.js'));

service.getRoleList = async () => {
  try {
    let conn = await db.getConn('read')
    const result = (await conn.execute(db.sql('role/getRoleList.sql')))[0]
    return { code: 'common.success', list: result }
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
}

module.exports = service; 