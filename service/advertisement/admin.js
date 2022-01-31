let service = {}
const path = require('path');
let db = require(path.join(rootPath, 'db', 'index.js'));

service.getCategoryList = async () => {
  try {
    let conn = await db.getConn('extra:read')
    const result = (await conn.execute(db.sql('advertisement/getCategory.sql')))[0]
    return { code: 'common.success', list: result }
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
}

service.addCategory = async (name, status) => {
  try {
    let conn = await db.getConn('extra:read')
    let conn1 = await db.getConn('extra:write')
    const category = (await conn.execute(db.sql('advertisement/getCategoryByName.sql'), [ name ]))[0]
    if (category.length > 0) {
      return { code: 'code.category.exist', msg: 'Category already exist' }
    }
    await conn1.execute(db.sql('advertisement/addCategory.sql'), [ name, status ]);
    return { code: 'common.success' }
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
}

service.updateCategory = async (name, status, id) => {
  try {
    let conn = await db.getConn('extra:read')
    let conn1 = await db.getConn('extra:write')
    const category = (await conn.execute(db.sql('advertisement/getCategoryById.sql'), [ id ]))[0]
    if (category.length === 0) {
      return { code: 'code.category.noexist', msg: 'Invalid Category' }
    }
    await conn1.execute(db.sql('advertisement/updateCategory.sql'), [ name, status, id ]);
    return { code: 'common.success' }
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
}

module.exports = service; 