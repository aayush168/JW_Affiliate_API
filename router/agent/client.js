const path = require('path');
const express = require('express')
const router = express.Router();
const logger = require(path.join(rootPath, 'logger', 'index.js'));
const	log = logger.getLogger('agent');
const agentService = require(path.join(rootPath, 'service', 'agent', 'client.js'));
let { agent, validate } = require(path.join(rootPath, 'validator', 'index.js'))
const settingService = require(path.join(rootPath, 'service', 'setting', 'admin.js'));
const controller = require(path.join(rootPath, 'controller', 'index.js'));
const config = require('../../config/index.js');

router.post('/auth/register', agent.agentRegistrationRules(), validate, async function (req, res) {
  try {
    const paymentType = req.body.paymentType;
    const playerSourceType = req.body.playerSourceType;
    const paymentTypeListResult = await settingService.checkPaymentTypeById(paymentType)
    const playerSourceTypeListResult = await settingService.getSourceTypeList()
    if (paymentTypeListResult.code !== 'common.success') {
      return res.status(400).send(paymentTypeListResult)
    }
    if (playerSourceTypeListResult.list.length === 0) {
      return res.status(422).send({ code: 'code.playerSourceType.unknown', msg: 'Invalid Player Source type.' })
    }
    const allowedPlayerSourceType = playerSourceTypeListResult.list.map(x => x.Id);
    for (let i = 0; i < playerSourceType.length; i++) {
      const sourceType = playerSourceType[i];
      if (!allowedPlayerSourceType.includes(sourceType)) {
        return res.status(400).send({ code: 'params.playerSourceType.invalid', msg: 'Invalid Player Source type.' })
      }
    }
    const payment = paymentTypeListResult.list[0].Code;
    if (payment === 'player-account') {
      const result = await agentService.checkAgentPlayerAccountUsername(req.body.playerAccountUsername);
      if (result.code !== 'common.success') {
        return res.status(400).send(result)
      }
    }
    if (payment.includes('bank-account')) {
      const result = await agentService.checkAgentBankAccountNumber(req.body.accountNumber);
      if (result.code !== 'common.success') {
        return res.status(400).send(result)
      }
    }
    if (payment === 'skrill') {
      const result = await agentService.checkAgentSkrillAdress(req.body.skrillAddress);
      if (result.code !== 'common.success') {
        return res.status(400).send(result)
      }
    }
    if (payment === 'usdt') {
      const result = await agentService.checkAgentUsdtAddress(req.body.usdtWallet);
      if (result.code !== 'common.success') {
        return res.status(400).send(result)
      }
    }
    if (payment === 'bkash') {
      const result = await agentService.checkAgentBkashAddress(req.body.bkashWallet);
      if (result.code !== 'common.success') {
        return res.status(400).send(result)
      }
    }
    if (payment === 'nagad') {
      const result = await agentService.checkAgentNagadAddress(req.body.nagadWallet);
      if (result.code !== 'common.success') {
        return res.status(400).send(result)
      }
    }
    if (payment === 'rocket') {
      const result = await agentService.checkAgentRocketAddress(req.body.rocketWallet);
      if (result.code !== 'common.success') {
        return res.status(400).send(result)
      }
    }
    let ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    ipAddress = ipAddress.split(':').reverse()[0];
    const registerAgentPayload = {
      name: req.body.name,
      username: req.body.username,
      password: req.body.password,
      mobile: req.body.mobile || null,
      whatsapp: req.body.whatsapp || null,
      skype: req.body.skype || null,
      email: req.body.email || null,
      revenueShareType: req.body.revenueShareType,
      playerSourceType: playerSourceType.toString(),
      otherSourceLink: req.body.otherSourceLink ? req.body.otherSourceLink : null,
      ipAddress: ipAddress,
      telegram: req.body.telegram ? req.body.telegram : null,
    }
    const result = await agentService.addAgent(registerAgentPayload);
    if (result.code !== 'common.success') {
      return res.status(400).send(result)
    }
    const agentId = result.agentId
    const mode = process.env.mode
    let resultPayment;

    if (payment === 'player-account') {
      resultPayment = await addPlayerAccount(req, agentId, paymentType);
    } else if (payment === 'bank-account') {
      resultPayment = await addBankAccount(req, agentId, paymentType);
    } else if (payment === 'skrill') {
      resultPayment = await addSkrillAccount(req, agentId, paymentType);
    } else if (payment === 'usdt') {
      resultPayment = await addUsdtAccount(req, agentId, paymentType);
    } else if (payment === 'bkash') {
      resultPayment = await addBkashWallet(req, agentId, paymentType);
    } else if (payment === 'nagad') {
      resultPayment = await addNagadWallet(req, agentId, paymentType);
    } else if (payment === 'rocket') {
      resultPayment = await addRocketWallet(req, agentId, paymentType);
    } else if (payment === 'bdt-bank-account') {
      resultPayment = await addBdtBankAccount(req, agentId, paymentType);
    } else if (payment === 'bv-bank-account') {
      resultPayment = await addBvBankAccount(req, agentId, paymentType);
    } else if (payment === '12bet-bank-account') {
      resultPayment = await add12BetBankAccount(req, agentId, paymentType);
    } else {
      res.status(400).send({ msg: 'Feature not available' })
    }
    if (resultPayment.code !== 'common.success') {
      return res.status(400).send(result)
    }
    res.json(result)
  } catch (err) {
    log.error(err)
    res.status(500).send(err);
  }
})

