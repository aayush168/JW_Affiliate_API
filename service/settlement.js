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
    let conn = await db.getConn('extra1:read');
    const dateFormat = 'YYYY-MM-DD'
    const lastMonth = moment(startDate).subtract(1, 'months')
    const lastMonthEnd = moment(lastMonth).endOf('months').format(dateFormat)
    const lastMonthStart = moment(lastMonth).startOf('months').format(dateFormat)
    console.log(startDate, 'startDate test')
    console.log(lastMonthEnd, 'lastMonthEnd test')
    console.log(lastMonthStart, 'lastMonthStart test')
    const carriedRevenue = (await getSettlementCarriedRevenue(conn, lastMonthStart, lastMonthEnd))[0]
    return carriedRevenue;
  } catch(err) {
    console.log(err);
    throw err;
  }
};

service.getOtherBonus = async function (startDate, endDate, memberUsername) {
  let data = []
  if (mode && mode.includes('ape') || mode.includes('12bet')) {
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

function getTotalPromotion (promotionSummary, otherBonus) {
  let promoData = Object.values([ ...promotionSummary, ...otherBonus ]).reduce(function (prev, next) {
    prev[`${next.Name}-${next.Date}`] = { Name: next.Name, Date: next.Date, Promotion: (prev[`${next.Name}-${next.Date}`] ? prev[`${next.Name}-${next.Date}`].Promotion : 0) + parseFloat(next.Promotion) };
    return prev;
  }, {});
  return promoData;
  return [];
}

async function getOtherBonusCarriedRevenue (xconn, startDateTime, memberUsername) {
  let data = [];
  if (mode && mode.includes('ape') || mode.includes('12bet')) {
    return data;
  }
  let agentGroupBy = _.groupBy(memberUsername, function (item) { return item.Name });
  let keys = _.keys(agentGroupBy);
  for (let i = 0; i < keys.length; i++) {
    let agent = keys[i];
    let agentPlayers = _.pluck(agentGroupBy[agent], 'Username');
    let agentPlayersId = _.pluck(agentGroupBy[agent], 'MemberId');
    let totalBonus = {};
    let agentPlayer = _.chunk(agentPlayers, 50000);
    for (let j = 0; j < agentPlayer.length; j++) {
      let agPlayer = agentPlayer[j];
      let agPlayerId = agentPlayersId[j];
      let bonus = (await xconn.query({ sql: db.sql('memberBonus/getCarriedBonusAmount.sql'), values: [
        agPlayerId, startDateTime,
        agPlayerId, startDateTime,
        agPlayer, startDateTime,
        agPlayerId, startDateTime,
        agPlayerId, startDateTime,
        agPlayerId, startDateTime,
        agPlayerId, startDateTime
      ]}))[0];
      _.each(bonus, function (x) {
        totalBonus[x.Date] = !(x.Date in totalBonus) ? parseFloat(x.TotalAmount) : totalBonus[x.Date] + parseFloat(x.TotalAmount);
      });
    }
    totalBonus = Object.keys(totalBonus).map(x => { return { Name: agent, Date: x, Promotion: totalBonus[x]  } });
    data = [ ...data, ...totalBonus ];
  }
  return data;
}

function getMemberUsername (conn, endDate) {
  return conn.query({ sql: db.sql('settlementMultiCurrency/getMemberUsername.sql'), values: [ endDate, ocmsAgentId ] });
}

function getMembersByDate (conn, startDate, endDate) {
  return conn.query({ sql: db.sql('settlementMultiCurrency/getMembersByDate.sql'), values: [ startDate, endDate, ocmsAgentId ] });
}

function getTotalMembers (conn) {
  return conn.query({ sql: db.sql('settlementMultiCurrency/getTotalRegisteredMembers.sql'), values: [ ocmsAgentId ] });
}

function getBetData(conn, startDate, endDate){
  return conn.query({ sql: db.sql('settlementMultiCurrency/getBetData.sql'), values: [ startDate, endDate, ocmsAgentId ] });
}

function getFirstDepositMembers(conn, startDate, endDate){
  console.log(startDate, endDate);
  return conn.query({ sql: db.sql('settlementMultiCurrency/getFirstDepositMembers.sql'), values: [ startDate, endDate, ocmsAgentId ] });
}

function getMemberDeposits(conn, startDate, endDate){
  return conn.query({ sql: db.sql('settlementMultiCurrency/getMemberDeposits.sql'), values: [ startDate, endDate, ocmsAgentId ] });
}

function getPromotion(conn, startDate, endDate){
  return conn.query({ sql: db.sql('settlementMultiCurrency/getPromotion.sql'), values: [ startDate, endDate, ocmsAgentId ] });
}

function getMembers(conn, endDate){
  return conn.query({ sql: db.sql('settlementMultiCurrency/getMembers.sql'), values: [ endDate, ocmsAgentId ] });
}

function getNetWinSummary(conn, startDate){
  return conn.query({ sql: db.sql('settlementMultiCurrency/getNetWinSummary.sql'), values: [ startDate, ocmsAgentId ] });
}

function getPromotionSummary (conn, startDate) {
  return conn.query({ sql: db.sql('settlementMultiCurrency/getPromotionSummary.sql'), values: [ startDate, startDate, startDate, ocmsAgentId ]});
}

function getSettlementCarriedRevenue (conn, startDate, endDate) {
  return conn.query({ sql: db.sql('settlementMultiCurrency/getNegativeCarryover.sql'), values: [ startDate, endDate ]});
}

module.exports = service;