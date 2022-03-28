let path = require('path');
let _ = require('underscore');
let memoize = require('memoizee');
let config = require(path.join(rootPath, 'config', 'index.js'));
let _CACHE_MAX_AGE = 1000 * 60 * 60 * 24 * 7;
let settlementService = require(path.join(rootPath, 'service', 'settlement.js'));
let mGetMemberUsername = memoize(settlementService.getMemberUsername, { primitive: true, maxAge: _CACHE_MAX_AGE, promise: true });
let mGetMembers = memoize(settlementService.getMembers, { primitive: true, maxAge: _CACHE_MAX_AGE, promise: true });
let mGetBetData = memoize(settlementService.getBetData, { primitive: true, maxAge: _CACHE_MAX_AGE, promise: true });
let mGetPromotion = memoize(settlementService.getPromotion, { primitive: true, maxAge: _CACHE_MAX_AGE, promise: true });
let mGetCarriedRevenue = memoize(settlementService.getCarriedRevenue, { primitive: true, maxAge: _CACHE_MAX_AGE, promise: true });
let mGetOtherBonus = memoize(settlementService.getOtherBonus, { primitive: true, maxAge: _CACHE_MAX_AGE, promise: true });
let controller = {};

async function getMembers (endDate) {
  const result = await mGetMembers(`${endDate} 23:59:59`)
  return result;
}
async function getBetData (startDate, endDate) {
  const result = await mGetBetData(`${startDate} 00:00:00`, `${endDate} 23:59:59`);
  return result;
}
async function getPromotion (startDate, endDate) {
  const result = await mGetPromotion(`${startDate} 00:00:00`, `${endDate} 23:59:59`);
  return result;
}

async function getMemberUsername (endDate) {
  let result = await mGetMemberUsername(`${endDate} 23:59:59`);
  return result;
}

async function getCarriedRevenue (startDate, memberUsername) {
  const result = await mGetCarriedRevenue(`${startDate} 00:00:00`, memberUsername);
  return result;
}
async function getOtherBonus (startDate, endDate, memberUsername) {
  if (process.env.mode && process.env.mode.includes('ape')) {
    return []
  }
  const result =  await mGetOtherBonus(`${startDate} 00:00:00`, `${endDate} 23:59:59`, memberUsername);
  return result
}

controller.getSettlementData = async function (startDate, endDate) {
  let affiliates = [];

  let [ members, betData, promotionData, memberUsername ] = await Promise.all([
    getMembers(endDate),
    getBetData(startDate, endDate),
    getPromotion(startDate, endDate),
    getMemberUsername(endDate)
  ]);
  let [ carriedRevenue, otherBonus ] = await Promise.all([
    getCarriedRevenue(startDate, memberUsername),
    getOtherBonus(startDate, endDate, memberUsername)
  ])
  _.each(members, function (item) {
    let data = {
      name: item.Name,
      members: parseInt(item.Count),
      turnover: 0,
      revenue: 0,
      carried: 0,
      level: '',
      earning: 0
    }
    let carried = _.find(carriedRevenue, function(i){ return (item.Name === i.Name) ? true : false; });
    let bet = _.find(betData, function (i) { return (item.Name === i.Name ) ? true : false; });
    let promotion = _.find(promotionData, function(i){ return (item.Name === i.Name) ? true : false; });
    let bonus = _.find(otherBonus, function (i) { return (item.Name === i.Name) ? true : false; });
    data.turnover = (bet) ? parseFloat(bet.Turnover) : 0;
    data.revenue = (bet) ? parseFloat(bet.Revenue) : 0;
    let operationCost = data.revenue < 0 ? 0 : config.commission.operationCost;
    data.operationCost = data.revenue * operationCost;
    let promotionAmount = (promotion) ? parseFloat(promotion.Amount) : 0;
    let bonusAmount = (bonus) ? parseFloat(bonus.TotalBonus) : 0;
    data.promotion = parseFloat(promotionAmount) + parseFloat(bonusAmount);
    data.carried = (carried) ? ((carried.Revenue < 0) ? parseFloat(carried.Revenue) : 0) : 0;
    let result = calculateEarning(data.members, data.revenue, data.promotion, data.carried);
    data.level = (result.percentage === 0.1) ? 'Level 1 (10%)' : (result.percentage === 0.2) ? 'Level 2 (20%)' : (result.percentage === 0.3) ? 'Level 3 (30%)' : (result.percentage === 0.35) ? 'Level 4 (35%)' : '';
    data.earning = result.earning;
    affiliates.push(data)
  })
  return { affiliates: affiliates }
}

function calculateEarning(members, revenue, promotion, carried){
  if((revenue - promotion) <= 0){
    return { earning: 0, percentage: 0 };
  }
  let operationCost = parseFloat(revenue) < 0 ? 0 : config.commission.operationCost;
  let netRevenue = parseFloat(revenue) - parseFloat(promotion) - parseFloat(carried * -1) - (parseFloat(revenue) * operationCost);
  let earning = 0;
  let percentage = 0;
  let commission = config.commission.level;

  if (commission.length === 1) {
    percentage = commission[0]['rate'];
  }

  if (commission.length === 4) {
    if (members >= commission[3]['members'] && netRevenue >= commission[3]['minRevenue']) {
      percentage = commission[3]['rate'];
    } else if (members >= commission[2]['members'] && netRevenue >= commission[2]['minRevenue']) {
      percentage = commission[2]['rate'];
    } else if (members >= commission[1]['members'] && netRevenue >= commission[1]['minRevenue']) {
      percentage = commission[1]['rate'];
    } else if (members >= commission[0]['members'] && netRevenue >= commission[0]['minRevenue']) {
      percentage = commission[0]['rate'];
    }
  }
  
  earning = netRevenue * percentage;
  return { earning: earning, percentage: percentage };
}

module.exports = controller;