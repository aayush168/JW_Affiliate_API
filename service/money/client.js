let service = {}
const path = require('path');
let db = require(path.join(rootPath, 'db', 'index.js'));
const encrypt = require(path.join(rootPath, 'utils', 'encrypt.js'));

service.addWithdrawRequest = async (agentId, playerAccount, amount, password) => {
  try {
    const conn = await db.getConn('extra:read');
    const conn1 = await db.getConn('extra:write');

    // Check for pending withdraw request
    const pendingRequest = await conn.query(db.sql('money/getWithdrawRequestByAgentId.sql'), [agentId]);
    if (pendingRequest[0].length > 0) {
      return { code: "code.withdraw.pending", msg: "You have a pending withdraw request" };
    }

    // Check if agent exists
    const agent = await conn.query(db.sql('agent/getAgentById.sql'), [agentId]);
    if (agent[0].length === 0) {
      return { code: "code.agent.noExist", msg: "Agent Not Found" };
    }

    // Check agent's password
    const { Password, Salt1, Salt2 } = agent[0][0];
    if (Password !== encrypt.encryptPassword(password, Salt1, Salt2)) {
      return { code: 'code.auth.invalid', msg: 'Invalid Credentials' };
    }

    // Check payment info balance
    const paymentInfo = await conn.query(db.sql('money/getPaymentInfoBalance.sql'), [agentId]);
    if (paymentInfo[0].length === 0) {
      return { code: "code.agent.paymentNoExist", msg: "Agent Balance is not enough" };
    }

    const { PlayerAccountUsername, Balance } = paymentInfo[0][0];

    // Check player account
    if (PlayerAccountUsername !== playerAccount) {
      return { code: "code.playerAccount.invalid", msg: "Invalid Player Account" };
    }

    // Check amount
    if (parseFloat(amount) > parseFloat(Balance)) {
      return { code: "code.amount.invalid", msg: "Invalid Amount. Please check your amount and try again" };
    }

    // Add withdraw request
    await conn1.query({ sql: db.sql('money/addWithdrawRequest.sql'), values: [agentId, PlayerAccountUsername, parseFloat(amount), parseFloat(Balance)] });

    return { code: "common.success" };
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
};

module.exports = service;