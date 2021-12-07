let service = {}
const path = require('path');
let db = require(path.join(rootPath, 'db', 'index.js'));

service.getSettingDetail = async () => {
  try {
    let conn = await db.getConn('read')
    const paymentType = (await conn.query(db.sql('setting/client/getPaymentTypeList.sql')))[0];
    const playerSourceType = (await conn.query(db.sql('setting/client/getPlayerSourceList.sql')))[0];
    return { code: 'common.success', setting: {
      paymentType: paymentType,
      playerSourceType: playerSourceType
    }}
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
}

module.exports = service;