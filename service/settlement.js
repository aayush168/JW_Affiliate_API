let service = {};
let path = require('path');
let _ = require('underscore');
let db = require(path.join(rootPath, 'db', 'index.js'));

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
  }catch(err){
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
    let carriedRevenue = [];
    let conn = await db.getConn('jw');
    let xconn;
    if (process.env.mode && !process.env.mode.includes('ape')) {
      xconn = await db.getConn('extra1:read');
    }
    let [netWinSummary, promotionSummary, otherBonusSummary] = await Promise.all([
      getNetWinSummary(conn, startDate), getPromotionSummary(conn, startDate), getOtherBonusCarriedRevenue(xconn, startDate, memberUsername)
    ]);
    let calculatedPromotion = getTotalPromotion(promotionSummary[0], otherBonusSummary);
    let netWinGroup = _.groupBy(netWinSummary[0], 'Name');
    let promotionGroup = _.groupBy(calculatedPromotion, 'Name');
    let keys = _.keys(netWinGroup);
    for (var i = 0; i < keys.length; i++) {
      let agentName = keys[i];
      let netWin = netWinGroup[agentName], promotion = promotionGroup[agentName];
      let mergedArray = _.map(netWin, function (x) {
        let f = _.find(promotion, function (y) { return (y.Date === x.Date) && y });
        if (f) {
          return { ...x, ...f, NetRevenue: parseFloat(x.Revenue) - parseFloat(f.Promotion) }
        } else {
          return { ...x, Promotion: 0, NetRevenue: parseFloat(x.Revenue) }
        }
      });
      let carriedRevenueAmt = 0, netLoss = 0;
      _.each(mergedArray, function (item) {
        if (netLoss < 0) { carriedRevenueAmt = netLoss }
        if (carriedRevenueAmt > 0 || netLoss >= 0) { carriedRevenueAmt = 0 }
        netLoss = parseFloat(netLoss) + parseFloat(item.NetRevenue)
        if (netLoss > 0) { netLoss = 0; }
      })
      carriedRevenue.push({ Name: agentName, Revenue: netLoss })
    }
    return carriedRevenue;
  }catch(err){
    console.log(err);
    throw err;
  }
};

service.getOtherBonus = async function (startDate, endDate, memberUsername) {
  let data = []
  let xconn = await db.getConn('extra1:read');
  let agentGroupBy = _.groupBy(memberUsername, function (item) { return item.Name })
  let keys = _.keys(agentGroupBy);
  for (let i = 0; i < keys.length; i++) {
    let agent = keys[i];
    let agentPlayers = _.pluck(agentGroupBy[agent], 'Username');
    let bonusAmount = 0;
    let agentPlayer = _.chunk(agentPlayers, 50000);
    for (var j = 0; j < agentPlayer.length; j++) {
      let agPlayer = agentPlayer[j]
      let bonus = (await xconn.query({ sql: db.sql('memberBonus/getTotalBonusAmount.sql'), values: [
        agPlayer, startDate, endDate,
        agPlayer, startDate, endDate,
        agPlayer, startDate, endDate,
        agPlayer, startDate, endDate,
        agPlayer, startDate, endDate,
        agPlayer, startDate, endDate
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
  if (process.env.mode && process.env.mode.includes('ape')) {
    return data;
  }
  let agentGroupBy = _.groupBy(memberUsername, function (item) { return item.Name });
  let keys = _.keys(agentGroupBy);
  for (let i = 0; i < keys.length; i++) {
    let agent = keys[i];
    let agentPlayers = _.pluck(agentGroupBy[agent], 'Username');
    let totalBonus = {};
    let agentPlayer = _.chunk(agentPlayers, 50000);
    for (let j = 0; j < agentPlayer.length; j++) {
      let agPlayer = agentPlayer[j];
      let bonus = (await xconn.query({ sql: db.sql('memberBonus/getCarriedBonusAmount.sql'), values: [
        agPlayer, startDateTime,
        agPlayer, startDateTime,
        agPlayer, startDateTime,
        agPlayer, startDateTime,
        agPlayer, startDateTime,
        agPlayer, startDateTime
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
  if (process.env.mode && process.env.mode === 'bvprod') {
    return conn.query({ sql: db.sql('settlementMultiCurrency/getMemberUsername.sql'), values: [ endDate ] });
  } else {
    return conn.query({ sql: db.sql('settlement/getMemberUsername.sql'), values: [ endDate ] });
  }
}

function getBetData(conn, startDate, endDate){
  if (process.env.mode && process.env.mode === 'bvprod') {
    return conn.query({ sql: db.sql('settlementMultiCurrency/getBetData.sql'), values: [ startDate, endDate ] });
  } else {
    return conn.query({ sql: db.sql('settlement/getBetData.sql'), values: [ startDate, endDate ] });
  }
}

function getPromotion(conn, startDate, endDate){
  if (process.env.mode && process.env.mode === 'bvprod') {
    return conn.query({ sql: db.sql('settlementMultiCurrency/getPromotion.sql'), values: [ startDate, endDate, startDate, endDate, startDate, endDate ] });
  } else {
    return conn.query({ sql: db.sql('settlement/getPromotion.sql'), values: [ startDate, endDate, startDate, endDate, startDate, endDate ] });
  }
}

function getMembers(conn, endDate){
  if (process.env.mode && process.env.mode === 'bvprod') {
    return conn.query({ sql: db.sql('settlementMultiCurrency/getMembers.sql'), values: [ endDate ] });
  } else {
    return conn.query({ sql: db.sql('settlement/getMembers.sql'), values: [ endDate ] });
  }
}

function getNetWinSummary(conn, startDate){
  if (process.env.mode && process.env.mode === 'bvprod') {
    return conn.query({ sql: db.sql('settlementMultiCurrency/getNetWinSummary.sql'), values: [ startDate ] });
  } else {
    return conn.query({ sql: db.sql('settlement/getNetWinSummary.sql'), values: [ startDate ] });
  }
}

function getPromotionSummary (conn, startDate) {
  if (process.env.mode && process.env.mode === 'bvprod') {
    return conn.query({ sql: db.sql('settlementMultiCurrency/getPromotionSummary.sql'), values: [ startDate, startDate, startDate ]});
  } else {
    return conn.query({ sql: db.sql('settlement/getPromotionSummary.sql'), values: [ startDate, startDate, startDate ]});
  }
}

module.exports = service;