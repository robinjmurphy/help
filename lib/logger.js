var settings = require('../settings');
var winston = require('winston');

var transport = new winston.transports.Console({
  level: settings.logLevel
});

module.exports = new winston.Logger({
  transports: [transport]
});
