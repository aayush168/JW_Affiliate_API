let service = {}
const path = require('path');
let db = require(path.join(rootPath, 'db', 'index.js'));
const encrypt = require(path.join(rootPath, 'utils', 'encrypt.js'));

service.raiseWithdrawRequest = async (agentId, playerAccount, amount, password) => {
  try {
    let conn = await db.getConn('extra:read')
    let agent = (await conn.query(db.sql('agent/getAgentById.sql'), [ agentId ]))[0];
    if (agent.length === 0) {
      return { code: "code.agent.noExist", msg: "Agent Not Found" }
    }
    if (password !== encrypt.encryptPassword(password, agent[0].Salt1, agent[0].Salt2)) {
      return { code: 'code.auth.invalid', msg: 'Invalid Credential' }
    }
    const agentBalance = (await conn.query(db.sql('money/getAgentBalanceById.sql'), [ agentId ]))[0];
    console.log(agent, 'agent data')
    return { code: "common.success" }
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
}

module.exports = service;