let service = {};
let path = require('path');
let _ = require('underscore');
const moment = require('moment-timezone')
let db = require(path.join(rootPath, 'db', 'index.js'));
let config = require(path.join(rootPath, 'config', 'index.js'));
const mode = process.env.mode

let ocmsAgentId = parseInt(config.app.agentIdOCMS)

service.getMemberUsername = async function (endDate) {
  try {
    let conn = await db.getConn('jw');
    let result = await getMemberUsername(conn, endDate)
    return result[0];
  } catch (err) {
    console.log(err);
    throw err;
  }
}

service.getFirstDepositMembers = async function (startDate, endDate) {
  try {
    let conn = await db.getConn('jw');
    let result = await getFirstDepositMembers(conn, startDate, endDate);
    return result[0];
  } catch (err) {
    console.log(err);
    throw err;
  }
}

service.getMemberDeposits = async function (startDate, endDate) {
  try {
    let conn = await db.getConn('jw');
    let result = await getMemberDeposits(conn, startDate, endDate)
    return result[0];
  } catch (err) {
    console.log(err);
    throw err;
  }
}

service.getTotalMembers = async function () {
  try {
    let conn = await db.getConn('jw');
    let result = await getTotalMembers(conn)
    return result[0];
  } catch (err) {
    console.log(err);
    throw err;
  }
}

service.getMembersCountByDate = async function (startDate, endDate) {
  try {
    let conn = await db.getConn('jw');
    let result = await getMembersByDate(conn, startDate, endDate)
    return result[0];
  } catch (err) {
    console.log(err);
    throw err;
  }
}

service.getBetData = async function (startDate, endDate) {
  try {
    let conn = await db.getConn('jw');
    let result = await getBetData(conn, startDate, endDate)
    return result[0];
  } catch (err) {
    console.log(err);
    throw err;
  }
}

service.getPromotion = async function(startDate, endDate){
  try{
    let conn = await db.getConn('jw');
    let result = await getPromotion(conn, startDate, endDate);
    return result[0];
  } catch(err){
    console.log(err);
    throw err;
  }
};

service.getMembers = async function (endDate) {
  try {
    let conn = await db.getConn('jw');
    let result = await getMembers(conn, endDate);
    return result[0];
  } catch (err) {
    console.log(err);
    throw err;
  }
}

service.getCarriedRevenue = async function(startDate, memberUsername){
  try{
    let conn = await db.getConn('extra:read');
    const dateFormat = 'YYYY-MM-DD'
    const lastMonthEnd = moment(startDate).endOf('months').format(dateFormat)
    const lastMonthStart = moment(startDate).startOf('months').format(dateFormat)
    const carriedRevenue = (await getSettlementCarriedRevenue(conn, lastMonthStart, lastMonthEnd))[0]
    return carriedRevenue;
  } catch(err) {
    console.log(err);
    throw err;
  }
};

service.getOtherBonus = async function (startDate, endDate, memberUsername) {
  let data = []
  console.log(startDate, endDate, memberUsername)
  return data
}

function getMemberUsername (conn, endDate) {
  if (mode && mode.includes('siprod')) {
    return conn.query({ sql: db.sql('settlement/getMemberUsername.sql'), values: [ endDate ] });
  } else {
    return conn.query({ sql: db.sql('settlementMultiCurrency/getMemberUsername.sql'), values: [ endDate, ocmsAgentId ] });
  }
}

function getMembersByDate (conn, startDate, endDate) {
  if (mode && mode.includes('siprod')) {
    return conn.query({ sql: db.sql('settlement/getMembersByDate.sql'), values: [ startDate, endDate ] });
  } else {
    return conn.query({ sql: db.sql('settlementMultiCurrency/getMembersByDate.sql'), values: [ startDate, endDate, ocmsAgentId ] });
  }
}

function getTotalMembers (conn) {
  if (mode && mode.includes('siprod')) {
    return conn.query({ sql: db.sql('settlement/getTotalRegisteredMembers.sql') });
  } else {
    return conn.query({ sql: db.sql('settlementMultiCurrency/getTotalRegisteredMembers.sql'), values: [ ocmsAgentId ] });
  }
}

function getBetData(conn, startDate, endDate){
  if (mode && mode.includes('siprod')) {
    return conn.query({ sql: db.sql('settlement/getBetData.sql'), values: [ startDate, endDate ] });
  } else {
    return conn.query({ sql: db.sql('settlementMultiCurrency/getBetData.sql'), values: [ startDate, endDate, ocmsAgentId ] });
  }
}

function getFirstDepositMembers(conn, startDate, endDate){
  console.log(startDate, endDate);
  if (mode && mode.includes('siprod')) {
    return conn.query({ sql: db.sql('settlement/getFirstDepositMembers.sql'), values: [ startDate, endDate ] });
  } else {
    return conn.query({ sql: db.sql('settlementMultiCurrency/getFirstDepositMembers.sql'), values: [ startDate, endDate, ocmsAgentId ] });
  }
}

function getMemberDeposits(conn, startDate, endDate){
  if (mode && mode.includes('siprod')) {
    return conn.query({ sql: db.sql('settlement/getMemberDeposits.sql'), values: [ startDate, endDate ] });
  } else {
    return conn.query({ sql: db.sql('settlementMultiCurrency/getMemberDeposits.sql'), values: [ startDate, endDate, ocmsAgentId ] });
  }
}

function getPromotion(conn, startDate, endDate){
  if (mode && mode.includes('siprod')) {
    return conn.query({ sql: db.sql('settlement/getPromotion.sql'), values: [ startDate, endDate, startDate, endDate, startDate, endDate ] });
  } else {
    return conn.query({ sql: db.sql('settlementMultiCurrency/getPromotion.sql'), values: [ startDate, endDate, ocmsAgentId ] });
  }
}

function getMembers(conn, endDate){
  if (mode && mode.includes('siprod')) {
    return conn.query({ sql: db.sql('settlement/getMembers.sql'), values: [ endDate ] });
  } else {
    return conn.query({ sql: db.sql('settlementMultiCurrency/getMembers.sql'), values: [ endDate, ocmsAgentId ] });
  }
}

function getSettlementCarriedRevenue (conn, startDate, endDate) {
  return conn.query({ sql: db.sql('settlementMultiCurrency/getNegativeCarryover.sql'), values: [ startDate, endDate ]});
}

module.exports = service;