let service = {};
let _ = require('underscore');
let path = require('path');
let memoize = require('memoizee');
let moment = require('moment-timezone');
let _CACHE_MAX_AGE = 300000;
let db = require(path.join(rootPath, 'db', 'index.js'));
let ocms = require(path.join(rootPath, 'ocms', 'index.js'));

let config = require(path.join(rootPath, 'config', 'index.js'));
const ocmsAgentId = parseInt(config.app.agentIdOCMS)

service.getCurrentBetData = async function(agentCode, startDateTime, endDateTime, username = ""){
  let conn;
  try {
    conn = await db.getConn('jw');
    let result = await getCurrentBetData(conn, agentCode, startDateTime, endDateTime, username);
    return result;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

service.getCurrentPromotion = async function(agentCode, startDateTime, endDateTime, username = ''){
  let conn;
  try{
    conn = await db.getConn('jw');
    let result = await getCurrentPromotion(conn, agentCode, startDateTime, endDateTime, username);
    return result[0][0];
  }catch(err){
    console.log(err);
    throw err;
  }
};

service.getCarriedRevenue = async function(agentCode, startDateTime, username = ""){
  try{
    let conn = await db.getConn('jw');
    let xconn = await db.getConn('extra:read');
    let agentData = (await conn.query({ sql: db.sql('revenue/getAgentData.sql'), values: [ agentCode, ocmsAgentId ] }))[0];
    if (agentData.length === 0) {
      return { Revenue: 0 }
    }
    const agentUsername = agentData[0].Username
    const dateFormat = 'YYYY-MM-DD'
    const lastMonthEnd = moment(startDateTime).endOf('months').format(dateFormat)
    const lastMonthStart = moment(startDateTime).startOf('months').format(dateFormat)
    let agentNegativeData = (await xconn.query({ sql: db.sql('revenue/getNegativeCarryover.sql'), values: [ lastMonthStart, lastMonthEnd, agentUsername ]}))[0];
    if (agentNegativeData.length === 0) {
      return { Revenue: 0 }
    }
    const amount = parseFloat(agentNegativeData[0].Amount)
    return { Revenue: amount }
  } catch(err){
    console.log(err);
    throw err;
  }
};

service.getBonusAmount = async function (agentCode, startDateTime, endDateTime, username = "") {
  try {
    let conn = await db.getConn('jw');
    let xconn = await db.getConn('extra1:read');
    let agentMember = (await conn.query({sql: db.sql('revenue/getAgentPlayer.sql'), values: [ agentCode, `%${username}%` ]}))[0];
    let memberUsername = _.pluck(agentMember, 'Username');
    let memberId = _.pluck(agentMember, 'MemberId');
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
      ] }))[0][0];
      totalBonus = parseFloat(totalBonus) + parseFloat(bonus.TotalAmount);
    }
    return totalBonus
  } catch (err) {
    console.log(err);
    throw (err instanceof Error) ? new Error(err) : err;
  }
}

let getCurrentBetData = async function (conn, agentCode, startDateTime, endDateTime, username){
  let TotalTurnover = 0, TotalNetWin = 0;
  let startDate = startDateTime;
  let endDate = endDateTime;
  if (!(moment(moment(startDate).format('YYYY-MM-DD')).isSame(moment(moment(endDate).format('YYYY-MM-DD'))))) {
    let sStartDate = moment(startDateTime).format('YYYY-MM-DD');
    let sEndDate = moment(endDateTime).subtract({ days: 1 }).format('YYYY-MM-DD');
    console.log(sStartDate, sEndDate, 'date test')
    let result = (await conn.query({ sql: db.sql('revenue/getTotalTurnoverNetwin.sql'), values: [ agentCode, `${sStartDate} 00:00:00`, `${sEndDate} 23:59:59`, `%${username}%` ]}))[0];
    let resultRefund = (await conn.query({ sql: db.sql('revenue/getRefundNetwin.sql'), values: [ agentCode, `${sStartDate} 00:00:00`, `${sEndDate} 23:59:59` ]}))[0];
    if (result.length !== 0) {
      TotalTurnover += parseFloat(result[0].Turnover)
      TotalNetWin += parseFloat(result[0].Revenue) - parseFloat(resultRefund[0].RefundNetwin)
    }
  }
  return { Turnover: TotalTurnover, Revenue: (TotalNetWin * -1)}
}

function getCurrentPromotion(conn, agentCode, startDateTime, endDateTime, username){
  return conn.query({ sql: db.sql('revenue/getCurrentPromotionNew.sql'), values: [
    agentCode, startDateTime, endDateTime, `%${username}%`,
  ] });
}

module.exports = service;
