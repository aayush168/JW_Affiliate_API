let service = {}
const path = require('path');
let db = require(path.join(rootPath, 'db', 'index.js'));

service.getPaymentTypeList = async () => {
  try {
    let conn = await db.getConn('read')
    const result = (await conn.query(db.sql('setting/admin/getPaymentTypeList.sql')))[0]
    return { code: 'common.success', list: result }
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
}

service.checkPaymentTypeById = async (id) => {
  try {
    let conn = await db.getConn('read')
    const result = (await conn.query(db.sql('setting/admin/getPaymentTypeById.sql'), [id]))[0]
    if (result.length === 0) {
      return { code: "code.paymentType.noExist", msg: "Invalid Payment Type" }
    }
    return { code: 'common.success', list: result }
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
}

service.updatePaymentType = async (status, id) => {
  try {
    let conn = await db.getConn('read')
    let conn1 = await db.getConn('write')
    let paymentType = (await conn.execute(db.sql('setting/admin/getPaymentTypeById.sql'), [ id ]))[0];
    if (paymentType.length === 0) {
      return { code: "code.paymentType.noExist", msg: "Payment Type Not Found" }
    }
    await conn1.execute(db.sql('setting/admin/updatePaymentType.sql'), [ status, id ])
    return { code: 'common.success' }
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
}

service.getSourceTypeList = async () => {
  try {
    let conn = await db.getConn('read')
    const result = (await conn.query(db.sql('setting/admin/getSourceTypeList.sql')))[0]
    return { code: 'common.success', list: result }
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
}

service.updatePlayerSource = async (status, id) => {
  try {
    let conn = await db.getConn('read')
    let conn1 = await db.getConn('write')
    let paymentType = (await conn.execute(db.sql('setting/admin/getPlayerSourceById.sql'), [ id ]))[0];
    if (paymentType.length === 0) {
      return { code: "code.playerSource.noExist", msg: "Player Source Not Found" }
    }
    await conn1.execute(db.sql('setting/admin/updatePlayerSource.sql'), [ status, id ])
    return { code: 'common.success' }
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
}

module.exports = service;