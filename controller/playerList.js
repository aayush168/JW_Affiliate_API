let path = require('path');
let _ = require('underscore');
let memberService = require(path.join(rootPath, 'service', 'member.js'));
let controller = {};

controller.getPlayers = async function(agentCode, start, end, username, status, index){
  let startDate = start !== '' ?  `${start} 00:00:00` : '';
  let endDate = end !== '' ?  `${end} 23:59:59` : '';
  const playersCount = await memberService.getPlayersCount(agentCode, startDate, endDate, username, status);
  let players = await memberService.getPlayers(agentCode, startDate, endDate, username, status, index);
  players = _.map(players, function(item){
    item.Username = item.Username.slice(0, 3).concat('*******');
    return item;
  });
  return { players: players, totalCount: parseFloat(playersCount.TotalCount) };
};

module.exports = controller;