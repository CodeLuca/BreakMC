/**
 * Admin Panel routes
 *
 * @module app_routes
 */

module.exports = function(App) {
  'use strict';

  let debug = require('debug')('adminpanel_routes');
  
  debug('exported');

  // Check if User is an admin 
  App.Express.post('/admin/admin/check', function(req, res) {
    App.api.auth.isAdmin(req.body.username, false)
      .then(function(doc) {
        res.render('admin_panel', {
          'auth_type': req.auth_type,
          'response': doc
        });
      });
  });

  // Make User Admin
  App.Express.post('/admin/admin/make', function(req, res) {
    App.api.auth.isAdmin(req.session.username, true)
      .then(function(auth) {
        if(auth) {
          return App.api.auth.makeAdmin(req.body.username)
        } else {
          return null;
        }
      }, function(err) {
        debug(err);
        res.redirect('/');
      })
      .then(function(doc) {
        res.render('admin_panel', {
          'auth_type': req.auth_type,
          'response': doc
        });
      }, function(err) {
        debug(err);
        res.redirect('/');
      });
  });

  // Make User Not an Admin
  App.Express.post('/admin/admin/remove', function(req, res) {
    App.api.auth.isAdmin(req.session.username, true)
      .then(function(auth) {
        if(auth) {
          return App.api.auth.makeDefault(req.body.username)
        } else {
          return null;
        }
      }, function(err) {
        debug(err);
        res.redirect('/');
      })
      .then(function(doc) {
        res.render('admin_panel', {
          'auth_type': req.auth_type,
          'response': doc
        });
      }, function(err) {
        debug(err);
        res.redirect('/');
      });
  });

  // Make User Not an Admin
  App.Express.post('/admin/forum/remove', function(req, res) {
    App.api.auth.isAdmin(req.session.username, true)
      .then(function(auth) {
        if(auth) {
          return App.api.auth.removeThread(req.body.id)
        } else {
          return null;
        }
      }, function(err) {
        debug(err);
        res.redirect('/');
      })
      .then(function(doc) {
        res.render('admin_panel', {
          'auth_type': req.auth_type,
          'response': doc
        });
      }, function(err) {
        debug(err);
        res.redirect('/');
      });
  });
}