let service = {};
const _ = require('underscore');
const path = require('path');
const db = require(path.join(rootPath, 'db', 'index.js'));

service.getPlayers = async function(agentCode, start, end, username, status, index){
  let cStart = (start == "" || _.isUndefined(start)) ? 1 : 0;
  let cEnd = (end == "" || _.isUndefined(end)) ? 1 : 0;
  let cUsername = (username == "" || _.isUndefined(username)) ? 1 : 0;
  let cStatus = (status == "" || _.isUndefined(status)) ? 1 : 0;
  let conn;
  try{
    conn = await db.getConn('jw');
    let result = await getPlayers(conn, `${agentCode}%`, cUsername, `%${username}%`, cStatus, status, cStart, start, cEnd, end, index);
    if(result[0].length === 0){
      return null;
    }
    return result[0];
  } catch (err) {
    console.log(err);
    throw err;
  }
};

service.getPlayersCount = async function(agentCode, start, end, username, status){
  let cStart = (start == "" || _.isUndefined(start)) ? 1 : 0;
  let cEnd = (end == "" || _.isUndefined(end)) ? 1 : 0;
  let cUsername = (username == "" || _.isUndefined(username)) ? 1 : 0;
  let cStatus = (status == "" || _.isUndefined(status)) ? 1 : 0;
  let conn;
  try{
    conn = await db.getConn('jw');
    let result = await getPlayersCount(conn, `${agentCode}%`, cUsername, `%${username}%`, cStatus, status, cStart, start, cEnd, end);
    if(result[0].length === 0){
      return null;
    }
    return result[0][0];
  }catch(err){
    console.log(err);
    throw err;
  }
};

service.getActivePlayersCount = async function(agentCode, start, end){
  try{
    let conn = await db.getConn('jw');
    let result = await getActivePlayersCount(conn, `${agentCode}%`, start, end);
    if(result[0].length === 0){
      return null;
    }
    return result[0][0];
  }catch(err){
    console.log(err);
    throw err;
  }
};

function getPlayers(conn, agentCode, cUsername, username, cStatus, status, cStart, start, cEnd, end, index){
  let sql = db.sql('member/getPlayers.sql');
  sql = sql.replace('$start', index);
  return conn.query({ sql: sql, values: [agentCode, cUsername, username, cStatus, status, cStart, start, cEnd, end]});
}

function getPlayersCount(conn, agentCode, cUsername, username, cStatus, status, cStart, start, cEnd, end){
  return conn.query({ sql: db.sql('member/getPlayersCount.sql'), values: [agentCode, cUsername, username, cStatus, status, cStart, start, cEnd, end]});
}

function getActivePlayersCount(conn, agentCode, start, end){
  return conn.query({ sql: db.sql('member/getActivePlayersCount.sql'), values: [agentCode, start, end]});
}

module.exports = service;
