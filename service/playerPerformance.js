let service = {};
const _ = require('underscore');
const path = require('path');
const db = require(path.join(rootPath, 'db', 'index.js'));

service.getBetData = async function(agentCode, startDateTime, endDateTime, username){
  let conn;
  let cUsername = (username == "" || _.isUndefined(username)) ? 1 : 0;
  try{
    conn = await db.getConn('jw');
    console.time("getBetData");
    let result = await getBetData(conn, agentCode, startDateTime, endDateTime, cUsername, `%${username}%`);
    console.timeEnd("getBetData");
    return result[0];
  }catch(err){
    console.log(err);
    throw err;
  }
};

service.getTotalBetData = async function(agentCode, startDateTime, endDateTime, username){
  let conn;
  let cUsername = (username == "" || _.isUndefined(username)) ? 1 : 0;
  try{
    conn = await db.getConn('jw');
    console.time("getTotalBetData");
    let result = await getTotalBetData(conn, agentCode, startDateTime, endDateTime, cUsername, `%${username}%`);
    console.timeEnd("getTotalBetData");
    return result[0][0];
  }catch(err){
    console.log(err);
    throw err;
  }
};

service.getAccData = async function(agentCode, startDateTime, endDateTime, username){
  let conn;
  let cUsername = (username == "" || _.isUndefined(username)) ? 1 : 0;
  try{
    conn = await db.getConn('jw');
    console.time("getAccData");
    let result = await getAccData(conn, agentCode, startDateTime, endDateTime, cUsername, `%${username}%`);
    console.timeEnd("getAccData");
    return result[0];
  }catch(err){
    console.log(err);
    throw err;
  }
};

service.getFirstDepositData = async function(agentCode, startDateTime, endDateTime){
  try{
    const conn = await db.getConn('jw');
    console.time("getFirstDepositData");
    let result = await getFirstDepositData(conn, agentCode, startDateTime, endDateTime)
    console.timeEnd("getFirstDepositData");
    return result[0][0];
  }catch(err){
    console.log(err);
    throw err;
  }
};

service.getTotalAccData = async function(agentCode, startDateTime, endDateTime, username){
  let conn;
  let cUsername = (username == "" || _.isUndefined(username)) ? 1 : 0;
  try{
    conn = await db.getConn('jw');
    console.time("getTotalAccData");
    let result = await getTotalAccData(conn, agentCode, startDateTime, endDateTime, cUsername, `%${username}%`);
    console.timeEnd("getTotalAccData");
    return result[0][0];
  }catch(err){
    console.log(err);
    throw err;
  }
};

service.getBonusData = async function (agentCode, startDateTime, endDateTime, username) {
  try {
    let conn = await db.getConn('jw');
    let xconn = await db.getConn('extra1:read');
    let cUsername = (username === "" || _.isUndefined(username)) ? 1 : 0;
    let agentPlayer = (await conn.query({ sql: db.sql('realtimePlayer/getAgentPlayer.sql'), values: [ agentCode, cUsername, username ] }))[0];
    let memberUsername = _.pluck(agentPlayer, 'Username');
    let memberId = _.pluck(agentPlayer, 'MemberId');
    let bonusData = [];
    let memberUser = _.chunk(memberUsername, 50000);
    let memberIds = _.chunk(memberId, 50000);
    for (var i = 0; i < memberUser.length; i++) {
      let users = memberUser[i];
      let usersId = memberIds[i];
      let result = (await xconn.query({ sql: db.sql('memberBonus/getBonusData.sql'), values: [
        usersId, startDateTime, endDateTime,
        usersId, startDateTime, endDateTime,
        users, startDateTime, endDateTime,
        usersId, startDateTime, endDateTime,
        usersId, startDateTime, endDateTime,
        usersId, startDateTime, endDateTime,
        usersId, startDateTime, endDateTime
      ] }))[0];
      if (result.length !== 0) {
        bonusData.push(result);
      }
    }
    console.log(agentCode, startDateTime, endDateTime, username, 'getBonusData payload')
    return bonusData[0];
  } catch (err) {
    console.log(err);
    throw (err instanceof Error) ? new Error(err) : err;
  }
}

service.getTotalBonusData = async function (agentCode, startDateTime, endDateTime, username) {
  try {
    let conn = await db.getConn('jw');
    let xconn = await db.getConn('extra1:read');
    let cUsername = (username === "" || _.isUndefined(username)) ? 1 : 0;
    let agentPlayer = (await conn.query({ sql: db.sql('realtimePlayer/getAgentPlayer.sql'), values: [ agentCode, cUsername, username ] }))[0];
    let memberUsername = _.pluck(agentPlayer, 'Username');
    let memberId = _.pluck(agentPlayer, 'MemberId');
    let totalBonus = 0;
    let memberUsers = _.chunk(memberUsername, 50000);
    let memberIds = _.chunk(memberId, 50000);
    for (var i = 0; i < memberUsers.length; i++) {
      let users = memberUsers[i];
      let usersId = memberIds[i];
      let bonus = (await xconn.query({ sql: db.sql('memberBonus/getTotalBonusAmount.sql'), values: [
        usersId, startDateTime, endDateTime,
        usersId, startDateTime, endDateTime,
        users, startDateTime, endDateTime,
        usersId, startDateTime, endDateTime,
        usersId, startDateTime, endDateTime,
        usersId, startDateTime, endDateTime,
        usersId, startDateTime, endDateTime
      ]}))[0][0];
      totalBonus = parseFloat(totalBonus) + parseFloat(bonus.TotalAmount);
    }
    return totalBonus;
  } catch (err) {
    console.log(err);
    throw (err instanceof Error) ? new Error(err) : err;
  }
}

function getBetData(conn, agentCode, startDateTime, endDateTime, cUsername, username){
  return conn.query({ sql: db.sql('playerPerformance/getBetData.sql'), values: [agentCode, startDateTime, endDateTime, cUsername, username] });
}

function getTotalBetData(conn, agentCode, startDateTime, endDateTime, cUsername, username){
  return conn.query({ sql: db.sql('playerPerformance/getTotalBetData.sql'), values: [agentCode, startDateTime, endDateTime, cUsername, username] });
}

function getAccData(conn, agentCode, startDateTime, endDateTime, cUsername, username){
  return conn.query({ sql: db.sql('playerPerformance/getAccData.sql'), values: [agentCode, startDateTime, endDateTime, cUsername, username] });
}

function getFirstDepositData(conn, agentCode, startDateTime, endDateTime){
  return conn.query({ sql: db.sql('playerPerformance/getFirstDepositData.sql'), values: [agentCode, startDateTime, endDateTime] });
}


function getTotalAccData(conn, agentCode, startDateTime, endDateTime, cUsername, username){
  return conn.query({ sql: db.sql('playerPerformance/getTotalAccData.sql'), values: [agentCode, startDateTime, endDateTime, cUsername, username] });
}

module.exports = service;
