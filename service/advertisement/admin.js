let service = {}
const path = require('path');
const db = require(path.join(rootPath, 'db', 'index.js'));
const s3 = require(path.join(rootPath, 'service', 'awsUpload.js'));
const config = require('../../config/index');

service.getCategoryList = async () => {
  try {
    let conn = await db.getConn('extra:read')
    const result = (await conn.query({ sql: db.sql('advertisement/getCategory.sql')}))[0]
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
    const category = (await conn.query({ sql: db.sql('advertisement/getCategoryByName.sql'), values: [ name ]}))[0]
    if (category.length > 0) {
      return { code: 'code.category.exist', msg: 'Category already exist' }
    }
    await conn1.query({ sql: db.sql('advertisement/addCategory.sql'), values: [ name, status ]});
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
    const category = (await conn.query({ sql: db.sql('advertisement/getCategoryById.sql'), values: [ id ]}))[0]
    if (category.length === 0) {
      return { code: 'code.category.noexist', msg: 'Invalid Category' }
    }
    await conn1.query({ sql: db.sql('advertisement/updateCategory.sql'), values: [ name, status, id ]});
    return { code: 'common.success' }
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
}

service.addAdvertisementBanner = async (name, category, description, uploadFile, previewFile, status, order, id) => {
  try {
    let conn = await db.getConn('extra:write')
    const result = (await conn.query({ sql: db.sql('advertisement/addAdvertisementBanner.sql'), values: [ name, category, description, status, order ]}))
    if (result) {
      const referenceId = result[0].insertId
      const pictureFileCategory = 'advertisement-banner'
      const { Location, Key } = await s3.save(uploadFile)
      const previewBanner = await s3.save(previewFile)
      await conn.query({ sql: db.sql('picture/addPictureFile.sql'), values: [referenceId, pictureFileCategory, Location, Key, previewBanner.Location, previewBanner.Key ]})
    }
    return { code: 'common.success' }
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
}

service.getBannerList = async (category, status, size, offset) => {
  try {
    let conn = await db.getConn('extra:read')
    let sql = db.sql('advertisement/getAdvertisementBanner.sql')
    sql = sql.replace('${Category}', (category === '') ? '' : ` AND ac.Id = ${category}`)
    sql = sql.replace('${Status}', (status === '') ? '' : `AND ab.Status = ${status}`)
    const result = (await conn.query({ sql: sql, values: [ offset, size ]}));
    let sqlCount = db.sql('advertisement/getAdvertisementBannerCount.sql')
    sqlCount = sqlCount.replace('${Category}', (category === '') ? '' : ` AND ac.Id = ${category}`)
    sqlCount = sqlCount.replace('${Status}', (status === '') ? '' : `AND ab.Status = ${status}`)
    const rowCount = (await conn.query({ sql: sqlCount}))[0];
    return { code: 'common.success', list: result[0], rowCount: rowCount[0].Count }
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
}

service.updateAdvertisementBanner = async (name, category, description, uploadFile, previewFile, status, order, id) => {
  try {
    let conn = await db.getConn('extra:write')
    let conn1 = await db.getConn('extra:read')
    const pictureFileCategory = 'advertisement-banner'
    const bucket = config.app.awsConfig.bucket
    await conn.query({ sql: db.sql('advertisement/updateAdvertisementBanner.sql'), values: [ name, category, description, status, order, id ]})
    const pictureData = await conn1.query({ sql: db.sql('picture/getPictureFileDetail.sql'), values: [ id, pictureFileCategory ]})
    const referenceId = id
    if (uploadFile !== false) {
      await s3.delete(bucket, pictureData[0][0].Key)
      const { Location, Key } = await s3.save(uploadFile)
      await conn.query({ sql: db.sql('picture/updatePictureFile.sql'), values: [Location, Key, referenceId, pictureFileCategory ]})
    }
    if (previewFile !== false) {
      if (pictureData[0][0].PreviewUrl) {
        await s3.delete(bucket, pictureData[0][0].PreviewKey)
      }
      const { Location, Key } = await s3.save(previewFile)
      await conn.query({ sql: db.sql('picture/updatePreviewPictureFile.sql'), values: [Location, Key, referenceId, pictureFileCategory ]})
    }
    return { code: 'common.success' }
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
}

module.exports = service;
