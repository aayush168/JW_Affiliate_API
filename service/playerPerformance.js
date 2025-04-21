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
