var path = require('path');
var winston = require('winston');

exports.getLogger = function(name){
  winston.loggers.add(name, {
    console: {
      level: 'debug',
      colorize: true,
      label: name
    },
    file: {
      filename: path.join(rootPath, 'logs', `${name}.log`)
    }
  });
	return winston.loggers.get(name);;
};
