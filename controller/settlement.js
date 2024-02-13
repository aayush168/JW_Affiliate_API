let path = require('path');
let _ = require('underscore');
let memoize = require('memoizee');

let config = require(path.join(rootPath, 'config', 'index.js'));
let _CACHE_MAX_AGE = 1000 * 60 * 60 * 24;

let settlementService = require(path.join(rootPath, 'service', 'settlement.js'));
let mGetMemberUsername = memoize(settlementService.getMemberUsername, { primitive: true, maxAge: _CACHE_MAX_AGE, promise: true });
let mGetMembers = memoize(settlementService.getMembers, { primitive: true, maxAge: _CACHE_MAX_AGE, promise: true });
let mGetTotalMembers = memoize(settlementService.getTotalMembers, { primitive: true, maxAge: _CACHE_MAX_AGE, promise: true });
let mGetFirstDepositMembers = memoize(settlementService.getFirstDepositMembers, { primitive: true, maxAge: _CACHE_MAX_AGE, promise: true });

let mGetMemberDeposits = memoize(settlementService.getMemberDeposits, { primitive: true, maxAge: _CACHE_MAX_AGE, promise: true });

let mGetMemberByDate = memoize(settlementService.getMembersCountByDate, { primitive: true, maxAge: _CACHE_MAX_AGE, promise: true });

let mGetBetData = memoize(settlementService.getBetData, { primitive: true, maxAge: _CACHE_MAX_AGE, promise: true });
let mGetCarriedRevenue = memoize(settlementService.getCarriedRevenue, { primitive: true, maxAge: _CACHE_MAX_AGE, promise: true });
let mGetOtherBonus = memoize(settlementService.getOtherBonus, { primitive: true, maxAge: _CACHE_MAX_AGE, promise: true });
let controller = {};
const mode = process.env.mode

async function getMembers (endDate) {
  console.time('getMembers');
  const result = await mGetMembers(`${endDate} 23:59:59`)
  console.timeEnd("getMembers");
  return result;
}

async function getMembersbyDate (startDate, endDate) {
  console.time("getMembersbyDate");
  const result = await mGetMemberByDate(`${startDate} 00:00:00`, `${endDate} 23:59:59`)
  console.timeEnd("getMembersbyDate");
  return result;
}

async function getTotalMembers () {
  console.time("getTotalMembers");
  const result = await mGetTotalMembers()
  console.timeEnd("getTotalMembers");
  return result;
}

async function getFirstDepositMembers (startDate, endDate) {
  console.time("getFirstDepositMembers");
  const result = await mGetFirstDepositMembers(`${startDate} 00:00:00`, `${endDate} 23:59:59`);
  console.timeEnd("getFirstDepositMembers");
  return result;
}

async function getMemberDeposits (startDate, endDate) {
  console.time("getMemberDeposits");
  const result = await mGetMemberDeposits(`${startDate} 00:00:00`, `${endDate} 23:59:59`);
  console.timeEnd("getMemberDeposits");
  return result;
}

async function getBetData (startDate, endDate) {
  console.time("getBetData");
  const result = await mGetBetData(`${startDate} 00:00:00`, `${endDate} 23:59:59`);
  console.timeEnd("getBetData");
  return result;
}

async function getMemberUsername (endDate) {
  console.time("getMemberUsername");
  let result = await mGetMemberUsername(`${endDate} 23:59:59`);
  console.timeEnd("getMemberUsername");
  return result;
}

async function getCarriedRevenue (startDate, memberUsername) {
  console.time("getCarriedRevenue");
  const result = await mGetCarriedRevenue(`${startDate} 00:00:00`, memberUsername);
  console.timeEnd("getCarriedRevenue");
  return result;
}

async function getOtherBonus (startDate, endDate, memberUsername) {
  if (mode && mode.includes('ape') && !mode.includes('12betkh')) {
    return []
  }
  console.time("getOtherBonus");
  const result =  await mGetOtherBonus(`${startDate} 00:00:00`, `${endDate} 23:59:59`, memberUsername);
  console.timeEnd("getOtherBonus");
  return result
}

