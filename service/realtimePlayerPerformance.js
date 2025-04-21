let service = {};
let _ = require('underscore');
let path = require('path');
let memoize = require('memoizee');
let _CACHE_MAX_AGE = 300000;
let db = require(path.join(rootPath, 'db', 'index.js'));
let ocms = require(path.join(rootPath, 'ocms', 'index.js'));
let mTurnoverData = memoize(ocms.getTurnoverData, { primitive: true, maxAge: _CACHE_MAX_AGE, promise: true });

service.getBetData = async function(agentCode, startDateTime, endDateTime, username){
  let conn;
  let cUsername = (username == "" || _.isUndefined(username)) ? 1 : 0;
  try{
    conn = await db.getConn('jw');
    let result = await mGetBetData(conn, agentCode, startDateTime, endDateTime, cUsername, username);
    return result;
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
    let result = await mGetTotalBetData(conn, agentCode, startDateTime, endDateTime, cUsername, username);
    return result;
  }catch(err){
    console.log(err);
    throw err;
  }
};

service.getDepositData = async function(agentCode, startDateTime, endDateTime, username){
  let conn;
  let cUsername = (username == "" || _.isUndefined(username)) ? 1 : 0;
  try{
    conn = await db.getConn('jw');
    let result = await getDepositData(conn, agentCode, startDateTime, endDateTime, cUsername, username);
    return result[0];
  }catch(err){
    console.log(err);
    throw err;
  }
};

service.getTotalDepositData = async function(agentCode, startDateTime, endDateTime, username){
  let conn;
  let cUsername = (username == "" || _.isUndefined(username)) ? 1 : 0;
  try{
    conn = await db.getConn('jw');
    let result = await getTotalDepositData(conn, agentCode, startDateTime, endDateTime, cUsername, username);
    return result[0][0];
  }catch(err){
    console.log(err);
    throw err;
  }
};

service.getWithdrawData = async function(agentCode, startDateTime, endDateTime, username){
  let conn;
  let cUsername = (username == "" || _.isUndefined(username)) ? 1 : 0;
  try{
    conn = await db.getConn('jw');
    let result = await getWithdrawData(conn, agentCode, startDateTime, endDateTime, cUsername, username);
    return result[0];
  }catch(err){
    console.log(err);
    throw err;
  }
};

service.getTotalWithdrawData = async function(agentCode, startDateTime, endDateTime, username){
  let conn;
  let cUsername = (username == "" || _.isUndefined(username)) ? 1 : 0;
  try{
    conn = await db.getConn('jw');
    let result = await getTotalWithdrawData(conn, agentCode, startDateTime, endDateTime, cUsername, username);
    return result[0][0];
  }catch(err){
    console.log(err);
    throw err;
  }
};

service.getPromotionData = async function(agentCode, startDateTime, endDateTime, username){
  let conn;
  let cUsername = (username == "" || _.isUndefined(username)) ? 1 : 0;
  try{
    conn = await db.getConn('jw');
    let result = await getPromotionData(conn, agentCode, startDateTime, endDateTime, cUsername, username);
    return result[0];
  }catch(err){
    console.log(err);
    throw err;
  }
};

service.getTotalPromotionData = async function(agentCode, startDateTime, endDateTime, username){
  let conn;
  let cUsername = (username == "" || _.isUndefined(username)) ? 1 : 0;
  try{
    conn = await db.getConn('jw');
    let result = await getTotalPromotionData(conn, agentCode, startDateTime, endDateTime, cUsername, username);
    return result[0][0];
  }catch(err){
    console.log(err);
    throw err;
  }
};

let getBetData = async function (conn, agentCode, startDateTime, endDateTime, cUsername, username){
  let agentPlayer = (await conn.query({ sql: db.sql('realtimePlayer/getAgentPlayer.sql'), values: [ agentCode, cUsername, username ] }))[0];
  let agentPlayerUsername = _.pluck(agentPlayer, 'Username');
  let betData = await mTurnoverData(startDateTime, endDateTime);
  let dataArr = _.filter(betData, function (item) {
    return agentPlayerUsername.includes(item.memberUserId)
  });
  return _.map(dataArr, function (item) { return { Username: item.memberUserId, Turnover: item.betAmount, NetWin: item.winAmount } });
}

let mGetBetData = memoize(getBetData, { primitive: true, maxAge: _CACHE_MAX_AGE, promise: true });

let getTotalBetData = async function(conn, agentCode, startDateTime, endDateTime, cUsername, username){
  let TotalTurnover = 0, TotalNetWin = 0;
  let result = await mGetBetData(conn, agentCode, startDateTime, endDateTime, cUsername, username);
  for (let i = 0; i < result.length; i++) {
    let d = result[i];
    TotalTurnover += parseFloat(d.Turnover);
    TotalNetWin += parseFloat(d.NetWin);
  }
  return { Turnover: TotalTurnover, NetWin: TotalNetWin }
}

let mGetTotalBetData = memoize(getTotalBetData, { primitive: true, maxAge: _CACHE_MAX_AGE, promise: true });

function getDepositData(conn, agentCode, startDateTime, endDateTime, cUsername, username){
  return conn.query({ sql: db.sql('realtimePlayer/getDepositData.sql'), values: [
    agentCode, startDateTime, endDateTime,
    agentCode, startDateTime, endDateTime,
    agentCode, startDateTime, endDateTime,
    cUsername, username] });
}

function getTotalDepositData(conn, agentCode, startDateTime, endDateTime, cUsername, username){
  return conn.query({ sql: db.sql('realtimePlayer/getTotalDepositData.sql'), values: [
    agentCode, startDateTime, endDateTime,
    agentCode, startDateTime, endDateTime,
    agentCode, startDateTime, endDateTime,
    cUsername, username] });
}

function getWithdrawData(conn, agentCode, startDateTime, endDateTime, cUsername, username){
  return conn.query({ sql: db.sql('realtimePlayer/getWithdrawData.sql'), values: [agentCode, startDateTime, endDateTime, cUsername, username] });
}

function getTotalWithdrawData(conn, agentCode, startDateTime, endDateTime, cUsername, username){
  return conn.query({ sql: db.sql('realtimePlayer/getTotalWithdrawData.sql'), values: [agentCode, startDateTime, endDateTime, cUsername, username] });
}

function getPromotionData(conn, agentCode, startDateTime, endDateTime, cUsername, username){
  return conn.query({ sql: db.sql('realtimePlayer/getPromotionData.sql'), values: [
    agentCode, startDateTime, endDateTime, cUsername, username,
    agentCode, startDateTime, endDateTime, cUsername, username,
    agentCode, startDateTime, endDateTime, cUsername, username
  ] });
}

function getTotalPromotionData(conn, agentCode, startDateTime, endDateTime, cUsername, username){
  return conn.query({ sql: db.sql('realtimePlayer/getTotalPromotionData.sql'), values: [
    agentCode, startDateTime, endDateTime, cUsername, username,
    agentCode, startDateTime, endDateTime, cUsername, username,
    agentCode, startDateTime, endDateTime, cUsername, username
  ] });
}

module.exports = service;
