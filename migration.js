global.rootPath = __dirname;

const path = require('path');
const db = require('./db');

const migrationService = require(path.join(rootPath, 'migrationService', 'migration.js'));
const logger = require(path.join(rootPath, 'logger', 'index.js'));
const	log = logger.getLogger('migration');

async function init () {
  try {
    await db.initialize();
    const result = await fetchAgentData();
    await addAgentDataLabs(result.list)
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

init()