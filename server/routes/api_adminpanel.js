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

  App.Express.post('/admin/forum/setid', function(req, res) {
    App.api.auth.isAdmin(req.session.username, true) 
      .then(function(auth) {
        if(auth) {
          App.db.threads.update({
            'id': req.body.oldID
          }, {
            $set: {
              'id': req.body.newID
            }
          }, function(err, docs) {
            if(!err) {
              res.redirect('/forum/view/' + req.body.newID);
            } else {
              debug(err);
              res.redirect('/');
            }
          }, function(err) {
            debug(err);
            res.redirect('/');
          });
        } else {
          res.redirect('/login');
        }
      });
  });

  App.Express.post('/admin/updates/add', function(req, res) {
    App.api.auth.isAdmin(req.session.username, true)
      .then(function(auth) {
        // Get today's date
        let today = new Date();
        let dd = today.getDate();
        let mm = today.getMonth()+1; //January is 0!

        let yyyy = today.getFullYear();
        if(dd<10){
            dd='0'+dd
        } 
        if(mm<10){
            mm='0'+mm
        } 
        let date = mm+'/'+dd+'/'+yyyy;

        App.db.updates.insert({
          'title': req.body.title,
          'content': req.body.content,
          'date': date,
          'user': req.session.username
        }, function(err, docs) {
          if(!err) {
            res.redirect('/updates');
          } else {
            debug(err);
            res.redirect('/');
          }
        });
      });
  });

  App.Express.post('/admin/staff/set', function(req, res) {
    App.api.auth.isAdmin(req.session.username, true)
      .then(function(auth) {
        if(auth) {
          debug(auth);
          App.db.staff.update({
            'rank': req.body.rank
          }, {
            $push: {
              'staff': {
                'user': req.body.user
              }
            }
          }, function(err, docs) {
            if(!err) {
              res.redirect('/staff');
            } else {
              debug(err);
              res.redirect('/');
            }
          })
        } else {
          res.redirect('/login');
        }
      });
  });

  App.Express.post('/admin/staff/remove', function(req, res) {
    App.api.auth.isAdmin(req.session.username, true)
      .then(function(auth) {
        if(auth) {
          App.db.staff.remove({
            'user': req.body.user
          }, function(err, docs) {
            if(!err) {
              res.redirect('/staff');
            } else {
              debug(err);
              res.redirect('/');
            }
          })
        } else {
          res.redirect('/login');
        }
      });
  });
}