let service = {}
const path = require('path');
let db = require(path.join(rootPath, 'db', 'index.js'));

service.getWithdrawRequest = async (size, startIndex, { username, status, createdAt }) => {
  try {
    const conn = await db.getConn('extra:read');
    const sql = db.sql('money/admin/getWithdrawRequest.sql');
    const sqlCount = db.sql('money/admin/getWithdrawRequestCount.sql');

    const queryParams = [`%${username}%`, startIndex, size];
    const countParams = [`%${username}%`];

    let modifiedSql = sql;
    let modifiedSqlCount = sqlCount;

    if (status === '') {
      modifiedSql = modifiedSql.replace('${Status}', '');
      modifiedSqlCount = modifiedSqlCount.replace('${Status}', '');
    } else {
      modifiedSql = modifiedSql.replace('${Status}', `AND a.Status = '${status}'`);
      modifiedSqlCount = modifiedSqlCount.replace('${Status}', `AND a.Status = '${status}'`);
    }

    if (createdAt === '') {
      modifiedSql = modifiedSql.replace('${CreatedAt}', '');
      modifiedSqlCount = modifiedSqlCount.replace('${CreatedAt}', '');
    } else {
      modifiedSql = modifiedSql.replace('${CreatedAt}', `AND a.Created_at >= '${createdAt}'`);
      modifiedSqlCount = modifiedSqlCount.replace('${CreatedAt}', `AND a.Created_at >= '${createdAt}'`);
    }

    const result = await conn.query({ sql: modifiedSql, values: queryParams });
    const rowCount = (await conn.query({ sql: modifiedSqlCount, values: countParams }))[0];

    return { 
      code: 'common.success',
      list: result[0],
      rowCount: rowCount[0].Count
    };
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
};

service.transferWithdrawRequestOCMS = async (withdrawId) => {
  try {
    const conn = await db.getConn('extra:read');
    const conn1 = await db.getConn('jw');

    const sql = db.sql('money/admin/getWithdrawRequestById.sql');
    const sqlUsername = db.sql('agent/ocms/getPlayerAccountByUsername.sql');

    const queryParams = [withdrawId];

    const withdrawRequest = (await conn.query({ sql: sql, values: queryParams }))[0];
    if (withdrawRequest.length === 0) {
      return { code: "code.withdrawRequest.invalid", msg: "Withdraw Request not exist" };
    }
    
    const { PlayerAccountUsername, Money, Status } = withdrawRequest[0][0]

    if (parseInt(Status) === 1) {

      const usernameParams = [PlayerAccountUsername]
      const username = (await conn1.query({ sql: sqlUsername, values: usernameParams }))[0];
      
      if (username.length === 0) {
        return { code: "code.username.invalid", msg: "Invalid Player Account Registered" };
      }

    } else {
      return { code: "code.withdrawRequest.invalid", msg: "Request has been handled. Please refresh and try again" };
    }
    return { 
      code: 'common.success',
    };
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
};

module.exports = service;