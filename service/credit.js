let service = {}
const path = require('path');
const db = require(path.join(rootPath, 'db', 'index.js'));
const ocms = require(path.join(rootPath, 'ocms', 'index.js'));
const moment = require('moment-timezone');

service.getCreditLogList = async (size, page, username, addTime, amount) => {
  try {
    let conn = await db.getConn('extra:read')
    let startTime
    if (addTime !== '') {
      startTime = moment(addTime).format('YYYY-MM-DD 00:00:00')
    }
    let sql = db.sql('credit/getCreditLogs.sql')
    sql = sql.replace('${Username}', (username === '') ? '' : ` WHERE c.Username LIKE "%${username}%"`)
    sql = sql.replace('${AddTime}', (addTime === '') ? '' : `${username === '' && amount === '' ? 'WHERE' : 'AND' } cl.Created_at >= "${startTime}"`)
    sql = sql.replace('${Amount}', (amount === '') ? '' : `${username === '' && addTime === '' ? 'WHERE' : 'AND' } cl.Amount LIKE "%${amount}%"`)
    const result = await conn.query({ sql: sql, values: [page, size] })

    let sqlCount = db.sql('credit/getCreditLogsCount.sql')
    sqlCount = sqlCount.replace('${Username}', (username === '') ? '' : ` WHERE c.Username LIKE "%${username}%"`)
    sqlCount = sqlCount.replace('${AddTime}', (addTime === '') ? '' : `${username === '' && amount === '' ? 'WHERE' : 'AND' } cl.Created_at >= "${startTime}"`)
    sqlCount = sqlCount.replace('${Amount}', (amount === '') ? '' : `${username === '' && addTime === '' ? 'WHERE' : 'AND' } cl.Amount LIKE "%${amount}%"`)
    const rowCount = (await conn.query({ sql: sqlCount }))[0]
    return { code: 'common.success', list: result[0], rowCount: rowCount[0].Count }
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
}

service.getAgentList = async (size, page, username) => {
  try {
    let conn = await db.getConn('extra:read')
    let sql = db.sql('credit/getAgentList.sql')
    let sqlCount = db.sql('credit/getAgentListCount.sql')
    const result = await conn.query({ sql: sql, values: [`%${username}%`, page, size] })
    const rowCount = (await conn.query({ sql: sqlCount, values: [`%${username}%`, page, size] }))[0]
    return { code: 'common.success', list: result[0], rowCount: rowCount[0].Count }
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
}

service.updateCredit = async (agentId, operatorId, amount, type, memo) => {
  try {
    let conn = await db.getConn('extra:read')
    let conn1 = await db.getConn('extra:write')
    let customer = (await conn.query({ sql: db.sql('credit/getAgentAccount.sql'), values: [ agentId ]}))[0];
    let dbCreditBalance;
    if (customer.length === 0) {
      dbCreditBalance = 0;
    } else {
      dbCreditBalance = customer[0].Balance
    }
    let creditAmount
    if (type === 2) {
      creditAmount = amount * -1
    } else {
      creditAmount = amount
    }
    const newBalance = dbCreditBalance + creditAmount
    if (type === 2 && newBalance < 0) {
      return { code: "code.agent.insufficientBalance", msg: "Customer has insufficient balance." }
    }
    if (customer.length === 0) {
      await conn1.query({ sql: db.sql('credit/addCredit.sql'), values: [agentId, newBalance]})
    } else {
      await conn1.query({ sql: db.sql('credit/updateCredit.sql'), values: [newBalance, agentId]})
    }
    await conn1.query({ sql: db.sql('credit/addCreditLog.sql'), values: [agentId, operatorId, creditAmount, memo]})
    return { code: 'common.success' }
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
}

const addTransferLog = async (conn, operatorId, username, status, money) => {
  const sql = db.sql('transfer/addAgentTransferLog.sql');
  const transferLogParams = [operatorId, username, status, money];
  await conn.query({ sql, values: transferLogParams });
};

service.creditBatchAdd = async (items, operatorId) => {
  try {
    const connRead = await db.getConn('extra:read');
    const connJW = await db.getConn('jw');
    const connWrite = await db.getConn('extra:write');
    
    const validationFailed = items.some(item => !item.hasOwnProperty('amount') || !item.hasOwnProperty('username'));
    if (validationFailed) {
      return { code: "code.file.invalid", msg: "Invalid Data file" }
    }

    await Promise.all(items.map(async (item) => {
      const agent = (await connRead.query(db.sql('credit/getAgentAccountByUsername.sql'), [item.username]))[0];
      if (agent.length > 0) {
        const agentId = agent[0].AgentId;
        const creditAmount = parseFloat(item.amount);
        const currentYear = moment().year();
        const currentMonth = moment().month() + 1;

        const transferLog = (await connRead.query(db.sql('transfer/getAgentTransferLog.sql'), [item.username, currentYear, currentMonth]))[0];
        if (transferLog.length === 0) {
          const paymentInfo = (await connRead.query(db.sql('agent/getPaymentInfo.sql'), [agentId]))[0];
          const playerAccountUsername = paymentInfo[0].PlayerAccountUsername;
          const username = (await connJW.query(db.sql('agent/ocms/getPlayerAccountByUsernameUnfrozen.sql'), [playerAccountUsername]))[0];
          if (username.length > 0) {
            const { MemberId } = username[0];
            try {
              await ocms.addBalancePlayerAccount(MemberId, creditAmount, item.username);
              await addTransferLog(connWrite, operatorId, item.username, creditAmount, 1);
            } catch (err) {
              console.log(err)
            }
          } else {
            await addTransferLog(connWrite, operatorId, item.username, creditAmount, 2);
          }
        } else {
          await addTransferLog(connWrite, operatorId, item.username, creditAmount, 2);
        }
      } else {
        console.log(`${item.username} username not found for batch credit`);
      }
    }));
    return { code: 'common.success' }
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
}

module.exports = service; 