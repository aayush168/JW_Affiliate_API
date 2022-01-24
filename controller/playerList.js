let path = require('path');
let _ = require('underscore');
let memberService = require(path.join(rootPath, 'service', 'member.js'));
let controller = {};

controller.getPlayers = async function(agentCode, start, end, username, status, index){
  const playersCount = await memberService.getPlayersCount(agentCode, start, end, username, status);
  const players = await memberService.getPlayers(agentCode, start, end, username, status, index);
  return { players: players, totalCount: parseFloat(playersCount.TotalCount) };
};

module.exports = controller;
