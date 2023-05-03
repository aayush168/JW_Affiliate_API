let path = require('path');
let _ = require('underscore');
let playerPerformanceService = require(path.join(rootPath, 'service', 'playerPerformance.js'));
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
  const [betData, accData, totalBetData, totalAccData, firstDepositData] = await Promise.all([
    playerPerformanceService.getBetData(`${agentCode}%`, `${startDate} 00:00:00`, `${endDate} 23:59:59`, username),
    playerPerformanceService.getAccData(`${agentCode}%`, `${startDate} 00:00:00`, `${endDate} 23:59:59`, username),
    playerPerformanceService.getTotalBetData(`${agentCode}%`, `${startDate} 00:00:00`, `${endDate} 23:59:59`, username),
    playerPerformanceService.getTotalAccData(`${agentCode}%`, `${startDate} 00:00:00`, `${endDate} 23:59:59`, username),
    playerPerformanceService.getFirstDepositData(`${agentCode}`, `${startDate} 00:00:00`, `${endDate} 23:59:59`)
  ])
  if (mode && !mode.includes('ape')) {
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
  if (mode && !mode.includes('ape')) {
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
  if (mode && !mode.includes('ape')) {
    total.promotion = parseFloat(totalAccData.Promotion) + parseFloat(totalBonusData);
  } else {
    total.promotion = parseFloat(totalAccData.Promotion);
  }
  total.earning = calculateEstimateEarning(parseFloat(data.length), parseFloat(total.netwin), parseFloat(total.promotion))
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

function calculateEstimateEarning(members, netwin, promotion) {
  if (netwin + promotion > 0) {
    // company winning so no calculation
    return 0
  }
  let revenue = Math.abs(netwin);
  if (mode && mode.includes('bvprod') || mode.includes('ape') || mode.includes('12betkh')) {
    revenue = revenue * .95;
  }
  let operationCost = parseFloat(revenue) < 0 ? 0 : config.commission.operationCost;
  revenue = parseFloat(revenue) - parseFloat(promotion) - (parseFloat(revenue) * operationCost);
  let earning = 0
  let commission = config.commission.level;
  if (commission.length === 1) {
    earning = revenue * commission[0]['rate'];
    return earning;
  }

  if (commission.length === 4) {
    if (members >= commission[3]['members'] && revenue >= commission[3]['minRevenue']) {
      earning = revenue * commission[3]['rate'];
    } else if (members >= commission[2]['members'] && revenue >= commission[2]['minRevenue']) {
      earning = revenue * commission[2]['rate'];
    } else if (members >= commission[1]['members'] && revenue >= commission[1]['minRevenue']) {
      earning = revenue * commission[1]['rate'];
    } else if (members >= commission[0]['members'] && revenue >= commission[0]['minRevenue']) {
      earning = revenue * commission[0]['rate'];
    }
    return earning;
  }

  if (commission.length === 3) {
    if (members >= commission[2]['members'] && revenue >= commission[2]['minRevenue']) {
      earning = revenue * commission[2]['rate'];
    } else if (members >= commission[1]['members'] && revenue >= commission[1]['minRevenue']) {
      earning = revenue * commission[1]['rate'];
    } else if (members >= commission[0]['members'] && revenue >= commission[0]['minRevenue']) {
      earning = revenue * commission[0]['rate'];
    }
    return earning;
  }

  if (commission.length === 2) {
    if (members >= commission[1]['members'] && revenue >= commission[1]['minRevenue']) {
      earning = revenue * commission[1]['rate'];
    } else if (members >= commission[0]['members'] && revenue >= commission[0]['minRevenue']) {
      earning = revenue * commission[0]['rate'];
    }
    return earning;
  }
}

module.exports = controller;