router.post('/auth/login', async function (req, res) {
  try {
    const username = req.body.username
    const password = req.body.password
    if (!username) {
      return res.status(400).json({ code: 'params.username.required', msg: 'Username is required.' })
    }
    if (!password) {
      return res.status(400).json({ code: 'params.password.required', msg: 'Password is required.' })
    }
    let result = await agentService.login(username, password)
    if (!result.user) {
      return res.status(401).send(result)
    }
    req.session.client = result.user;
    res.json({ user: result.user })
  } catch (err) {
    log.error(err)
    res.status(500).send(err)
  }
})

router.post('/profile/update', async function (req, res) {
  try {
    const id = req.body.id
    if (!id) {
      return res.status(400).json({ code: 'params.agentId.required', msg: 'Agent Id is required.' })
    }
    const email = req.body.email
    const phone = req.body.phone
    const whatsapp = req.body.whatsapp || ''
    const skype = req.body.skype || ''
    if (!email) {
      return res.status(400).json({ code: 'params.email.required', msg: 'Email is required.' })
    }
    if (!phone) {
      return res.status(400).json({ code: 'params.phone.required', msg: 'Phone is required.' })
    }
    let result = await agentService.updateProfile(id, email, phone, whatsapp, skype)
    if (result.code !== 'common.success') {
      return res.status(400).send(result)
    }
    res.json(result)
  } catch (err) {
    log.error(err)
    res.status(500).send(err)
  }
})

router.post('/password/reset', async function (req, res) {
  try {
    const id = req.body.id
    if (!id) {
      return res.status(400).json({ code: 'params.agentId.required', msg: 'Agent Id is required.' })
    }
    const oldPassword = req.body.oldPassword
    const newPassword = req.body.newPassword
    if (!oldPassword) {
      return res.status(400).json({ code: 'params.oldPassword.required', msg: 'Previous Password is required' })
    }
    if (!newPassword) {
      return res.status(400).json({ code: 'params.newPassword.required', msg: 'New Password is required' })
    }
    let result = await agentService.resetPassword(id, oldPassword, newPassword)
    if (result.code !== 'common.success') {
      return res.status(400).send(result)
    }
    res.json(result)
  } catch (err) {
    log.error(err)
    res.status(500).send(err)
  }
})

router.post('/checklogin', async function (req, res) {
  try {
    if (req.session.client) {
      return res.json({ user: req.session.client });
    }
    res.json({ user: null })
  } catch (err) {
    log.error(err);
    res.status(500).send(err)
  }
})

router.post('/logout', async function (req, res) {
  try {
    req.session.user = null;
    req.session.destroy();
    res.status(200).end();
    return;
  } catch (err) {
    log.error(err)
    res.status(500).send(err)
  }
})

