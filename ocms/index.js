let AUTHORIZATION_TOKEN = null;
let REFRESH_TOKEN = null;
let BOT_ACCOUNT = 'createAgent';
let path = require('path');
let memoize = require('memoizee');
let config = require(path.join(rootPath, 'config', 'index.js'));
let rp = require('request-promise');
let AsyncLock = require('async-lock');
let lock = new AsyncLock();
let service = {};
let account = config.ocms.accounts[BOT_ACCOUNT];

let _CACHE_MAX_AGE = 300000;

let system = require(path.join(rootPath, 'system', 'index.js'));

let mAuthToken = memoize(system.getAuthToken, { primitive: true, maxAge: _CACHE_MAX_AGE, promise: true });

service.getTurnoverData = async function (startDate, endDate, recall = false) {
  let options = {
    method: 'GET',
    url: `${config.app["DOMAIN"]["DATA_API"]}${config.app["API_URL"]["WIN"]}`,
    qs: {
      startDate: startDate,
      endDate: endDate
    },
    headers: {
      authorization: await mAuthToken(),
      "ocms-currency": config.app.currency || ''
    },
    json: true,
    simple: false,
    resolveWithFullResponse: true
  };

  let response = await rp(options);
  if (response.body.code !== 'common.success') {
    console.log(`API DATA: Unknown error (code: ${JSON.stringify(response.body)})`);
    return;
  }
  return (recall) ? response : response.body.data.result;
}


service.init = async function () {
  let tokens = await lock.acquire('getTokens', getTokens);
  return
}

async function getTokens () {
  if (AUTHORIZATION_TOKEN && REFRESH_TOKEN) {
    let checkRes = await checkToken(AUTHORIZATION_TOKEN, REFRESH_TOKEN);
    if (checkRes.statusCode === 304) {
      return {
        AUTHORIZATION_TOKEN: AUTHORIZATION_TOKEN,
        REFRESH_TOKEN: REFRESH_TOKEN
      };
    }
    if (checkRes.statusCode === 200 && checkRes.body.code === 'common.success') {
      AUTHORIZATION_TOKEN = (checkRes.headers['authorization'] && (checkRes.headers['authorization'] !== AUTHORIZATION_TOKEN)) ? checkRes.headers['authorization'] : AUTHORIZATION_TOKEN;
      REFRESH_TOKEN = (checkRes.headers['refreshtoken'] && (checkRes.headers['refreshtoken'] !== REFRESH_TOKEN)) ? checkRes.headers['refreshtoken'] : REFRESH_TOKEN;
      return {
        AUTHORIZATION_TOKEN: AUTHORIZATION_TOKEN,
        REFRESH_TOKEN: REFRESH_TOKEN
      }
    }
    if (checkRes.statusCode !== 401) {
      throw `Error: ${JSON.stringify(checkRes.body)} error when invoke OCMS Back Office API.`;
      return;
    }
  }
  let loginRes = await login();
  AUTHORIZATION_TOKEN = loginRes.data.token;
  REFRESH_TOKEN = loginRes.data.refreshToken;
  return {
    AUTHORIZATION_TOKEN: AUTHORIZATION_TOKEN,
    REFRESH_TOKEN: REFRESH_TOKEN
  }
}

async function login () {
  let options = {
    method: 'POST',
    url: `https://${config.ocms.domain}${config.ocms.path.login}`,
    body: {
      username: account.username,
      password: account.password
    },
    headers: {
      "ocms-currency": config.app.currency
    },
    json: true
  };
  let response = await rp(options);
  if (response.code !== 'common.success') {
    throw `Bot ${account.username} login failed.`;
    return;
  }
  return response;
}

async function checkToken (authorization, refreshToken) {
  let options = {
    method: 'POST',
    headers: {
      authorization: authorization,
      refreshtoken: refreshToken,
      "ocms-currency": config.app.currency
    },
    url: `https://${config.ocms.domain}${config.ocms.path.checkTokens}`,
    body: {},
    json: true,
    resolveWithFullResponse: true,
    simple: false
  }
  let response = await rp(options);
  return response;
}

service.createAgent = async function (agentUsername) {
  await lock.acquire('getTokens', async function () {
    let tokens = await getTokens();
    let options = {
      method: 'POST',
      url: `https://${config.ocms.domain}${config.ocms.path.createAgent}`,
      headers: {
        authorization: tokens.AUTHORIZATION_TOKEN,
        refreshtoken: tokens.REFRESH_TOKEN,
        "ocms-currency": config.app.currency || ''
      },
      body: {
        agentId: null,
        agentUsername: agentUsername,
        billingCycle: "month",   // month and isoWeek for weekly Option available
        effectiveMember: {BetAmount: 0, Deposit: 0},
        fee: {DepositFeeRate: 0, DiscountFeeRate: 0, PlatformFeeRate: 0, WithdrawFeeRate: 0},
        isIgnoringCalculateRefundNetwin: true,
        layerLimit: 5,
        memo: "Affiliate Id",
        name: `aff${agentUsername}`,
        negativeProfitRatio: 0,
        sensitiveField: [],
        state: null
      },
      json: true
    }
    let response = await rp(options);
    if (response.code !== 'common.success') {
      throw `Agent account could not be created`
    }
    let options1 = {
      method: 'PUT',
      url: `https://${config.ocms.domain}${config.ocms.path.createAgent}`,
      headers: {
        authorization: tokens.AUTHORIZATION_TOKEN,
        refreshtoken: tokens.REFRESH_TOKEN,
        "ocms-currency": config.app.currency || ''
      },
      body: {
        agentId: response.data.agentId,
        agentUsername: agentUsername,
        billingCycle: "month",   // month and isoWeek for weekly Option available
        effectiveMember: {BetAmount: 0, Deposit: 0},
        fee: {DepositFeeRate: 0, DiscountFeeRate: 0, PlatformFeeRate: 0, WithdrawFeeRate: 0},
        isIgnoringCalculateRefundNetwin: true,
        layerLimit: 5,
        memo: "Affiliate Id",
        name: `aff${agentUsername}`,
        negativeProfitRatio: 0,
        sensitiveField: [],
        state: 1
      },
      json: true
    }
    const res = await rp(options1);
    if (res.code !== 'common.success') {
      throw `Agent status could not be updated`
    }
    return
  })
}

module.exports = service;