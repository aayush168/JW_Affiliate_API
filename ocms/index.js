let AUTHORIZATION_TOKEN = null;
let REFRESH_TOKEN = null;
let BOT_ACCOUNT = process.env.jobName;
let path = require('path');
let delay = require('delay');
let config = require(path.join(rootPath, 'config', 'index.js'));
let system = require(path.join(rootPath, 'system', 'index.js'));
let rp = require('request-promise');
let AsyncLock = require('async-lock');
let lock = new AsyncLock();
let db = require(path.join(rootPath, 'db', 'index.js'));
let service = {};
let account = config.ocms.accounts[BOT_ACCOUNT];

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
      "ocms-currency": config.setting.currency
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
      "ocms-currency": config.setting.currency
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

module.exports = service;