router.post('/revenue/estimate/data', async function (req, res) {
  try {
    const agentCode = req.body.agentCode;
    const start = req.body.start;
    const end = req.body.end;
    if (!start) {
      return res.status(400).json({ code: 'params.start.required', msg: 'Start Date is required.' })
    }
    if (!end) {
      return res.status(400).json({ code: 'params.end.required', msg: 'End Date is required.' })
    }
    let result = await controller.revenue.getEstimateRevenue(agentCode, start, end)
    res.json(result)
  } catch (err) {
    log.error(err)
    res.status(500).send(err)
  }
});

router.get('/player/getList', async function (req, res) {
  try {
    const size = req.query.size ? parseInt(req.query.size) : 20;
    const page = req.query.page ? size * (parseInt(req.query.page) - 1) : 0;
    const agentCode = req.query.agentCode;
    const username = req.query.username
    const startDate = req.query.startDate
    const endDate = req.query.endDate
    const status = req.query.status === null || req.query.status === undefined || req.query.status === 'null' ? '' : parseInt(req.query.status)
    const result = await controller.playerlist.getPlayers(agentCode, startDate, endDate, username, status, page);
    res.json(result)
  } catch (err) {
    log.error(err)
    res.status(500).send(err);
  }
})

router.get('/player/realtime/data', async function (req, res) {
  try {
    const size = req.query.size ? parseInt(req.query.size) : 20;
    const page = req.query.page ? size * (parseInt(req.query.page) - 1) : 0;
    const agentCode = req.query.agentCode;
    const username = req.query.username
    const startDate = req.query.startDate
    const endDate = req.query.endDate
    const result = await controller.realtimePlayerPerformance.getRealtimePlayerPerformance(agentCode, startDate, endDate, username, page);
    res.json(result)
  } catch (err) {
    log.error(err)
    res.status(500).send(err);
  }
});

router.get('/player/performance/data', async function (req, res) {
  try {
    const size = req.query.size ? parseInt(req.query.size) : 20;
    const page = req.query.page ? size * (parseInt(req.query.page) - 1) : 0;
    const agentCode = req.query.agentCode;
    const username = req.query.username
    const startDate = req.query.startDate
    const endDate = req.query.endDate
    const result = await controller.playerPerformance.getPlayerPerformance(agentCode, startDate, endDate, username, page);
    res.json(result)
  } catch (err) {
    log.error(err)
    res.status(500).send(err);
  }
});


router.get('/setting/getList', async function (req, res) {
  try {
    const settingData = {
      setting: config.settings,
      commission: config.commission
    }
    res.json(settingData)
  } catch (err) {
    log.error(err)
    res.status(500).send(err);
  }
});

router.get('/domain/getList', async function (req, res) {
  try {
    const agentIdOCMS = parseInt(config.app.agentIdOCMS);
    const blockedDomain = config.app.blockedDomain
    const result = await agentService.getDomainList(agentIdOCMS, blockedDomain);
    result.list = result.list.filter(x => !blockedDomain.includes(x.Domain))
    res.json(result)
  } catch (err) {
    log.error(err)
    res.status(500).send(err);
  }
});

async function addBankAccount (req, agentId, paymentType) {
  try {
    const bankName = req.body.bankName;
    const accountName = req.body.accountName;
    const accountNumber = req.body.accountNumber;
    const bankAccountType = req.body.bankAccountType;
    const isfc = req.body.isfc;
    const branch = req.body.branch;
    if (!bankName) {
      return { code: 'params.bankName.required', msg: 'Bank Name is required.' }
    }
    if (!accountName) {
      return { code: 'params.accountName.required', msg: 'Account name is required.' }
    }
    if (!accountNumber) {
      return { code: 'params.accountNumber.required', msg: 'Account Number is required.' }
    }
    if (!bankAccountType) {
      return { code: 'params.bankAccountType.required', msg: 'Account Type is required.' }
    }
    if (!isfc) {
      return { code: 'params.isfc.required', msg: 'ISFC is required.' }
    }
    if (!branch) {
      return { code: 'params.branch.required', msg: 'Bank Branch is required.' }
    }
    let allowedBankAccountType = [1,2,3] // 1: Saving, 2: Current, 3: Corporate
    if (!allowedBankAccountType.includes(bankAccountType)) {
      return { code: 'params.bankAccountType.invalid', msg: 'Invalid Account Type' }
    }
    const payload = {
      agentId: agentId,
      paymentType: paymentType,
      bankName: bankName,
      accountName: accountName,
      accountNumber: accountNumber,
      bankAccountType: bankAccountType,
      isfc: isfc,
      branch: branch
    }
    const res = await agentService.addAgentBankInfo(payload);
    if (res.code !== 'common.success') {
      return { code: 'params.unknown.error', msg: 'Unknown Error' }
    }
    return res;
  } catch (err) {
    throw err
  }
}

