let service = {}
const path = require('path');
let db = require(path.join(rootPath, 'db', 'index.js'));
let encrypt = require(path.join(rootPath, 'utils', 'encrypt.js'))
let moment = require('moment-timezone');

service.getOperatorList = async (username, createdAt) => {
  try {
    let conn = await db.getConn('main:read')
    let startTime
    if (createdAt !== '') {
      startTime = moment(createdAt).format('YYYY-MM-DD 00:00:00')
    }
    let sql = db.sql('operator/getOperatorList.sql')
    sql = sql.replace('${Username}', (username === '') ? '' : ` WHERE Username LIKE "%${username}%"`)
    sql = sql.replace('${SubmitedTime}', (createdAt === '') ? '' : `${username === '' ? 'WHERE' : 'AND'} Created_at >= "${startTime}"`)
    const result = await conn.execute(sql)
    return { code: 'common.success', list: result[0] }
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
}

service.addOperator = async (name, username, password, status) => {
  try {
    let conn = await db.getConn('main:read')
    let conn1 = await db.getConn('main:write')
    const operator = (await conn.execute(db.sql('operator/getOperatorByUsername.sql'), [ username ]))[0]
    if (operator.length > 0) {
      return { code: 'code.operator.exist', msg: 'Username is already taken' }
    }
    const salt1 = encrypt.getSalt(10)
    const salt2 = encrypt.getSalt(12)
    const encryptPassword = encrypt.encryptPassword(password, salt1, salt2);
    await conn1.execute(db.sql('operator/addOperator.sql'), [ name, username, encryptPassword, salt1, salt2, status ]);
    return { code: 'common.success' }
  } catch (err) {
    console.log(err);
    throw err;
  }
}

service.updateOperator = async (name, username, status, roleId, id) => {
  try {
    let conn = await db.getConn('main:read')
    let conn1 = await db.getConn('main:write')
    let operator = (await conn.execute(db.sql('operator/getOperatorById.sql'), [ id ]))[0];
    if (operator.length === 0) {
      return { code: "code.operator.noExist", msg: "Operator Not Found" }
    }
    if (roleId) {
      let roleData = (await conn.execute(db.sql('role/getRoleById.sql'), [ roleId ]))[0];
      if (roleData.length === 0) {
        return { code: "code.role.noExist", msg: "Operator Role Not Found" }
      }
    }
    await conn1.execute(db.sql('operator/updateOperator.sql'), [ name, username, status, roleId, id ])
    return { code: 'common.success' }
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
}

service.updatePassword = async (password, id) => {
  try {
    let conn = await db.getConn('main:read')
    let conn1 = await db.getConn('main:write')
    let operator = (await conn.execute(db.sql('operator/getOperatorById.sql'), [ id ]))[0];
    if (operator.length === 0) {
      return { code: "code.operator.noExist", msg: "Operator Not Found" }
    }
    const salt1 = encrypt.getSalt(10)
    const salt2 = encrypt.getSalt(12)
    const operatorPwd = encrypt.encryptPassword(password, salt1, salt2);
    await conn1.execute(db.sql('operator/updatePassword.sql'), [ operatorPwd, salt1, salt2, id ])
    return { code: 'common.success' }
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
}

service.login = async (username, password) => {
  try {
    let conn = await db.getConn('main:read')
    let result = (await conn.execute(db.sql('operator/getOperatorByUsername.sql'), [ username ]))[0];
    if (result.length === 0) {
      return { code: 'code.operator.noExist', user: null }
    }
    let user = result[0];
    if (user.Status !== 1) {
      return { code: 'code.account.disabled', user: null }
    }
    if (user.Password !== encrypt.encryptPassword(password, user.Salt1, user.Salt2)) {
      return { code: 'code.auth.login.invalid', user: null }
    }
    return { code: 'common.success', user: { id: user.Id, username: user.Username, name: user.Name, roleId: user.RoleId, role: user.Role }}
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
}

module.exports = service;