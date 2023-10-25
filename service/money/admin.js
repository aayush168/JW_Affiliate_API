let service = {}
const path = require('path');
const db = require(path.join(rootPath, 'db', 'index.js'));
const ocms = require(path.join(rootPath, 'ocms', 'index.js'));

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

const getPlayerAccountByUsername = async (conn, username) => {
  const sql = db.sql('agent/ocms/getPlayerAccountByUsername.sql');
  const queryParams = [username];
  const result = await conn.query({ sql, values: queryParams });
  return result[0];
};

const updateCredit = async (conn, balance, agentId) => {
  const sql = db.sql('credit/updateCredit.sql');
  const updateBalanceParams = [balance, agentId];
  await conn.query({ sql, values: updateBalanceParams });
};

const updateWithdraw = async (conn, status, operatorId, withdrawId) => {
  const sql = db.sql('money/admin/updateWithdraw.sql');
  const updateWithdrawParams = [status, operatorId, withdrawId];
  await conn.query({ sql, values: updateWithdrawParams });
};

const addWithdrawLog = async (conn, withdrawId, money, balanceBefore, balanceAfter, status) => {
  const sql = db.sql('money/admin/addWithdrawLog.sql');
  const withdrawLogParams = [withdrawId, money, balanceBefore, balanceAfter, status];
  await conn.query({ sql, values: withdrawLogParams });
};

service.transferBalancePlayerAccount = async (withdrawId, operatorId) => {
  try {
    const connRead = await db.getConn('extra:read');
    const connJW = await db.getConn('jw');
    const connWrite = await db.getConn('extra:write');

    const sqlGetWithdrawRequest = db.sql('money/admin/getWithdrawRequestById.sql');
    const withdrawParams = [withdrawId];
    const withdrawRequest = (await connRead.query({ sql: sqlGetWithdrawRequest, values: withdrawParams }))[0];

    if (withdrawRequest.length === 0) {
      return { code: 'code.withdrawRequest.invalid', msg: 'Withdraw Request does not exist' };
    }

    const { PlayerAccountUsername, Money, Status, Balance, AgentUsername, AgentId } = withdrawRequest[0];

    if (parseInt(Status) !== 0) {
      return { code: 'code.withdrawRequest.invalid', msg: 'Request has already been handled. Please refresh and try again' };
    }

    const username = await getPlayerAccountByUsername(connJW, PlayerAccountUsername);
    if (username.length === 0) {
      return { code: 'code.username.invalid', msg: 'Invalid Player Account Registered' };
    }

    if (Money > Balance) {
      return { code: 'code.amount.invalid', msg: 'Invalid Amount. Please check and try again' };
    }

    try {
      const { MemberId } = username[0];
      await ocms.addBalancePlayerAccount(MemberId, Money, AgentUsername);
      const remainingBalance = parseFloat(Balance) - parseFloat(Money);
      await updateCredit(connWrite, remainingBalance, AgentId);
      await updateWithdraw(connWrite, 1, operatorId, withdrawId);
      await addWithdrawLog(connWrite, withdrawId, Money, parseFloat(Balance), remainingBalance, 1);

      return { code: 'common.success' };
    } catch (err) {
      console.log(err, 'ocms api error');
      await updateWithdraw(connWrite, 2, operatorId, withdrawId);
      await addWithdrawLog(connWrite, withdrawId, Money, parseFloat(Balance), parseFloat(Balance), 2);

      return { code: 'code.money.transferFail', msg: 'Transfer Failed' };
    }
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
};

service.batchTransferPlayerAccount = async (operatorId) => {
  try {
    const connRead = await db.getConn('extra:read');
    const connJW = await db.getConn('jw');
    const connWrite = await db.getConn('extra:write');

    const getPendingWithdrawRequest = db.sql('money/admin/getPendingWithdrawRequest.sql');
    const withdrawRequest = (await connRead.query({ sql: getPendingWithdrawRequest }))[0];

    if (withdrawRequest.length === 0) {
      return { code: 'code.pendingRequest.empty', msg: 'No pending request remaining' };
    }
    for (let i = 0; i < withdrawRequest.length; i++) {
      const request = withdrawRequest[i]
      const { PlayerAccountUsername, Money, Status, Balance, AgentUsername, AgentId } = request;
      const username = await getPlayerAccountByUsername(connJW, PlayerAccountUsername);
      if (username.length === 0 || parseInt(Status) !== 0 || Money > Balance) {
        // Validation fail case
        console.log('test', PlayerAccountUsername)
        await updateWithdraw(connWrite, 2, operatorId, request.Id);
        await addWithdrawLog(connWrite, request.Id, Money, parseFloat(Balance), parseFloat(Balance), 2);
      } else {
        const { MemberId } = username[0];
        await ocms.addBalancePlayerAccount(MemberId, Money, AgentUsername);
        const remainingBalance = parseFloat(Balance) - parseFloat(Money);
        await updateCredit(connWrite, remainingBalance, AgentId);
        await updateWithdraw(connWrite, 1, operatorId, request.Id);
        await addWithdrawLog(connWrite, request.Id, Money, parseFloat(Balance), remainingBalance, 1);
      }
    }
    return { code: 'common.success' };
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
};

module.exports = service;