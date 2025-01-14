let path = require('path');
let memoize = require('memoizee');
let config = require(path.join(rootPath, 'config', 'index.js'));
let _CACHE_MAX_AGE = 60000;
let revenueService = require(path.join(rootPath, 'service', 'revenue.js'));
let memberService = require(path.join(rootPath, 'service', 'member.js'));
let mEnableMembers = memoize(memberService.getPlayersCount, { primitive: true, maxAge: _CACHE_MAX_AGE, promise: true });
let mTotalMembers = memoize(memberService.getPlayersTotalCount, { primitive: true, maxAge: _CACHE_MAX_AGE, promise: true });
let mActiveMembers = memoize(memberService.getActivePlayersCount, { primitive: true, maxAge: _CACHE_MAX_AGE, promise: true });
let mCurrentBetData = memoize(revenueService.getCurrentBetData, { primitive: true, maxAge: _CACHE_MAX_AGE, promise: true });
let mCarriedRevenue = memoize(revenueService.getCarriedRevenue, { primitive: true, maxAge: _CACHE_MAX_AGE, promise: true });
let mCurrentPromotion = memoize(revenueService.getCurrentPromotion, { primitive: true, maxAge: _CACHE_MAX_AGE, promise: true });
let mBonusAmount = memoize(revenueService.getBonusAmount, { primitive: true, maxAge: _CACHE_MAX_AGE, promise: true });
let controller = {};
const mode = process.env.mode


controller.getEstimateRevenue = async function(agentCode, start, end, username = ''){
  let [enableMembers, newMembers, activePlayerCount, currentPromotion, currentBetData, carriedRevenue] = await Promise.all([
    mTotalMembers(`${agentCode}`),
    mEnableMembers(`${agentCode}`, `${start} 00:00:00`, `${end} 23:59:59`, '', ''),
    mActiveMembers(`${agentCode}`, start, end),
    mCurrentPromotion(`${agentCode}`, `${start} 00:00:00`, `${end} 23:59:59`, username),
    mCurrentBetData(`${agentCode}`, `${start} 00:00:00`, `${end} 23:59:59`, username),
    mCarriedRevenue(`${agentCode}`, `${start} 00:00:00`, username),
  ])
  let bonusAmount = 0;
  if (mode && !mode.includes('12betkh')) {
    bonusAmount = await mBonusAmount(agentCode, `${start} 00:00:00`, `${end} 23:59:59`, username);
  }
  let promotionAmount = parseFloat(currentPromotion.Amount) + parseFloat(bonusAmount);
  let cRevenue = (carriedRevenue.Revenue >= 0) ? 0 : parseFloat(carriedRevenue.Revenue);
  let earning = calculateEstimateEarning(parseFloat(enableMembers.TotalCount), parseFloat(currentBetData.Revenue), cRevenue, parseFloat(promotionAmount));
  return { members: parseFloat(activePlayerCount.TotalCount), turnover: parseFloat(currentBetData.Turnover), revenue: parseFloat(currentBetData.Revenue), carried: cRevenue, promotion: parseFloat(promotionAmount), earning: earning.earning, platformFee: earning.fee, commissionRate: earning.commissionRate, totalMembers: parseFloat(enableMembers.TotalCount), newMembers: newMembers.TotalCount };
};

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

function calculateEstimateEarning(members, revenue, carried, promotion) {
  const payload = {
    earning: 0,
    fee: 0,
    commissionRate: 0
  }
  if ((revenue - promotion) <= 0) {
    return payload
  }
  payload.fee = parseFloat(revenue) < 0 ? 0 : config.commission.operationCost;
  let operationCost = parseFloat(revenue) < 0 ? 0 : config.commission.operationCost;
  let netRevenue = parseFloat(revenue) - parseFloat(promotion) - parseFloat(carried * -1) - (parseFloat(revenue) * operationCost);
  let commission = config.commission.level;

  const data = calculateEarning(netRevenue, members, commission);
  payload.earning = data.earning
  payload.commissionRate = data.percentage
  return payload
}

module.exports = controller;
