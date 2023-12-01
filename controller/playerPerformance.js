let path = require('path');
let _ = require('underscore');
let playerPerformanceService = require(path.join(rootPath, 'service', 'playerPerformance.js'));
let revenueService = require(path.join(rootPath, 'service', 'revenue.js'));
let config = require(path.join(rootPath, 'config', 'index.js'));
let controller = {};
const mode = process.env.mode

controller.getPlayerPerformance = async function(agentCode, startDate, endDate, username, index){
  let data = [];
  let total = {
    turnover: 0,
    netwin: 0,
    deposit: 0,
    withdraw: 0,
    promotion: 0,
    revenue: 0,
    firstDeposit: 0,
    firstDepositCount: 0
  };
  let bonusData;
  let totalBonusData;
  const [betData, accData, totalBetData, totalAccData, firstDepositData, carriedRevenue] = await Promise.all([
    playerPerformanceService.getBetData(`${agentCode}`, `${startDate} 00:00:00`, `${endDate} 23:59:59`, username),
    playerPerformanceService.getAccData(`${agentCode}`, `${startDate} 00:00:00`, `${endDate} 23:59:59`, username),
    playerPerformanceService.getTotalBetData(`${agentCode}`, `${startDate} 00:00:00`, `${endDate} 23:59:59`, username),
    playerPerformanceService.getTotalAccData(`${agentCode}`, `${startDate} 00:00:00`, `${endDate} 23:59:59`, username),
    playerPerformanceService.getFirstDepositData(`${agentCode}`, `${startDate} 00:00:00`, `${endDate} 23:59:59`),
    revenueService.getCarriedRevenue(`${agentCode}%`, `${startDate} 00:00:00`, username)
  ])
  let cRevenue = (carriedRevenue.Revenue >= 0) ? 0 : parseFloat(carriedRevenue.Revenue);
  if (mode && !mode.includes('ape') && !mode.includes('12betkh')) {
    const [bonusInfo, totalBonusInfo] = await Promise.all([
      playerPerformanceService.getBonusData(`${agentCode}%`, `${startDate} 00:00:00`, `${endDate} 23:59:59`, username),
      playerPerformanceService.getTotalBonusData(`${agentCode}%`, `${startDate} 00:00:00`, `${endDate} 23:59:59`, username),
    ])
    bonusData = bonusInfo
    totalBonusData = totalBonusInfo
  }
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
  if (mode && !mode.includes('ape') && !mode.includes('12betkh')) {
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
  } 
  total.turnover = parseFloat(totalBetData.Turnover);
  total.netwin = parseFloat(totalBetData.NetWin);
  total.deposit = parseFloat(totalAccData.Deposit);
  total.withdraw = parseFloat(totalAccData.Withdraw);
  total.firstDeposit = parseFloat(firstDepositData.Deposit)
  total.firstDepositCount = parseInt(firstDepositData.Count)
  if (mode && !mode.includes('ape') && !mode.includes('12betkh')) {
    total.promotion = parseFloat(totalAccData.Promotion) + parseFloat(totalBonusData);
  } else {
    total.promotion = parseFloat(totalAccData.Promotion);
  }
  total.earning = calculateEstimateEarning(parseFloat(data.length), parseFloat(total.netwin), cRevenue, parseFloat(total.promotion))
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

function calculateEarning (revenue, members, commission) {
  let earning = 0;
  for (let i = commission.length - 1; i >= 0; i--) {
    const c = commission[i];
    if (commission.length === 1) {
      earning = revenue * c['rate'];
      return earning
    } else if (members > c['members'] && revenue >= c['minRevenue']) {
      earning = revenue * c['rate'];
      return earning;
    }
  }
  return earning;
}

function calculateEstimateEarning(members, netwin, carried, promotion) {
  if (netwin + promotion > 0) {
    // company winning so no calculation
    return 0
  }
  let revenue = Math.abs(netwin);
  let operationCost = parseFloat(revenue) < 0 ? 0 : config.commission.operationCost;
  console.log('Total Members', members);
  console.log('Total NetWin', netwin);
  console.log('Promotion Amount', promotion);
  console.log('Carried Negative', carried * -1);
  console.log('Operator Cost', operationCost);
  revenue = parseFloat(revenue) - parseFloat(promotion) - parseFloat(carried * -1) - (parseFloat(revenue) * operationCost);
  let commission = config.commission.level;
  const earning = calculateEarning(revenue, members, commission);

  return earning;
}

module.exports = controller;