controller.getSettlementData = async function (startDate, endDate) {
  try {
    let affiliates = [];
    console.time('get-settlement');
    let [ members, betData, memberUsername, firstDepositMembers, totalUsers, memberDeposits, memberCount ] = await Promise.all([
      getMembers(endDate),
      getBetData(startDate, endDate),
      getMemberUsername(endDate),
      getFirstDepositMembers(startDate, endDate),
      getTotalMembers(),
      getMemberDeposits(startDate, endDate),
      getMembersbyDate(startDate, endDate)
    ]);
    console.timeEnd("get-settlement");
    console.time("carried-other-bonus");
    let [ carriedRevenue, otherBonus ] = await Promise.all([
      getCarriedRevenue(startDate, memberUsername),
      getOtherBonus(startDate, endDate, memberUsername)
    ])
    console.timeEnd("carried-other-bonus");
    _.each(members, function (item) {
      let data = {
        name: item.Name,
        username: item.Username,
        members: 0,
        totalMembers: 0,
        firstDeposit: 0,
        activeMembers: 0,
        turnover: 0,
        revenue: 0,
        promotion: 0,
        carried: 0,
        level: '',
        earning: 0,
        memberDeposit: 0,
        deduction: 0
      }
      let firstDeposit = _.find(firstDepositMembers, function(i){ return (item.Name === i.Name) ? true : false; });
      if (firstDeposit) {
        data.firstDeposit = firstDeposit.Count;
      }
      let activeMembers = _.find(betData, function(i){ return (item.Name === i.Name) ? true : false; });
      if (activeMembers) {
        data.activeMembers = activeMembers.Count;
      }
      let memberCountData = _.find(memberCount, function(i){ return (item.Name === i.Name) ? true : false; });
      if (memberCountData) {
        data.members = memberCountData.Count;
      }
      let totalMembers = _.find(totalUsers, function(i){ return (item.Name === i.Name) ? true : false; });
      if (totalMembers) {
        data.totalMembers = totalMembers.Count;
      }
      let depositMembers = _.find(memberDeposits, function(i){ return (item.Name === i.Name) ? true : false; });
      let promotion
      if (depositMembers) {
        data.memberDeposit = parseFloat(depositMembers.Deposit);
        promotion = depositMembers.Promotion;
      }
      let carried = _.find(carriedRevenue, function(i){ return (item.Username === i.Username) ? true : false; });
      let bet = _.find(betData, function (i) { return (item.Name === i.Name ) ? true : false; });
      let bonus = _.find(otherBonus, function (i) { return (item.Name === i.Name) ? true : false; });
      data.turnover = (bet) ? parseFloat(bet.Turnover) : 0;
      data.revenue = (bet) ? parseFloat(bet.Revenue) : 0;
      let operationCost = data.revenue < 0 ? 0 : config.commission.operationCost;
      data.operationCost = data.revenue * operationCost;
      let promotionAmount = (promotion) ? parseFloat(promotion) : 0;
      let bonusAmount = (bonus) ? parseFloat(bonus.TotalBonus) : 0
      data.promotion = parseFloat(promotionAmount) + parseFloat(bonusAmount);
      data.carried = (carried) ? ((carried.Amount < 0) ? parseFloat(carried.Amount) : 0) : 0;
      let result = calculateEstimateEarning(data.totalMembers, data.revenue, data.promotion, data.carried);
      if (mode && data.revenue && data.revenue > 0 && (parseFloat(data.revenue) - parseFloat(data.promotion) - parseFloat(data.carried * -1)) > 0) {
        data.deduction = parseFloat(config.commission.operationCost) * parseFloat(data.revenue);
      }
      data.level = (result.percentage === 0.1) ? 'Level 1 (10%)' : (result.percentage === 0.2) ? 'Level 2 (20%)' : (result.percentage === 0.3) ? 'Level 3 (30%)' : (result.percentage === 0.35) ? 'Level 4 (35%)' : '';
      data.earning = result.earning;
      affiliates.push(data)
    })
    return { affiliates: affiliates }
  } catch (err) {
    global.fetchingSettlement = false
    console.log('settlement err: ', err)
  }
}

function calculateEarning (revenue, members, commission) {
  let earning = 0;
  let percentage = 0
  for (let i = commission.length - 1; i >= 0; i--) {
    const c = commission[i];
    if (commission.length === 1) {
      earning = revenue * c['rate'];
      percentage = c['rate']
    } else if (members > c['members'] && revenue >= c['minRevenue']) {
      earning = revenue * c['rate'];
      percentage = c['rate']
    }
  }
  return {
    earning: earning,
    percentage: percentage
  };
}

function calculateEstimateEarning(members, revenue, promotion, carried) {
  let operationCost = parseFloat(revenue) < 0 ? 0 : config.commission.operationCost;
  if ((parseFloat(revenue) - parseFloat(promotion) - parseFloat(carried * -1)) - (parseFloat(revenue) * operationCost) <= 0) {
    return { earning: 0, percentage: 0 };
  }
  let netRevenue = parseFloat(revenue) - parseFloat(promotion) - parseFloat(carried * -1) - (parseFloat(revenue) * operationCost);
  let commission = config.commission.level;
  const data = calculateEarning(netRevenue, members, commission);
  return data;
}

module.exports = controller;