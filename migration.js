global.rootPath = __dirname;

const path = require('path');
const db = require('./db');

const mode = (process.env.mode) ? process.env.mode : 'prod';

const migrationService = require(path.join(rootPath, 'migrationService', 'migration.js'));
const logger = require(path.join(rootPath, 'logger', 'index.js'));
const	log = logger.getLogger('migration');

let migrationData
if (mode === 'bvprod_thb') {
  migrationData = require(path.join(rootPath, 'config', mode, `config.migration.json`));
}
let encrypt = require(path.join(rootPath, 'utils', 'encrypt.js'))

async function init () {
  try {
    await db.initialize();
    log.info(`Migration Started`)
    // Migration for JW, SI, JWBDT
    // const result = await fetchAgentData();
    // await addAgentDataLabs(result.list)

    // Migration for BV
    const result = await fetchAgentDataBV();
    await addAgentDataLabsBV(result)
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
    dataSample.forEach(x => {
      if (x.Username) {        
        const agent = addPayloadData(x)
        agentData.push(agent)
      } else {
        x.Username = x["AgentName"]
        x.Password = 'bv666888'
        const agent = addPayloadData(x)
        agentData.push(agent)
      }
    })
    return agentData
  } catch (err) {
    console.log('fetching agent data error: ', err)
  }
}

async function addAgentDataLabsBV (data) {
  for (let i = 0; i < data.length; i ++) {
    const agentData = data[i]
    await migrationService.addAgentDataBV(agentData);
  }
}

function addPayloadData (agent) {
  const Salt1 = encrypt.getSalt(10)
  const Salt2 = encrypt.getSalt(12)
  const EncryptPassword = encrypt.encryptPassword(agent.Password, Salt1, Salt2);
  return {
    ...agent,
    Salt1: Salt1,
    Salt2: Salt2,
    EncryptPassword: EncryptPassword
  }
}

init()