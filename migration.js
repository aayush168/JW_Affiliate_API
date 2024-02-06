global.rootPath = __dirname;

const path = require('path');
const db = require('./db');

const migrationService = require(path.join(rootPath, 'migrationService', 'migration.js'));
const migrationData = require(path.join(rootPath, 'migrationData.json'));

async function init () {
  try {
    await db.initialize();
    console.log(`Migration Started`)
    for (let i = 0; i < migrationData.length; i ++) {
      const agentData = migrationData[i]
      await migrationService.addNegativeData(agentData);
    }
    console.log(`Migration Successful`)
  } catch (err) {
    console.log('migration script error :', err)
  }
}

init()