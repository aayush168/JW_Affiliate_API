let path = require('path');
let _ = require('underscore');
let memberService = require(path.join(rootPath, 'service', 'member.js'));
let controller = {};

controller.getPlayers = async function(agentCode, start, end, username, name, status, index){
  let playersCount = await memberService.getPlayersCount(agentCode, start, end, username, name, status);
  let players = await memberService.getPlayers(agentCode, start, end, username, name, status, index);
  players = _.map(players, function(item){
    item.Username = item.Username.slice(0, 3).concat('*******');
    return item;
  });
  return { players: players, totalCount: parseFloat(playersCount.TotalCount) };
};

module.exports = controller;
