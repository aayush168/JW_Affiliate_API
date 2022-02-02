let service = {}
const path = require('path');
const db = require(path.join(rootPath, 'db', 'index.js'));
const s3 = require(path.join(rootPath, 'service', 'awsUpload.js'));

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

service.addAdvertisementBanner = async (name, category, description, uploadFile, status, order) => {
  try {
    let conn = await db.getConn('extra:write')
    const result = (await conn.execute(db.sql('advertisement/addAdvertisementBanner.sql'), [ name, category, description, status, order ]))
    if (result) {
      const referenceId = result[0].insertId
      const pictureFileCategory = 'advertisement-banner'
      const { Location, Key } = await s3.save(uploadFile)
      await conn.execute(db.sql('picture/addPictureFile.sql'), [referenceId, pictureFileCategory, Location, Key])
    }
    return { code: 'common.success' }
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
}

service.getBannerList = async (category, status, offset, size) => {
  try {
    let conn = await db.getConn('extra:read')
    let sql = db.sql('advertisement/getAdvertisementBanner.sql')
    sql = sql.replace('${Category}', (category === '') ? '' : ` AND ac.Id = ${category}`)
    sql = sql.replace('${Status}', (status === '') ? '' : `AND ab.Status = ${status}`)
    const result = (await conn.query({ sql: sql, values: [ offset, size ]}));
    console.log(result[0], 'test');
    let sqlCount = db.sql('advertisement/getAdvertisementBannerCount.sql')
    sqlCount = sqlCount.replace('${Category}', (category === '') ? '' : ` AND ac.Id = ${category}`)
    sqlCount = sqlCount.replace('${Status}', (status === '') ? '' : `AND ab.Status = ${status}`)
    const rowCount = (await conn.query({ sql: sqlCount}))[0];
    console.log(rowCount, 'test');
    return { code: 'common.success', list: result[0], rowCount: rowCount[0].Count }
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
}

module.exports = service; 