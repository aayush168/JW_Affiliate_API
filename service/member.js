let service = {};
const _ = require('underscore');
const path = require('path');
const db = require(path.join(rootPath, 'db', 'index.js'));

service.getPlayers = async function(agentCode, start, end, username, status, index) {
  try {
    let conn = await db.getConn('jw')
    let sql = db.sql('member/getPlayers.sql')
    sql = sql.replace('${Username}', (username === '') ? '' : ` AND m.Username LIKE "%${username}%"`)
    sql = sql.replace('${Status}', (status === '') ? '' : ` AND m.Status = ${status}`)
    sql = sql.replace('${StartDate}', (start === '') ? '' : ` AND m.AddTime >= "${start}"`)
    sql = sql.replace('${EndDate}', (end === '') ? '' : ` AND m.AddTime <= "${end}"`)
    const result = await conn.query({ sql: sql, values: [ agentCode, index ]});
    if(result[0].length === 0){
      return null;
    }
    return result[0];
  } catch (err) {
    console.log(err);
    throw err;
  }
}

service.getPlayersCount = async function(agentCode, start, end, username, status) {
 try{
    let conn = await db.getConn('jw')
    let sql = db.sql('member/getPlayersCount.sql')
    sql = sql.replace('${Username}', (username === '') ? '' : ` AND m.Username LIKE "%${username}%"`)
    sql = sql.replace('${Status}', (status === '') ? '' : ` AND m.Status = ${status}`)
    sql = sql.replace('${StartDate}', (start === '') ? '' : ` AND m.AddTime >= "${start}"`)
    sql = sql.replace('${EndDate}', (end === '') ? '' : ` AND m.AddTime <= "${end}"`)
    const result = await conn.query({ sql: sql, values: [ agentCode ]});
    if(result[0].length === 0){
      return null;
    }
    return result[0][0];
 } catch (err) {
    console.log(err);
    throw err;
 }
}

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

function getActivePlayersCount(conn, agentCode, start, end){
  return conn.query({ sql: db.sql('member/getActivePlayersCount.sql'), values: [agentCode, start, end]});
}

module.exports = service;
