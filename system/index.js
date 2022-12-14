const path = require('path');
const logger = require(path.join(rootPath, 'logger', 'index.js'));
const log = logger.getLogger('system');
const db = require(path.join(rootPath, 'db', 'index.js'));

let service = {};

service.getParameter = async function(code) {
  let conn;
  try {
    conn = await db.getConn('extra:read');
    let result = await conn.query({ sql: db.sql('system/getSystemParameter.sql'), values: [ code ]})
    if (result[0].length === 0) {
      return null;
    }
    if (result[0].length === 1) {
      return result[0][0];
    }
    return result[0];
  } catch (err) {
    log.error(err)
    throw err;
  }
}

service.getAuthToken = async function () {
  try {
    let conn = await db.getConn('jw');
    let result = await conn.query({sql: db.sql('system/getAPIToken.sql'), values: []});
    if (result[0].length === 0) {
      throw new Error("auth token not found.");
    }
    return result[0][0].Token;
  } catch (error) {
    log.error(error);
    throw error;
  }
}

module.exports = service