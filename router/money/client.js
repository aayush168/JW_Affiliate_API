const path = require('path');
const express = require('express')
const router = express.Router();
const logger = require(path.join(rootPath, 'logger', 'index.js'));
const	log = logger.getLogger('moneyClient');
const moneyService = require(path.join(rootPath, 'service', 'money', 'client.js'));
const auth = require(path.join(rootPath, 'middlewares', 'auth.js'));

router.post('/withdraw', async function (req, res) {
  try {
    const { playerAccount, amount, password } = req.body;
    const agentId = auth.getAgentId(req);

    if (!playerAccount) {
      return res.status(400).json({ code: 'params.playerAccount.required', msg: 'Player account is required' });
    }
    if (!amount) {
      return res.status(400).json({ code: 'params.amount.required', msg: 'Amount is required' });
    }
    if (!password) {
      return res.status(400).json({ code: 'params.password.required', msg: 'Password is required' });
    }

    const result = await moneyService.addWithdrawRequest(agentId, playerAccount, amount, password);
    if (result.code !== 'common.success') {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (err) {
    log.error(err);
    res.status(500).send(err);
  }
});

module.exports = router;