const path = require('path');
let playerlist = require(path.join(rootPath, 'controller', 'playerList.js'))
let playerPerformance = require(path.join(rootPath, 'controller', 'playerPerformance.js'))
let realtimePlayerPerformance = require(path.join(rootPath, 'controller', 'realtimePlayerPerformance.js'))
let revenue = require(path.join(rootPath, 'controller', 'revenue.js'))
let settlement = require(path.join(rootPath, 'controller', 'settlement.js'))

let controller = {
  playerlist: playerlist,
  playerPerformance: playerPerformance,
  realtimePlayerPerformance: realtimePlayerPerformance, 
  revenue: revenue,
  settlement: settlement
};

module.exports = controller;