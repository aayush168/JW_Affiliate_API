var mysql = require('mysql2/promise');
var mysqlUtils = require('mysql2');
var glob = require("glob");
var fs = require("fs");
var path = require("path");
var _ = require("underscore");
const logger = require(path.join(rootPath, 'logger', 'index.js'));
const log = logger.getLogger('db');
var appConfig = require(path.join(rootPath, 'config', 'index.js'));
var confDB = appConfig.db;

var sqlTemplate = path.join(rootPath, 'sqlTemplate');
var sqlCache = {};
var pool = {};
var conn;
var error = {
  stdRollBack: 'STDROLLBACK'
}

function initialize(){
    var confList = _.map(confDB, function(conf, name){
      return {
        conf: conf,
        name: name
      };
    })
    var process = _.map(confList, function(item){
      return mysql.createPool({
        connectionLimit     : item.conf.pool.max,
        host                : item.conf.server,
        user                : item.conf.user,
        password            : item.conf.password,
        database            : item.conf.database,
        multipleStatements  : true,
        dateStrings         : true,
        queueLimit          : 100,
      })
    })
    process.push(loadSql());

    return Promise.all(process)
    .then(function(res){
        return Promise.all(_.map(confList, function(item, i){
        pool[item.name] = res[i];
        pool[item.name].on('connection', function (connection) {
            connection.query(`SET time_zone = "${item.conf.timezone ? item.conf.timezone : '+07:00'}";`)
        });

        return pool[item.name].query(`SELECT 1`)
        .then(function(){
            log.info(`DB ${item.conf.server}:${item.conf.database} is ready.`)
        });
      }))
    })
}

function loadSql(){
    var res = Promise.resolve();
    log.info('building sqlCache')

    return new Promise(function(resolve, reject){
        var length = sqlTemplate.length + 1;
        glob(path.join(sqlTemplate, "**/*.sql"), null, function (err, files) {
            if (err){
                reject(err);
                return;
            }

            Promise.all(files.map(function(item){
                return new Promise(function(resolve, reject){
                    fs.readFile(item, function(err, data){
                        if (err){
                            reject(err);
                            return;
                        }

                        sqlCache[item.substring(length)] = transDbName(data.toString());
                        resolve();
                    });
                })
            }))
            .then(function(){
                log.info('sqlCache builded.')
                resolve();
            })

        });
    })
}

fs.watch(sqlTemplate, {recursive: true}, function(e, filename){
    if (filename.endsWith('.sql')){
        log.info(`${filename} changed`);
        loadSql();
    }
})

function transDbName(str){
  _.each(confDB, function(item, name){
      str = str.split('$database_'+name).join(item.database)
  })

  return str;
}


function getConn(dbName){
    return pool[dbName];
}

module.exports = {
    initialize,
    getConn,
    error,
    sql: function(key){
        if (!(key in sqlCache)){
            log.error(`sql ${key} not found`);
            throw Error();
        }

        _.each(confDB, function(item, name){
            sqlCache[key] = sqlCache[key].split('$database_'+name).join(item.database)
        })

        return sqlCache[key];
    },
    escape: function(str){
        return mysqlUtils.escape(str);
    },
    escapeId: function(str){
        return mysqlUtils.escapeId(str);
    }
}