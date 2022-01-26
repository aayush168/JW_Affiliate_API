let path = require('path');
let _ = require('underscore');
let playerPerformanceService = require(path.join(rootPath, 'service', 'playerPerformance.js'));
let controller = {};

controller.getPlayerPerformance = async function(agentCode, startDate, endDate, username, index){
  let data = [];
  let total = {
    turnover: 0,
    netwin: 0,
    deposit: 0,
    withdraw: 0,
    promotion: 0
  };
  let betData = await playerPerformanceService.getBetData(`${agentCode}%`, `${startDate} 00:00:00`, `${endDate} 23:59:59`, username);
  let accData = await playerPerformanceService.getAccData(`${agentCode}%`, `${startDate} 00:00:00`, `${endDate} 23:59:59`, username);
  let bonusData = await playerPerformanceService.getBonusData(`${agentCode}%`, `${startDate} 00:00:00`, `${endDate} 23:59:59`, username);

  let totalBetData = await playerPerformanceService.getTotalBetData(`${agentCode}%`, `${startDate} 00:00:00`, `${endDate} 23:59:59`, username);
  let totalAccData = await playerPerformanceService.getTotalAccData(`${agentCode}%`, `${startDate} 00:00:00`, `${endDate} 23:59:59`, username);
  let totalBonusData = await playerPerformanceService.getTotalBonusData(`${agentCode}%`, `${startDate} 00:00:00`, `${endDate} 23:59:59`, username);

  _.each(betData, function(item){
    let obj = {
      name: item.Username,
      turnover: parseFloat(item.Turnover),
      netwin: parseFloat(item.NetWin),
      deposit: 0,
      withdraw: 0,
      promotion: 0
    };
    data.push(obj);
  });

  _.each(accData, function(item){
    let obj = _.find(data, function(i){ return (i.name === item.Username) ? true : false });
    if(obj){
      obj.deposit = parseFloat(item.Deposit);
      obj.withdraw = parseFloat(item.Withdraw);
      obj.promotion = parseFloat(item.Promotion);
    }else{
      obj = {
        name: item.Username,
        turnover: 0,
        netwin: 0,
        deposit: parseFloat(item.Deposit),
        withdraw: parseFloat(item.Withdraw),
        promotion: parseFloat(item.Promotion)
      };
      data.push(obj);
    }
  });

  _.each(bonusData, function (item) {
    let obj = _.find(data, function (i) { return (i.name === item.Username) ? true : false });
    if (obj) {
      obj.deposit = parseFloat(obj.deposit);
      obj.withdraw = parseFloat(obj.withdraw);
      obj.promotion = parseFloat(obj.promotion) + parseFloat(item.Amount);
    } else {
      obj = {
        name: item.Username,
        turnover: 0,
        netwin: 0,
        deposit: 0,
        withdraw: 0,
        promotion: parseFloat(item.Amount)
      };
      data.push(obj);
    }
  })

  total.turnover = parseFloat(totalBetData.Turnover);
  total.netwin = parseFloat(totalBetData.NetWin);
  total.deposit = parseFloat(totalAccData.Deposit);
  total.withdraw = parseFloat(totalAccData.Withdraw);
  total.promotion = parseFloat(totalAccData.Promotion) + parseFloat(totalBonusData);
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
