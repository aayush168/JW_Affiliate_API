let service = {};
let path = require('path');
let rp = require('request-promise');
let config = require(path.join(rootPath, 'config', 'index.js'));
let memoize = require('memoizee');
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

module.exports = service;