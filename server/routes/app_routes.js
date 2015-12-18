/**
 * App routes
 *
 * @module app_routes
 */

module.exports = function(App) {
  'use strict';

  let debug = require('debug')('app_routes');
  
  debug('exported');

  // Check if user is logged in
  App.Express.use('*', function(req, res, next) {
    if(!req.session.username) {
      req.auth_type = 'Login',
      req.auth_bool = false;
      next();
    } else {
      req.auth_type = 'Logout',
      req.auth_bool = true;
      next();
    }
  });

  // Index Route
  App.Express.get('/', function(req, res) {
    res.render('index', {'auth_type': req.auth_type});
  });

  // Register Route
  App.Express.get(['/login','/register'], function(req, res) {
    if(!req.session.username) {
      res.render('register', {'auth_type': req.auth_type});
    } else {
      res.redirect('/');
    }
  });

  // Forum route
  App.Express.get(['/forums', '/forum'], function(req, res) {
    App.db.utils.find({
      'type': 'category'
    }, function(err, docs) {
      if(!err) {
        debug(docs);
        res.render('forum', {
            'auth_type': req.auth_type,
            'auth_bool': req.auth_bool,
            'categories': docs[0].list
        });
      } else {
        debug(err);
        res.redirect('/');
      }
    });
  });

  // Login POST request
  App.Express.post('/login', function(req, res) {
    debug('attempting login');

    App.api.user.isExist(req.body.username)
      .then(function(exists) {
        if(exists) {
            return App.api.auth.isAuth(req.body.username, req.body.password);
        } else {
          return null;
        }
      }, function(err) {
        debug(err);
        return err;
      })
      .then(function(auth) {
        if (auth) {
          req.session.username = req.body.username;
          res.redirect('/');
        } else {
          // Send error message
          debug('incorrect creds');
          res.render('register', {
            'auth_type': 'Register',
            'err': 'Incorrect Credentials'
          });
        }
      }, function(err) {
        return err;
      });
  });

  // Registration POST request
  App.Express.post('/register', function(req, res) {
    debug('attempting register.');

    App.api.user.isExist(req.body.username)
      .then(function(exists) {
        if (!exists) {
          return App.api.utils.hash(req.body.password);
        } else {
          debug('user already exists');
          res.render('register', {
            'auth_type': 'Register',
            'err': 'User already exists'
          });
          return null;
        }
      }, function(err) {
        return err;
      }).then(function(hash) {

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

        // Hash
        if(hash) {
          return App.api.user.create({
            'username': req.body.username,
            'password': hash,
            'date': date
          })
        } else {
          return null;
        }
      }, function(err) {
        debug(err);
      }).then(function(doc){
        if (doc) {
          req.session.username = doc.username;
          res.redirect('/');
        }
      }, function(err) {
        debug(err);
      });
  });

  // Logout Request
  App.Express.get('/logout', function(req, res) {
    delete req.session.username;
    res.redirect('/login');
  });

  // New Thread Page
  App.Express.get(['/forum/new', '/forums/new'], function(req, res) {
    res.render('new_thread', {'auth_type': req.auth_type});
  });

  // New Forum Thread.
  App.Express.post('/forum/new', function(req, res) {
    debug('attempting new thread.');

    // Check if logged in
    if(!req.session.username) {
       res.redirect('/');
      return;
    }

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

    // Insert into db
    App.db.threads.insert({
      'title': req.body.title,
      'body': req.body.body,
      'user': req.session.username,
      'time': date,
      'views': 0,
      'replies': [],
      'titleSnippet': req.body.title.substr(0, 50),
      'snippet': req.body.body.substr(0, 40).toString() + '...',
      'category': req.body.category,
      'id': App.shortid.generate()
    }, function(err, docs) {
      if(err) {
        debug(err);
        return;
      }
      res.redirect('/forum');
    });
  });

  // View forum category
  App.Express.get(['/forum/category/:cat', '/forums/category/:cat', '/forum/cat/:cat', '/forums/cat/:cat'], function(req, res) {
    App.db.threads.find({
      'category': req.params.cat
    }, function(err, docs) {
      if(err) {
        debug(err);
        res.redirect('/');
      } else {
        res.render('forum_category', {
            'auth_type': req.auth_type,
            'threads': docs.reverse(),
            'auth_bool': req.auth_bool,
            'helpers': {
              last: function(array) {
                return array[array.length - 1];
              }
            }
        });
      }
    });
  });

  // View thread
  App.Express.get(['/forum/view/:id', '/forums/view/:id'], function(req, res) {
    // Find thread
    App.db.threads.find({
      'id': req.params.id
    }, function(err, docs) {
      if(err) {
        debug(err);
      }
      if(!docs[0]) {
        res.send(404);
      } else {
        // Add view
        App.db.threads.update({
          'id': req.params.id
        }, {
          $inc: {
            'views': 1
          }
        }, function(err) {
          if(err) {
            debug(err); 
          }
          // Render
          res.render('view_thread', {
            'auth_type': req.auth_type,
            'post': docs[0]
          });
        });
      }
    });
  });

  // Reply to Form Post 
  App.Express.post('/forum/reply/:id', function(req, res) {
    if(!req.session.username || req.body.body == '' || !req.body.body) {
      res.redirect('/');
      return;
    }
    App.db.threads.update({
      'id': req.params.id
    }, {
      $push: {
        'replies': {
          'user': req.session.username,
          'body': req.body.body
        }
      }
    }, function(err) {
      if(err) {
        debug(err);
        res.redirect('/');
      } else {
        res.redirect('/forum/view/' + req.params.id);
      }
    });
  });

  // View Their Own Profile
  App.Express.get('/profile', function(req, res) {
    if(!req.session.username) {
      res.redirect('/register');
      return;
    }
    Promise.all([
      App.api.auth.isAdmin(
        req.session.username,
        true
      ),
      App.api.user.read({
        'username': req.session.username
      }),
      App.api.user.findThreads(
        req.session.username
      )
    ]).then(function(docs) {
      if(docs[0] == true) {
        res.render('profile', {
          'auth_type': req.auth_type,
          'profile': docs[1][0],
          'threads': docs[2],
          'admin': true
        });
      } else {
        res.render('profile', {
          'auth_type': req.auth_type,
          'profile': docs[1][0],
          'threads': docs[2],
          'admin': false
        });
      }
    }, function(err) {
      debug(err);
      res.redirect('/register');
    });
  });

  // View Someone elses Profile
  App.Express.get('/profile/:username', function(req, res) {
    App.api.user.read({
      'username': req.params.username
    }).then(function(profile) {
      if(profile != null) {
        App.db.threads.find({
          'user': req.params.username
        }, function(err, docs) {
          res.render('profile', {
            'auth_type': req.auth_type,
            'profile': profile[0],
            'threads': docs
          });
        });
      } else {
        res.send(404);
      }
    }, function(err) {
      res.redirect('/');
    });
  });

  // Admin Panel
  App.Express.get('/adminPanel', function(req, res) {
    if(!req.session.username) {
      res.redirect('/');
      return;
    }
    App.api.auth.isAdmin(req.session.username, true)
      .then(function(allowed) {
        if(allowed == true) {
          res.render('admin_panel', {
            'auth_type': req.auth_type
          });
        } else {
          res.send(403);
        }
      }, function(err) {
        debug(err);
        res.redirect('/');
      });
  });

  // Store Route
  App.Express.get('/store', function(req, res) {
    res.render('store', {'auth_type': req.auth_type});
  });

  // Updates Page
  App.Express.get('/updates', function(req, res) {
    App.db.updates.find(function(err, docs) {
      if(!err) {
        res.render('updates', {'auth_type': req.auth_type, 'updates': docs});
      } else {
        debug(err);
        res.redirect('/');
      }
    });
  });

  // Staff Page
  App.Express.get('/staff', function(req, res) {
    App.db.staff.find(function(err, docs) {
      if(!err) {
        let newDocs = [{'rank': 'Owner'},{'rank': 'Developers'},{'rank': 'Administrators'},{'rank': 'Moderators'}];

        for (var i = 0; i < docs.length; i++) {
          debug(docs[i].rank);
          switch(docs[i].rank) {
            case 'Owner':
              newDocs[0].staff = docs[i].staff
              break;
            case 'Administrators':
              newDocs[2].staff = docs[i].staff
              break;
            case 'Developers':
              newDocs[1].staff = docs[i].staff
              break;
            case 'Moderators':
              newDocs[3].staff = docs[i].staff
              break;
            default:
              newDocs.push(docs[i]);
              break;
          }
        }; 
        debug(newDocs)
        res.render('staff', {'auth_type': req.auth_type, 'ranks': newDocs});

      } else {
        debug(err);
        res.redirect('/');
      }
    });
  });
};