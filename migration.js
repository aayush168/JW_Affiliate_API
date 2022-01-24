global.rootPath = __dirname;

const path = require('path');
const db = require('./db');

const mode = (process.env.mode) ? process.env.mode : 'prod';

const migrationService = require(path.join(rootPath, 'migrationService', 'migration.js'));
const logger = require(path.join(rootPath, 'logger', 'index.js'));
const	log = logger.getLogger('migration');

const migrationData = require(path.join(rootPath, 'config', mode, `config.migration.json`));
let encrypt = require(path.join(rootPath, 'utils', 'encrypt.js'))

async function init () {
  try {
    await db.initialize();
    // Migration for JW, SI, JWBDT
    // const result = await fetchAgentData();
    // await addAgentDataLabs(result.list)

    // Migration for BV
    const result = await fetchAgentDataBV();
    log.info(`Migration Successful`)
  } catch (err) {
    console.log('migration script error :', err)
  }
}

async function fetchAgentData () {
  try {
    const result = await migrationService.getAgentData();
    return result
  } catch (err) {
    console.log('fetching agent data error: ', err)
  }
}

async function addAgentDataLabs (data) {
  for (let i = 0; i < data.length; i ++) {
    const agentData = data[i]
    await migrationService.addAgentData(agentData);
  }
}

async function fetchAgentDataBV () {
  try {
    const dataSample = migrationData.Affiliate
    let agentData = []
    let operatorData = []
    dataSample.forEach(x => {
      if (x.Username) {
        agentData.push(x)
      } else {
        operatorData.push(x)
      }
    })
    console.log(agentData.length, 'agent data')
    console.log(operatorData.length, 'operator data')
    // return result
  } catch (err) {
    console.log('fetching agent data error: ', err)
  }
}

async function addAgentDataLabsBV (data) {
  for (let i = 0; i < data.length; i ++) {
    const agentData = data[i]
    await migrationService.addAgentData(agentData);
  }
}

init()