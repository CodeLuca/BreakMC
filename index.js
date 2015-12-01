// BreakMC

'use strict';

var App = App || {},
    bodyParser = require('body-parser');

process.env.DEBUG = 'index, api_routes, app_routes, api_forums';

var debug = require('debug')('index'),
    expressHbs = require('express-handlebars');

debug('Server started');

/**
 * Require Express dependency.
 * Run express dependency on alias.
 * @see {@link http://expressjs.com/4x/api.html}
 */
const express = require('express');
App.Express = express();
debug('Express dependency loaded.');

/**
 * Assign bcrypt dependency an alias.
 * bcrypt is a key derivation function for passwords based on the Blowfish cipher.
 * @see {@link https://github.com/ncb000gt/node.bcrypt.js}
 */
App.Encrypt = require('bcrypt');
debug('bcrypt dependency loaded.');

/**
 * Assign express-session an alias.
 * express-session is middleware for Express.
 * @see {@link https://github.com/expressjs/session}
 */
App.Sessions = require('express-session');
debug('express-session dependency loaded.');

/**
 * Assign connect-mongo dependency an alias.
 * connect-mongo is a MongoDB session store for Express.
 * @see {@link https://github.com/kcbanner/connect-mongo}
 */
App.SessionStore = require('connect-mongo')(App.Sessions);
debug('connect-mongo dependency loaded.');

/**
 * Assign shortid dependency an alias.
 * shortid is an Amazingly short non-sequential url-friendly unique id generator.
 * @see {@link https://github.com/dylang/shortid}
 */
App.shortid = require('shortid');
debug('shortid dependency loaded.');

/** Initialise config */
App.config = require('./config.js')(App);
debug('config initialised');

/** Initialise database */
App.db = require('mongojs')(App.config.db_path, App.config.db_collections);
debug('db initialised.');

/** Initialise APIs */
App.api = App.api || {};
App.api.auth = require('./server/api/api_forums.js')(App);

/** Initialise routes */
require('./server/routes/app_routes.js')(App);
require('./server/routes/api_routes.js')(App);
debug('routes required');

/**
 * Configure sessions.
 */
App.Express.use(App.Sessions({
  secret: 'wowtoZJVxpdk5736=99',
  name: 'id',
  genid: function(req) {
    return App.shortid.generate();
  },
  saveUninitialized: false,
  resave: false,
  store: new App.SessionStore({
    url: App.config.db_path,
    collection: 'sessions'
  })
}));
debug('sessions configured.');

/** Set the view engine used to parse templates and views */
App.Express.engine('hbs', expressHbs({extname:'hbs', defaultLayout:'main.hbs'}));
App.Express.set('view engine', 'hbs');
debug('view engine set.');

/** Set up virtual paths for static files */
App.Express.use(express.static(__dirname + '/client'));
debug('virtual paths set up.');

/** Start server listening on configured port */
App.Express.listen(App.config.port);
debug('running on port ' + App.config.port + '.');
