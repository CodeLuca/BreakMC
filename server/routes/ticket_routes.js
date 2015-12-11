/**
 * ticket routes
 *
 * @module api_routes
 */

module.exports = function(App) {
  'use strict';

  let debug = require('debug')('ticket_routes');
  
  debug('exported');

  App.Express.get('/tickets', function(req, res) {
    let type;
    if(!req.session.username) {
      res.redirect('/register');
      return;
    }

    App.api.auth.isAdmin(req.session.username, true)
      .then(function(doc) {
        if(doc == true) {
          type = 'admin';
          return App.api.utils.getTickets({});
        } else {
          type = 'user';
          return App.api.utils.getTickets({'username': req.session.username});
        }
      }).then(function(docs) {
        res.render('tickets_' + type, {
          'auth_type': req.auth_type,
          'tickets': docs
        });
      });
  });
};