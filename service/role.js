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

service.addRoleList = async (name) => {
  try {
    let conn = await db.getConn('read')
    let conn1 = await db.getConn('write')
    const role = (await conn.execute(db.sql('role/getRoleByName.sql'), [ name ]))[0]
    if (role.length > 0) {
      return { code: 'code.role.exist', msg: 'Role already exist' }
    }
    await conn1.execute(db.sql('role/addRole.sql'), [ name ]);
    return { code: 'common.success' }
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
}

module.exports = service; 