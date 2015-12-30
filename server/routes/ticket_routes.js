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
          return App.api.tickets.getTickets({'user': req.session.username});
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
    App.api.tickets.ticketPermission(req.session.username, req.params.id)
      .then(function(docs) {
        if(docs == true) {
          return App.api.tickets.getSingleTicket(req.params.id);
        } else {
          res.redirect('/');
          return null;
        }
      }, function(err) {
        debug(err);
        res.redirect('/tickets');
      }).then(function(docs) {
        if(!docs[0]) {
          res.send(404);
          return;
        }
        res.render('view_ticket', {
          'auth_type': req.auth_type,
          'ticket': docs[0]
        });
      }, function(err) {
        debug(err);
        res.redirect('/tickets');
      });
  });

  // Reply to Ticket
  App.Express.post('/ticket/reply/:id', function(req, res) {
    Promise.all([
      App.api.tickets.ticketPermission(req.session.username, req.params.id),
      App.api.tickets.reply(req)
    ]).then(function(docs) {
      if(docs[0] == true) {
        res.redirect('/tickets/view/' + req.params.id);
      } else {
        res.redirect('/tickets');
      }
    }, function(err) {
      debug(err);
      res.redirect('/tickets');
    });
  });

  // Resolve Ticket
  App.Express.post('/ticket/resolve/:id', function(req, res) {
    App.api.tickets.ticketPermission(req.session.username, req.params.id)
      .then(function(docs) {
        if(docs == true) {
          App.db.tickets.remove({
            'id': req.params.id
          }, function(err, docs) {
            res.redirect('/tickets');
          });
        } else {
          res.redirect('/tickets');
        }
      }, function(err) {
        debug(err);
        res.redirect('/tickets');
      });
  });
};