let path = require('path');
let _ = require('underscore');
let revenueEstimateController = require(path.join(rootPath, 'service', 'revenueEstimate.js'));
let controller = {};

controller.getrevenueEstimate = async function(agentCode, startDate, endDate, index){
  let data = [];
  let total = {
    members: 0,
    turnover: 0,
    revenue: 0,
    negativeRevenue: 0,
    estimateEar: 0,
  };

  let totalMembers = await realtimePlayerPerformanceService.getTotalBetData(`${agentCode}%`, `${startDate} 00:00:00`, `${endDate} 23:59:59`, username);
  let totalTurnover = await realtimePlayerPerformanceService.getTotalDepositData(`${agentCode}%`, `${startDate} 00:00:00`, `${endDate} 23:59:59`, username);
  let totalRevenue = await realtimePlayerPerformanceService.getTotalWithdrawData(`${agentCode}%`, `${startDate} 00:00:00`, `${endDate} 23:59:59`, username);
  let totalnegativeRevenue = await realtimePlayerPerformanceService.getTotalPromotionData(`${agentCode}%`, `${startDate} 00:00:00`, `${endDate} 23:59:59`, username);

  _.each(betData, function(item){
    let obj = {
      name: item.Username,
      turnover: parseFloat(item.Turnover),
      netwin: parseFloat(item.NetWin),
      deposit: 0,
      withdraw: 0,
      promotion: 0,
      loyaltyPoint: 0
    };
    data.push(obj);
  });

  _.each(depositData, function(item){
    let obj = _.find(data, function(i){ return (i.name === item.Username) ? true : false });
    if(obj){
      obj.deposit = parseFloat(item.Amount);
    }else{
      obj = {
        name: item.Username,
        turnover: 0,
        netwin: 0,
        deposit: parseFloat(item.Amount),
        withdraw: 0,
        promotion: 0,
        loyaltyPoint: 0
      };
      data.push(obj);
    }
  });

  _.each(withdrawData, function(item){
    let obj = _.find(data, function(i){ return (i.name === item.Username) ? true : false });
    if(obj){
      obj.withdraw = parseFloat(item.Amount);
    }else{
      obj = {
        name: item.Username,
        turnover: 0,
        netwin: 0,
        deposit: 0,
        withdraw: parseFloat(item.Amount),
        promotion: 0,
        loyaltyPoint: 0
      };
      data.push(obj);
    }
  });

  _.each(promotionData, function(item){
    let obj = _.find(data, function(i){ return (i.name === item.Username) ? true : false });
    if(obj){
      obj.promotion = parseFloat(item.Amount);
      obj.loyaltyPoint = parseFloat(item.LoyaltyPoint);
    }else{
      obj = {
        name: item.Username,
        turnover: 0,
        netwin: 0,
        deposit: 0,
        withdraw: 0,
        promotion: parseFloat(item.Amount),
        loyaltyPoint: parseFloat(item.LoyaltyPoint)
      };
      data.push(obj);
    }
  });

  total.turnover = parseFloat(totalBetData.Turnover);
  total.netwin = parseFloat(totalBetData.NetWin);
  total.deposit = parseFloat(totalDepositData.Amount);
  total.withdraw = parseFloat(totalWithdrawData.Amount);
  total.promotion = parseFloat(totalPromotionData.Amount);
  total.loyaltyPoint = parseFloat(totalPromotionData.LoyaltyPoint);

  let totalCount = data.length;

  return { data: data.splice(index, 20), total: total, totalCount: totalCount };
};

module.exports = controller;
