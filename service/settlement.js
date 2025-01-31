let service = {};
let path = require('path');
let _ = require('underscore');
const moment = require('moment-timezone')
let db = require(path.join(rootPath, 'db', 'index.js'));
let config = require(path.join(rootPath, 'config', 'index.js'));
const mode = process.env.mode

const ocmsAgentId = parseInt(config.app.agentIdOCMS)

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

service.getRefundNetwin = async function (startDate, endDate) {
  try {
    let conn = await db.getConn('jw');
    let result = await getRefundNetwin(conn, startDate, endDate)
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
  if (mode || mode.includes('12bet')) {
    return data
  }
  let xconn = await db.getConn('extra1:read');
  let agentGroupBy = _.groupBy(memberUsername, function (item) { return item.Name })
  let keys = _.keys(agentGroupBy);
  for (let i = 0; i < keys.length; i++) {
    let agent = keys[i];
    let agentPlayers = _.pluck(agentGroupBy[agent], 'Username');
    let agentPlayersId = _.pluck(agentGroupBy[agent], 'MemberId');
    let bonusAmount = 0;
    let agentPlayer = _.chunk(agentPlayers, 50000);
    let agentPlayersIds = _.chunk(agentPlayersId, 50000);
    for (var j = 0; j < agentPlayer.length; j++) {
      let agPlayer = agentPlayer[j]
      let agPlayerId = agentPlayersIds[j]
      let bonus = (await xconn.query({ sql: db.sql('memberBonus/getTotalBonusAmount.sql'), values: [
        agPlayerId, startDate, endDate,
        agPlayerId, startDate, endDate,
        agPlayer, startDate, endDate,
        agPlayerId, startDate, endDate,
        agPlayerId, startDate, endDate,
        agPlayerId, startDate, endDate,
        agPlayerId, startDate, endDate
      ] }))[0];
      bonusAmount = parseFloat(bonusAmount) + parseFloat(bonus[0].TotalAmount);
    }
    if (bonusAmount !== 0) {
      data.push({ Name: agent, TotalBonus: bonusAmount });
    }
  }
  return data
}

function getMemberUsername (conn, endDate) {
  return conn.query({ sql: db.sql('settlement/getMemberUsername.sql'), values: [ endDate, ocmsAgentId ] });
}

function getMembersByDate (conn, startDate, endDate) {
  return conn.query({ sql: db.sql('settlement/getMembersByDate.sql'), values: [ startDate, endDate, ocmsAgentId ] });
}

function getTotalMembers (conn) {
  return conn.query({ sql: db.sql('settlement/getTotalRegisteredMembers.sql'), values: [ ocmsAgentId ] });
}

function getBetData(conn, startDate, endDate){
  return conn.query({ sql: db.sql('settlement/getBetData.sql'), values: [ startDate, endDate, ocmsAgentId ] });
}

function getRefundNetwin(conn, startDate, endDate){
  return conn.query({ sql: db.sql('settlement/getRefundNetwin.sql'), values: [ startDate, endDate, ocmsAgentId ] });
}

function getFirstDepositMembers(conn, startDate, endDate){
  console.log(startDate, endDate);
  return conn.query({ sql: db.sql('settlement/getFirstDepositMembers.sql'), values: [ startDate, endDate, ocmsAgentId ] });
}

function getMemberDeposits(conn, startDate, endDate){
  return conn.query({ sql: db.sql('settlement/getMemberDeposits.sql'), values: [ startDate, endDate, ocmsAgentId ] });
}

function getPromotion(conn, startDate, endDate){
  return conn.query({ sql: db.sql('settlement/getPromotion.sql'), values: [ startDate, endDate, ocmsAgentId ] });
}

function getMembers(conn, endDate){
  return conn.query({ sql: db.sql('settlement/getMembers.sql'), values: [ endDate, ocmsAgentId ] });
}

function getPromotionSummary (conn, startDate) {
  return conn.query({ sql: db.sql('settlement/getPromotionSummary.sql'), values: [ startDate, startDate, startDate, ocmsAgentId ]});
}

function getSettlementCarriedRevenue (conn, startDate, endDate) {
  return conn.query({ sql: db.sql('settlement/getNegativeCarryover.sql'), values: [ startDate, endDate ]});
}

module.exports = service;