async function addSkrillAccount (req, agentId, paymentType) {
  try {
    const skrillAddress = req.body.skrillAddress
    if (!skrillAddress) {
      return { code: 'params.skrillId.required', msg: 'Skrill Id is required.' }
    }
    const payload = {
      agentId: agentId,
      paymentType: paymentType,
      skrillAddress: skrillAddress
    }
    const res = await agentService.addAgentSkrillInfo(payload);
    if (res.code !== 'common.success') {
      return { code: 'params.unknown.error', msg: 'Unknown Error' }
    }
    return res;
  } catch (err) {
    throw err
  }
}

async function addUsdtAccount (req, agentId, paymentType) {
  try {
    const usdtWallet = req.body.usdtWallet
    if (!usdtWallet) {
      return { code: 'params.usdtWallet.required', msg: 'USDT Wallet Id is required.' }
    }
    const payload = {
      agentId: agentId,
      paymentType: paymentType,
      usdtWallet: usdtWallet
    }
    const res = await agentService.addAgentUsdtWalletInfo(payload);
    if (res.code !== 'common.success') {
      return { code: 'params.unknown.error', msg: 'Unknown Error' }
    }
    return res;
  } catch (err) {
    throw err
  }
}

async function addPlayerAccount (req, agentId, paymentType) {
  try {
    const playerAccountUsername = req.body.playerAccountUsername
    if (!playerAccountUsername) {
      return { code: 'params.playerAccount.required', msg: 'Player Account Username is required.' }
    }
    const payload = {
      agentId: agentId,
      paymentType: paymentType,
      playerAccountUsername: playerAccountUsername
    }
    const res = await agentService.addAgentPlayerInfo(payload);
    if (res.code !== 'common.success') {
      return { code: 'params.unknown.error', msg: 'Unknown Error' }
    }
    return res;
  } catch (err) {
    throw err
  }
}



async function addBdtBankAccount (req, agentId, paymentType) {
  try {
    const bankName = req.body.bankName;
      const accountName = req.body.accountName;
      const accountNumber = req.body.accountNumber;
      const bankAccountType = req.body.bankAccountType;
      const branch = req.body.branch;
      if (!bankName) {
        return { code: 'params.bankName.required', msg: 'Bank Name is required.' }
      }
      if (!accountName) {
        return { code: 'params.accountName.required', msg: 'Account name is required.' }
      }
      if (!accountNumber) {
        return { code: 'params.accountNumber.required', msg: 'Account Number is required.' }
      }
      if (!bankAccountType) {
        return { code: 'params.bankAccountType.required', msg: 'Account Type is required.' }
      }
      if (!branch) {
        return { code: 'params.branch.required', msg: 'Bank Branch is required.' }
      }
      let allowedBankAccountType = [1,2,3] // 1: Saving, 2: Current, 3: Corporate
      if (!allowedBankAccountType.includes(bankAccountType)) {
        return { code: 'params.bankAccountType.invalid', msg: 'Invalid Account Type' }
      }
      const payload = {
        agentId: agentId,
        paymentType: paymentType,
        bankName: bankName,
        accountName: accountName,
        accountNumber: accountNumber,
        bankAccountType: bankAccountType,
        branch: branch
      }
      const res = await agentService.addAgentBdtBankInfo(payload);
    if (res.code !== 'common.success') {
      return { code: 'params.unknown.error', msg: 'Unknown Error' }
    }
    return res;
  } catch (err) {
    throw err
  }
}

