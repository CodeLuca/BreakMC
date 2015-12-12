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
          return App.api.tickets.getTickets({'username': req.session.username});
        }
      }).then(function(docs) {
        res.render('tickets_' + type, {
          'auth_type': req.auth_type,
          'tickets': docs
        });
      });
  });

  App.Express.get(['/tickets/new', '/tickets/create', '/tickets/add'], function(req, res) {
    if(!req.session.username) {
      res.redirect('/');
      return;
    }

    res.render('tickets_new', {
      'auth_type': req.auth_type
    });
  });

  // New Ticket Post Request
  App.Express.post(['/tickets/new', '/tickets/create', '/tickets/add'], function(req, res) {
    debug('making a new ticket.');
    if(!req.session.username) {
      res.redirect('/');
      return;
    }

    App.api.tickets.newTicket(req)
      .then(function(docs) {
        res.redirect('/tickets');
      }, function(err) {
        debug(err);
        res.redirect('/tickets');
      });
  });

  // View Specific Ticket
  App.Express.get('/tickets/view/:id', function(req, res) {
    App.api.tickets.getSingleTicket(req.params.id)
      .then(function(docs) {
        res.render('view_ticket', {
          'auth_type': req.auth_type,
          'ticket': docs[0]
        });
      }, function(err) {
        debug(err);
        res.redirect('/tickets');
      });
  });
};