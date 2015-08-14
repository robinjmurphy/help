var nid = require('nid');
var settings = require('../settings');
var logger = require('winston');
var irc = require('irc');
var _ = require('lodash');
var Mustache = require('mustache');
var EventEmitter = require('events').EventEmitter;
var defaultChannels = _.clone(settings.irc.channels, true);
var client;

module.exports.connect = function (cb) {
  client = new irc.Client(settings.irc.host, settings.nick, settings.irc);

  client.on('error', function (err) {
    logger.error('irc:', err);
  });

  client.on('registered', function () {
    cb();
  });
};

module.exports.createChannel = function (data, cb) {
  var channel = '#' + settings.channelPrefix + nid();
  var events = new EventEmitter();

  client.on('message' + channel, function (helper, message) {
    events.emit('message', {
      helper: helper,
      message: message
    });
  });

  client.join(channel, function () {
    var alert = Mustache.render(settings.messages.alert, _.defaults({
      channel: channel
    }, data));

    defaultChannels.forEach(function (channel) {
      client.say(channel, alert);
    });

    client.on('join' + channel, function (helper) {
      events.emit('join', helper);
      client.say(channel, Mustache.render(settings.messages.join, _.defaults({
        helper: helper
      }, data)));
    });

    client.on('part' + channel, function (helper) {
      events.emit('part', helper);
    });

    cb(channel, events);
  });
};

module.exports.sendMessage = function (channel, message) {
  client.say(channel, message);
};

module.exports.partChannel = function (channel) {
  client.part(channel);
}
