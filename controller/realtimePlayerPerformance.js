let path = require('path');
let _ = require('underscore');
let realtimePlayerPerformanceService = require(path.join(rootPath, 'service', 'realtimePlayerPerformance.js'));
let controller = {};

controller.getRealtimePlayerPerformance = async function(agentCode, startDate, endDate, username, index){
  let data = [];
  let total = {
    turnover: 0,
    netwin: 0,
    deposit: 0,
    withdraw: 0,
    promotion: 0,
    loyaltyPoint: 0
  };
  let betData = await realtimePlayerPerformanceService.getBetData(`${agentCode}%`, `${startDate} 00:00:00`, `${endDate} 23:59:59`, username);
  let depositData = await realtimePlayerPerformanceService.getDepositData(`${agentCode}%`, `${startDate} 00:00:00`, `${endDate} 23:59:59`, username);
  let withdrawData = await realtimePlayerPerformanceService.getWithdrawData(`${agentCode}%`, `${startDate} 00:00:00`, `${endDate} 23:59:59`, username);
  let promotionData = await realtimePlayerPerformanceService.getPromotionData(`${agentCode}%`, `${startDate} 00:00:00`, `${endDate} 23:59:59`, username);
  let bonusData = await realtimePlayerPerformanceService.getBonusData(`${agentCode}%`, `${startDate} 00:00:00`, `${endDate} 23:59:59`, username);

  let totalBetData = await realtimePlayerPerformanceService.getTotalBetData(`${agentCode}%`, `${startDate} 00:00:00`, `${endDate} 23:59:59`, username);
  let totalDepositData = await realtimePlayerPerformanceService.getTotalDepositData(`${agentCode}%`, `${startDate} 00:00:00`, `${endDate} 23:59:59`, username);
  let totalWithdrawData = await realtimePlayerPerformanceService.getTotalWithdrawData(`${agentCode}%`, `${startDate} 00:00:00`, `${endDate} 23:59:59`, username);
  let totalPromotionData = await realtimePlayerPerformanceService.getTotalPromotionData(`${agentCode}%`, `${startDate} 00:00:00`, `${endDate} 23:59:59`, username);
  let totalBonusData = await realtimePlayerPerformanceService.getTotalBonusData(`${agentCode}%`, `${startDate} 00:00:00`, `${endDate} 23:59:59`, username);
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
        name: item.Username.slice(0, 3).concat('*******'),
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

  _.each(bonusData, function (item) {
    let obj = _.find(data, function (i) { return (i.name === item.Username) ? true : false });
    if (obj) {
      obj.promotion = parseFloat(obj.promotion) + parseFloat(item.Amount);
    } else {
      obj = {
        name: item.Username,
        turnover: 0,
        netwin: 0,
        deposit: 0,
        withdraw: 0,
        promotion: parseFloat(item.Amount),
        loyaltyPoint: 0
      }
      data.push(obj);
    }
  });
  
  total.turnover = parseFloat(totalBetData.Turnover);
  total.netwin = parseFloat(totalBetData.NetWin);
  total.deposit = parseFloat(totalDepositData.Amount);
  total.withdraw = parseFloat(totalWithdrawData.Amount);
  total.promotion = parseFloat(totalPromotionData.Amount) + parseFloat(totalBonusData);
  total.loyaltyPoint = parseFloat(totalPromotionData.LoyaltyPoint);
  let totalCount = data.length;
  if (data.length > 0) {
    data = data.map(x => {
      if (x.name) {
       x.name =  x.name.slice(0, 3).concat('*******')
      }
      return x
    })
  }
  return { data: data.splice(index, 20), total: total, totalCount: totalCount };
};

module.exports = controller;
