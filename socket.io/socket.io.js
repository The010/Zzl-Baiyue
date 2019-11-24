
/*!
 * socket.io-node
 * Copyright(c) 2011 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var client = require('socket.io-client');

/**
 * Version.
 */

exports.version = '0.9.16';

/**
 * Supported protocol version.
 */

exports.protocol = 1;

/**
 * Client that we serve.
 */

exports.clientVersion = client.version;

/**
 * Attaches a manager
 *
 * @param {HTTPServer/Number} a HTTP/S server or a port number to listen on.
 * @param {Object} opts to be passed to Manager and/or http server
 * @param {Function} callback if a port is supplied
 * @api public
 */


//  这块代码未知  wiki好像与线上部署有关
exports.listen = function (server, options, fn) {
  if ('function' == typeof server) {
    console.warn('Socket.IO\'s `listen()` method expects an `http.Server` instance\n'
    + 'as its first parameter. Are you migrating from Express 2.x to 3.x?\n'
    + 'If so, check out the "Socket.IO compatibility" section at:\n'
    + 'https://github.com/visionmedia/express/wiki/Migrating-from-2.x-to-3.x');
  }

  if ('function' == typeof options) {
    fn = options;
    options = {};
  }

  if ('undefined' == typeof server) {
    // create a server that listens on port 80
    //创建侦听端口80的服务器
    //作用未知
    server = 80;
  }

  if ('number' == typeof server) {
    // if a port number is passed
    //如果传递了端口号
    var port = server;

    if (options && options.key)
      server = require('https').createServer(options);
    else
      server = require('http').createServer();

    // default response
    //默认响应
    server.on('request', function (req, res) {
      res.writeHead(200);
      res.end('Welcome to socket.io.');
    });

    server.listen(port, fn);
  }

  // otherwise assume a http/s server
  //否则，假设http/s服务器
  return new exports.Manager(server, options);
};

/**
 * Manager constructor.	管理器构造函数
 *
 * @api public	@API发布
 */

exports.Manager = require('./manager');

/**
 * Transport constructor.
 *
 * @api public
 */

exports.Transport = require('./transport');

/**
 * Socket constructor.    Socket构造函数。
 *
 * @api public
 */

exports.Socket = require('./socket');

/**
 * Static constructor.	静态构造函数。
 *
 * @api public
 */

exports.Static = require('./static');

/**
 * Store constructor.
 *
 * @api public
 */

exports.Store = require('./store');

/**
 * Memory Store constructor.
 *
 * @api public
 */

exports.MemoryStore = require('./stores/memory');

/**
 * Redis Store constructor.
 *
 * @api public
 */

exports.RedisStore = require('./stores/redis');

/**
 * Parser.
 *
 * @api public
 */

exports.parser = require('./parser');
