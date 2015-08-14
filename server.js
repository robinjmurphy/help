var express = require('express');
var logger = require('./lib/logger');
var Mustache = require('mustache');
var util = require('util');
var path = require('path');
var irc = require('./lib/irc');
var settings = require('./settings');
var app = express();
var connected = false;
var io;

app.disable('x-powered-by');
app.engine('html', require('hogan-express'));
app.set('view engine', 'html');
app.set('layout', 'layout');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

app.use(function (req, res, next) {
  if (!connected) return next(new Error('IRC has not yet connected. Please wait.'));

  next();
});

app.use(function (req, res, next) {
  res.locals.windowTitle = settings.windowTitle;
  next();
});

app.get('/', function (req, res, next) {
  res.render('index');
});

app.get('/chat', function (req, res) {
  irc.createChannel(req.query, function (channel, events) {
    events.on('join', function (helper) {
      logger.debug('join', channel, helper);
      io.to(channel).emit('join', helper);
    });

    events.on('message', function (data) {
      logger.debug('message', channel, data);
      io.to(channel).emit('message', data);
    });

    events.on('part', function (helper) {
      logger.debug('part', channel, helper);
      io.to(channel).emit('part', helper);
    });

    res.render('chat', {
      channel: channel,
      query: JSON.stringify(req.query),
      welcome: Mustache.render(settings.messages.welcome, req.query)
    });
  });
});

app.use(function (req, res, next) {
  var err = new Error(util.format('Cannot %s %s', req.method, req.url));
  err.statusCode = 404;
  next(err);
});

app.use(function (err, req, res, next) { // jshint ignore:line
  var statusCode = err.statusCode || 500;
  logger.error(err.message, {
    url: req.path,
    statusCode: statusCode
  });
  res.status(statusCode).send(err.message);
});

var server = app.listen(settings.port, function () {
  logger.info('Server started at http://127.0.0.1:%d', server.address().port);
});

irc.connect(function () {
  connected = true;
  io = require('socket.io')(server);

  io.on('connection', function (socket) {
    logger.info('User connected %s', socket.id);

    socket.on('join room', function (room) {
      socket.room = room;
      logger.info('User %s joining room %s', socket.id, room);
      socket.join(room);
    });

    socket.on('disconnect', function () {
      logger.info('User disconnected %s', socket.id);
      irc.partChannel(socket.room);
    });

    socket.on('message', function (data) {
      var prefix = Mustache.render(settings.messagePrefix, data.query);
      var message = prefix + data.message;

      logger.debug('message', data.room, message);
      irc.sendMessage(data.room, message);
    });
  });
});
