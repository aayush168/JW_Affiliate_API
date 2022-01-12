let service = {}
const path = require('path');
const db = require(path.join(rootPath, 'db', 'index.js'));
const config = require(path.join(rootPath, 'config', 'index.js'));
const encrypt = require(path.join(rootPath, 'utils', 'encrypt.js'));
const _ = require('underscore');
const memoize = require('memoizee');
const _CACHE_MAX_AGE = 60000;
const revenueService = require(path.join(rootPath, 'service', 'revenue.js'));
const memberService = require(path.join(rootPath, 'service', 'member.js'));
const mEnableMembers = memoize(memberService.getPlayersCount, { primitive: true, maxAge: _CACHE_MAX_AGE, promise: true });
const mCurrentBetData = memoize(revenueService.getCurrentBetData, { primitive: true, maxAge: _CACHE_MAX_AGE, promise: true });
const mCarriedRevenue = memoize(revenueService.getCarriedRevenue, { primitive: true, maxAge: _CACHE_MAX_AGE, promise: true });
const mCurrentPromotion = memoize(revenueService.getCurrentPromotion, { primitive: true, maxAge: _CACHE_MAX_AGE, promise: true });
const mBonusAmount = memoize(revenueService.getBonusAmount, { primitive: true, maxAge: _CACHE_MAX_AGE, promise: true });

service.addAgent = async ({ name, username, password, mobile, whatsapp, skype, email, revenueShareType, playerSourceType, otherSourceLink }) => {
  try {
    const conn = await db.getConn('extra:read')
    const conn1 = await db.getConn('extra:write')
    const conn2 = await db.getConn('jw')
    const agent = (await conn.query(db.sql('agent/getAgentByUsername.sql'), [ username ]))[0]
    if (agent.length > 0) {
      return { code: 'code.username.exist', msg: 'Username is already taken' }
    }
    const agentOCMS = (await conn2.query(db.sql('agent/ocms/getAgentByUsername.sql'), [ username ]))[0]
    if (agentOCMS.length > 0) {
      return { code: 'code.username.exist', msg: 'Username is already taken' }
    }
    const salt1 = encrypt.getSalt(10)
    const salt2 = encrypt.getSalt(12)
    const encryptPassword = encrypt.encryptPassword(password, salt1, salt2);
    const result = await conn1.execute(db.sql('agent/addAgent.sql'), [ name, username, password, encryptPassword, salt1, salt2, mobile, whatsapp, skype, email, revenueShareType, playerSourceType, otherSourceLink ])
    const agentId = result[0].insertId
    return { code: 'common.success', agentId: agentId }
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
}

service.addAgentBankInfo = async ({ agentId, paymentType, bankName, accountName, accountNumber, accountType, isfc, branch }) => {
  try {
    let conn = await db.getConn('extra:write')
    await conn.execute(db.sql('agent/addBankInfo.sql'), [ agentId, paymentType, bankName, accountName, accountNumber, accountType, isfc, branch ])
    return { code: 'common.success' }
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
}


service.addAgentSkrillInfo = async ({ agentId, paymentType, skrillAddress }) => {
  try {
    let conn = await db.getConn('extra:write')
    await conn.execute(db.sql('agent/addSkrillAddress.sql'), [ agentId, paymentType, skrillAddress ])
    return { code: 'common.success' }
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
}

service.addAgentUsdtWalletInfo = async ({ agentId, paymentType, usdtWallet }) => {
  try {
    let conn = await db.getConn('extra:write')
    await conn.execute(db.sql('agent/addUsdtWallet.sql'), [ agentId, paymentType, usdtWallet ])
    return { code: 'common.success' }
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
}

service.checkAgentPlayerAccountUsername = async (playerAccountUsername) => {
  try {
    let jwconn = await db.getConn('jw');
    let conn = await db.getConn('extra:read');
    const result = (await jwconn.execute(db.sql('agent/ocms/getPlayerAccountByUsername.sql'), [ playerAccountUsername ]))[0]
    if (result.length === 0) {
      return { code: 'code.playerAccountUsername.invalid', msg: 'Invalid Player Account Username' }
    }
    const result1 = (await conn.execute(db.sql('agent/getPlayerAccountByUsername.sql'), [ playerAccountUsername ]))[0]
    if (result1.length > 0) {
      return { code: 'code.playerAccountUsername.exist', msg: 'Player Account already linked to other affiliate account' }
    }
    return { code: 'common.success' }
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
}

service.addAgentPlayerInfo = async ({ agentId, paymentType, playerAccountUsername }) => {
  try {
    let conn = await db.getConn('extra:write')
    await conn.execute(db.sql('agent/addPlayerAccount.sql'), [ agentId, paymentType, playerAccountUsername ])
    return { code: 'common.success' }
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
}

service.login = async (username, password) => {
  try {
    let conn = await db.getConn('jw')
    let result = (await conn.query(db.sql('agent/ocms/getAgentByUsername.sql'), [ username ]))[0];
    if (result.length === 0) {
      return { code: 'code.operator.noExist', user: null }
    }
    let user = result[0];
    if (user.Active !== 1) {
      return { code: 'code.account.disabled', user: null }
    }
    if (user.OperatorPW !== encrypt.encryptPassword(password, user.salt, user.salt2)) {
      return { code: 'code.auth.login.invalid', user: null }
    }
    return { code: 'common.success', user: { id: user.OperatorIdx, username: user.OperatorID, name: user.OperatorName, code: user.Code }}
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
}

service.getEstimateRevenue = async (agentCode, start, end) => {
  try {
    const currentPromotion = await mCurrentPromotion(`${agentCode}%`, `${start} 00:00:00`, `${end} 23:59:59`);
    const enableMembers = await mEnableMembers(`${agentCode}%`, '', '', '', '', 0);
    const currentBetData = await mCurrentBetData(`${agentCode}%`, `${start} 00:00:00`, `${end} 23:59:59`);
    const carriedRevenue = await mCarriedRevenue(`${agentCode}%`, `${start} 00:00:00`);
    const bonusAmount = await mBonusAmount(`${agentCode}%`, `${start} 00:00:00`, `${end} 23:59:59`);
    const promotionAmount = parseFloat(currentPromotion.Amount) + parseFloat(bonusAmount);
    const cRevenue = (carriedRevenue.Revenue >= 0) ? 0 : parseFloat(carriedRevenue.Revenue);
    const earning = calculateEarning(parseFloat(enableMembers.TotalCount), parseFloat(currentBetData.Revenue), cRevenue, parseFloat(promotionAmount));
    return { code: 'common.success', data: { members: parseFloat(enableMembers.TotalCount), turnover: parseFloat(currentBetData.Turnover), revenue: parseFloat(currentBetData.Revenue), carried: cRevenue, promotion: parseFloat(promotionAmount), earning: earning }};
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
}

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
    return earning;
  }
}

module.exports = service; 