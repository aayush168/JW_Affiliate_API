let service = {}
const path = require('path');
const db = require(path.join(rootPath, 'db', 'index.js'));

service.getBannerList = async (size, offset) => {
  try {
    let conn = await db.getConn('extra:read')
    let sql = db.sql('advertisement/client/getAdvertisementBanner.sql')
    const result = (await conn.query({ sql: sql, values: [ offset, size ]}));
    let sqlCount = db.sql('advertisement/client/getAdvertisementBannerCount.sql')
    const rowCount = (await conn.query({ sql: sqlCount}))[0];
    return { code: 'common.success', list: result[0], rowCount: rowCount[0].Count }
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
}

service.getAdS3Data = async (adId) => {
  try {
    let conn = await db.getConn('extra:read')
    const result = (await conn.query({ sql: db.sql('advertisement/client/getAdvertisementBannerS3Data.sql'), values: [ adId ]}));
    return result[0]
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
}

module.exports = service;
