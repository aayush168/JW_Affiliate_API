let service = {};
let path = require('path');
let rp = require('request-promise');
let config = require(path.join(rootPath, 'config', 'index.js'));

service.getTurnoverData = async function (startDate, endDate, recall = false) {
  let options = {
    method: 'GET',
    url: `${config.app["DOMAIN"]["DATA_API"]}${config.app["API_URL"]["WIN"]}`,
    qs: {
      startDate: startDate,
      endDate: endDate
    },
    headers: {
      authorization: config.app["TOKEN"],
      "ocms-currency": config.app.currency ? config.app.currency : ''
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