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
  console.log(username)
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

function getPlayers(conn, agentCode, cUsername, username, cStatus, status, cStart, start, cEnd, end, index){
  let sql = db.sql('member/getPlayers.sql');
  sql = sql.replace('$start', index);
  return conn.execute(sql, [agentCode, cUsername, username, cStatus, status, cStart, start, cEnd, end]);
}

function getPlayersCount(conn, agentCode, cUsername, username, cStatus, status, cStart, start, cEnd, end){
  return conn.execute(db.sql('member/getPlayersCount.sql'), [agentCode, cUsername, username, cStatus, status, cStart, start, cEnd, end]);
}

module.exports = service;
