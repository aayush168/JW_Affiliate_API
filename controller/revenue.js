let path = require('path');
let memoize = require('memoizee');
let config = require(path.join(rootPath, 'config', 'index.js'));
let _CACHE_MAX_AGE = 60000;
let revenueService = require(path.join(rootPath, 'service', 'revenue.js'));
let memberService = require(path.join(rootPath, 'service', 'member.js'));
let mEnableMembers = memoize(memberService.getPlayersCount, { primitive: true, maxAge: _CACHE_MAX_AGE, promise: true });
let mActiveMembers = memoize(memberService.getActivePlayersCount, { primitive: true, maxAge: _CACHE_MAX_AGE, promise: true });
let mCurrentBetData = memoize(revenueService.getCurrentBetData, { primitive: true, maxAge: _CACHE_MAX_AGE, promise: true });
let mCarriedRevenue = memoize(revenueService.getCarriedRevenue, { primitive: true, maxAge: _CACHE_MAX_AGE, promise: true });
let mCurrentPromotion = memoize(revenueService.getCurrentPromotion, { primitive: true, maxAge: _CACHE_MAX_AGE, promise: true });
let mBonusAmount = memoize(revenueService.getBonusAmount, { primitive: true, maxAge: _CACHE_MAX_AGE, promise: true });
let controller = {};

controller.getEstimateRevenue = async function(agentCode, start, end, username = ''){
  let enableMembers = await mEnableMembers(`${agentCode}%`, '', '', username, 0);
  let newMembers = await mEnableMembers(`${agentCode}%`, `${start} 00:00:00`, `${end} 23:59:59`);
  let activePlayerCount = await mActiveMembers(`${agentCode}%`, start, end);
  let currentPromotion = await mCurrentPromotion(`${agentCode}%`, `${start} 00:00:00`, `${end} 23:59:59`, username);
  let currentBetData = await mCurrentBetData(`${agentCode}%`, `${start} 00:00:00`, `${end} 23:59:59`, username);
  let carriedRevenue = await mCarriedRevenue(`${agentCode}%`, `${start} 00:00:00`, username);
  let bonusAmount = 0;
  if (process.env.mode && !process.env.mode.includes('ape')) {
    bonusAmount = await mBonusAmount(`${agentCode}%`, `${start} 00:00:00`, `${end} 23:59:59`, username);
  }
  let promotionAmount = parseFloat(currentPromotion.Amount) + parseFloat(bonusAmount);
  let cRevenue = (carriedRevenue.Revenue >= 0) ? 0 : parseFloat(carriedRevenue.Revenue);
  let earning = calculateEarning(parseFloat(enableMembers.TotalCount), parseFloat(currentBetData.Revenue), cRevenue, parseFloat(promotionAmount));
  return { members: parseFloat(activePlayerCount.TotalCount), turnover: parseFloat(currentBetData.Turnover), revenue: parseFloat(currentBetData.Revenue), carried: cRevenue, promotion: parseFloat(promotionAmount), earning: earning, totalMembers: parseFloat(enableMembers.TotalCount), newMembers: newMembers.TotalCount };
};

function calculateEarning(members, revenue, carried, promotion) {
  if ((revenue - promotion) <= 0) {
    return 0;
  }
  let operationCost = parseFloat(revenue) < 0 ? 0 : config.commission.operationCost;
  let netRevenue = parseFloat(revenue) - parseFloat(promotion) - parseFloat(carried * -1) - (parseFloat(revenue) * operationCost);
  let earning = 0;
  let commission = config.commission.level;
  if (commission.length === 1) {
    earning = netRevenue * commission[0]['rate'];
    if (process.env.mode && process.env.mode.includes('bvprod') && earning && earning > 0) {
      return .95 * earning;
    }
    return earning;
  }
  if (commission.length === 4) {
    if (members >= commission[3]['members'] && netRevenue >= commission[3]['minRevenue']) {
      earning = netRevenue * commission[3]['rate'];
    } else if (members >= commission[2]['members'] && netRevenue >= commission[2]['minRevenue']) {
      earning = netRevenue * commission[2]['rate'];
    } else if (members >= commission[1]['members'] && netRevenue >= commission[1]['minRevenue']) {
      earning = netRevenue * commission[1]['rate'];
    } else if (members >= commission[0]['members'] && netRevenue >= commission[0]['minRevenue']) {
      earning = netRevenue * commission[0]['rate'];
    }
    if (process.env.mode && process.env.mode.includes('bvprod') && earning && earning > 0) {
      return .95 * earning;
    }
    return earning;
  }
}

module.exports = controller;
