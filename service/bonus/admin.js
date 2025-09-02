let service = {}
const path = require('path');
const db = require(path.join(rootPath, 'db', 'index.js'));
const s3 = require(path.join(rootPath, 'service', 'awsUpload.js'));
const config = require('../../config/index');

service.getBonusList = async (status, size, offset) => {
  try {
    let conn = await db.getConn('extra:read')
    let sql = db.sql('bonus/getAffiliateBonus.sql')
    sql = sql.replace('${Status}', (status === '') ? '' : `AND ab.Status = ${status}`)
    const result = (await conn.query({ sql: sql, values: [ offset, size ]}));
    let sqlCount = db.sql('bonus/getAffiliateBonusCount.sql')
    sqlCount = sqlCount.replace('${Status}', (status === '') ? '' : `AND ab.Status = ${status}`)
    const rowCount = (await conn.query({ sql: sqlCount}))[0];
    return { code: 'common.success', list: result[0], rowCount: rowCount[0].Count }
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
}

service.addAffiliateBonus = async (name, description, bannerFile, status, order) => {
  try {
    let conn = await db.getConn('extra:write')
    const result = (await conn.query({ sql: db.sql('bonus/addAffiliateBonus.sql'), values: [ name, description, status, order ]}))
    if (result) {
      const referenceId = result[0].insertId
      const pictureFileCategory = 'bonus-banner'
      const banner = await s3.save(bannerFile)
      await conn.query({ sql: db.sql('picture/addPictureFile.sql'), values: [referenceId, pictureFileCategory, '', '', banner.Location, banner.Key ]})
    }
    return { code: 'common.success' }
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
}


service.updateAffiliateBonus = async (name, description, bannerFile, status, order, id) => {
  try {
    let conn = await db.getConn('extra:write')
    let conn1 = await db.getConn('extra:read')
    const pictureFileCategory = 'bonus-banner'
    const bucket = config.app.awsConfig.bucket
    await conn.query({ sql: db.sql('bonus/updateAffiliateBonus.sql'), values: [ name, description, status, order, id ]})
    const pictureData = await conn1.query({ sql: db.sql('picture/getPictureFileDetail.sql'), values: [ id, pictureFileCategory ]})
    const referenceId = id
    if (bannerFile !== false) {
      await s3.delete(bucket, pictureData[0][0].PreviewKey)
      const { Location, Key } = await s3.save(bannerFile)
      await conn.query({ sql: db.sql('picture/updatePreviewPictureFile.sql'), values: [Location, Key, referenceId, pictureFileCategory ]})
    }
    return { code: 'common.success' }
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
}

module.exports = service;
