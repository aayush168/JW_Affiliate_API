let service = {};
let _ = require('underscore');
let path = require('path');
let memoize = require('memoizee');
let moment = require('moment-timezone');
let _CACHE_MAX_AGE = 300000;
let db = require(path.join(rootPath, 'db', 'index.js'));
let ocms = require(path.join(rootPath, 'ocms', 'index.js'));
let mTurnoverData = memoize(ocms.getTurnoverData, { primitive: true, maxAge: _CACHE_MAX_AGE, promise: true });

service.getCurrentBetData = async function(agentCode, startDateTime, endDateTime, username = ""){
  let conn;
  try{
    conn = await db.getConn('jw');
    let result = await getCurrentBetData(conn, agentCode, startDateTime, endDateTime, username);
    return result;
  }catch(err){
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
    let xconn;
    if (process.env.mode && !process.env.mode.includes('ape')) {
      xconn = await db.getConn('extra1:read');
    }
    let netWinSummary = (await conn.query({ sql: db.sql('revenue/getNetWinSummary.sql'), values: [ agentCode, startDateTime, `%${username}%` ] }))[0];
    let promotionSummary = (await conn.query({ sql: db.sql('revenue/getPromotionSummary.sql'), values: [ agentCode, startDateTime, `%${username}%` ,agentCode, startDateTime, `%${username}%` ,agentCode, startDateTime, `%${username}%` ]}))[0];
    let agentMember = (await conn.query({ sql: db.sql('revenue/getAgentPlayer.sql'), values: [ agentCode, `%${username}%` ]}))[0];
    let memberUsername = _.pluck(agentMember, 'Username');
    let memberId = _.pluck(agentMember, 'MemberId');
    let memberUsers = _.chunk(memberUsername, 50000);
    let memberIds = _.chunk(memberId, 50000);
    let totalBonus = {};
    if (process.env.mode && !process.env.mode.includes('ape')) {
      for (var i = 0; i < memberUsers.length; i++) {
        let users = memberUsers[i];
        let usersId = memberIds[i];
        let bonus = (await xconn.query({ sql: db.sql('memberBonus/getCarriedBonusAmount.sql'), values: [
          usersId, startDateTime,
          usersId, startDateTime,
          users, startDateTime,
          usersId, startDateTime,
          usersId, startDateTime,
          usersId, startDateTime
        ]}))[0];
        _.each(bonus, function (x) {
          totalBonus[x.Date] = !(x.Date in totalBonus) ? parseFloat(x.TotalAmount) : totalBonus[x.Date] + parseFloat(x.TotalAmount);
        });
      }
    }
    if (Object.keys(totalBonus).length > 0) {
      totalBonus = Object.keys(totalBonus).map(x => { return { Date: x, Promotion: totalBonus[x]  } });
    }
    let data;
    if (process.env.mode.includes('ape') || Object.keys(totalBonus).length === 0) {
      data = [...promotionSummary];
    } else {
      if (Object.keys(totalBonus).length > 0) {
        data = [ ...totalBonus, ...promotionSummary];
      } else {
        data = [...promotionSummary];
      }
    }
    let promotionCarried = Object.values(data).reduce(function (prev, next) {
      prev[next.Date] = { Date: next.Date, Promotion: (prev[next.Date] ? prev[next.Date].Promotion : 0) + parseFloat(next.Promotion) }
      return prev;
    }, {});

    let mergedArray = _.map(netWinSummary, function (x) {
      let f = _.find(promotionCarried, function (y) { return (y.Date == x.Date ) && y })
      if (f) {
        return { ...x, ...f, NetRevenue: parseFloat(x.Revenue) - parseFloat(f.Promotion) }
      } else {
        return { ...x, Promotion: 0, NetRevenue: parseFloat(x.Revenue) }
      }
    })
    let carriedRevenue = 0, netLoss = 0;
    _.each(mergedArray, function (item) {
      if (netLoss < 0) { carriedRevenue = netLoss }
      if (carriedRevenue > 0 || netLoss >= 0) { carriedRevenue = 0 }
      netLoss = parseFloat(netLoss) + parseFloat(item.NetRevenue)
      if (netLoss > 0) { netLoss = 0; }
    })
    return { Revenue: netLoss };
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

  let agentPlayer = (await conn.query({ sql: db.sql('revenue/getAgentPlayer.sql'), values: [ agentCode, `%${username}%` ] }))[0];
  let agentPlayerUsername = _.pluck(agentPlayer, 'Username');

  if (!(moment(moment(startDate).format('YYYY-MM-DD')).isSame(moment(moment(endDate).format('YYYY-MM-DD'))))) {
    let sStartDate = moment(startDateTime).format('YYYY-MM-DD');
    let sEndDate = moment(endDateTime).subtract({ days: 1 }).format('YYYY-MM-DD');
    
    let result = (await conn.query({ sql: db.sql('revenue/getTotalTurnoverNetwin.sql'), values: [ agentCode, sStartDate, sEndDate, `%${username}%` ]}))[0];
    if (result.length !== 0) {
      TotalTurnover += parseFloat(result[0].Turnover)
      TotalNetWin += parseFloat(result[0].Revenue)
    }
    startDate = moment(sEndDate).add({ days: 1 }).format('YYYY-MM-DD 00:00:00');
    endDate = endDateTime;
  }
  let betData = await mTurnoverData(startDate, endDate);
  for (let i = 0; i < betData.length; i++) {
    let bData = betData[i];
    if (agentPlayerUsername.includes(bData.memberUserId)) {
      TotalTurnover += parseFloat(bData.betAmount)
      TotalNetWin += parseFloat(bData.winAmount)
    }
  }
  return { Turnover: TotalTurnover, Revenue: (TotalNetWin * -1)}
}

function getCurrentPromotion(conn, agentCode, startDateTime, endDateTime, username){
  return conn.query({ sql: db.sql('revenue/getCurrentPromotion.sql'), values: [
    agentCode, startDateTime, endDateTime, `%${username}%`,
    agentCode, startDateTime, endDateTime, `%${username}%`,
    agentCode, startDateTime, endDateTime, `%${username}%`
  ] });
}

module.exports = service;