async function addBkashWallet (req, agentId, paymentType) {
  try {
    const bkashWallet = req.body.bkashWallet
    if (!bkashWallet) {
      return { code: 'params.bkashWallet.required', msg: 'Wallet Address is required.' }
    }
    const payload = {
      agentId: agentId,
      paymentType: paymentType,
      bkashWallet: bkashWallet
    }
    const res = await agentService.addAgentBkashInfo(payload);
    if (res.code !== 'common.success') {
      return { code: 'params.unknown.error', msg: 'Unknown Error' }
    }
    return res;
  } catch (err) {
    throw err
  }
}

async function addNagadWallet (req, agentId, paymentType) {
  try {
    const nagadWallet = req.body.nagadWallet
    if (!nagadWallet) {
      return { code: 'params.nagadWallet.required', msg: 'Wallet Address is required.' }
    }
    const payload = {
      agentId: agentId,
      paymentType: paymentType,
      nagadWallet: nagadWallet
    }
    const res = await agentService.addAgentNagadtInfo(payload);
    if (res.code !== 'common.success') {
      return { code: 'params.unknown.error', msg: 'Unknown Error' }
    }
    return res;
  } catch (err) {
    throw err
  }
}

async function addRocketWallet (req, agentId, paymentType) {
  try {
    const rocketWallet = req.body.rocketWallet
      if (!rocketWallet) {
        return { code: 'params.rocketWallet.required', msg: 'Wallet Address is required.' }
      }
      const payload = {
        agentId: agentId,
        paymentType: paymentType,
        rocketWallet: rocketWallet
      }
    const res = await agentService.addAgentRocketInfo(payload);
    if (res.code !== 'common.success') {
      return { code: 'params.unknown.error', msg: 'Unknown Error' }
    }
    return res;
  } catch (err) {
    throw err
  }
}

async function addBvBankAccount(req, agentId, paymentType) {
  try {
    const bankName = req.body.bankName;
    const accountName = req.body.accountName;
    const accountNumber = req.body.accountNumber;
    const branch = req.body.branch;
    if (!bankName) {
      return { code: 'params.bankName.required', msg: 'Bank Name is required.' }
    }
    if (!accountName) {
      return { code: 'params.accountName.required', msg: 'Account name is required.' }
    }
    if (!accountNumber) {
      return { code: 'params.accountNumber.required', msg: 'Account Number is required.' }
    }
    if (!branch) {
      return { code: 'params.branch.required', msg: 'Bank Branch is required.' }
    }
    const payload = {
      agentId: agentId,
      paymentType: paymentType,
      bankName: bankName,
      accountName: accountName,
      accountNumber: accountNumber,
      branch: branch
    }
    const res = await agentService.addAgentBvBankInfo(payload);
    if (res.code !== 'common.success') {
      return { code: 'params.unknown.error', msg: 'Unknown Error' }
    }
    return res;
  } catch (err) {
    throw err
  }
}

async function add12BetBankAccount(req, agentId, paymentType) {
  try {
    const bankName = req.body.bankName;
    const accountName = req.body.accountName;
    const accountNumber = req.body.accountNumber;
    if (!bankName) {
      return { code: 'params.bankName.required', msg: 'Bank Name is required.' }
    }
    if (!accountName) {
      return { code: 'params.accountName.required', msg: 'Account name is required.' }
    }
    if (!accountNumber) {
      return { code: 'params.accountNumber.required', msg: 'Account Number is required.' }
    }
    const payload = {
      agentId: agentId,
      paymentType: paymentType,
      bankName: bankName,
      accountName: accountName,
      accountNumber: accountNumber,
    }
    const res = await agentService.addAgent12BetBankInfo(payload);
    if (res.code !== 'common.success') {
      return { code: 'params.unknown.error', msg: 'Unknown Error' }
    }
    return res;
  } catch (err) {
    throw err
  }
}

module.exports = router;
