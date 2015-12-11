/**
 * Auth API
 *
 * @module api_forums
 * @return {Class}
 */

'use strict';

let debug = require('debug')('api_auth');

class auth {

  constructor() {
    debug('exported');
  }

  /**
   * Checks user authenticity.
   *
   * @func isAuth
   * @param {string} username
   * @param {string} password
   * @return {Object} A promise object indicating if the user was authenticated.
   */
  isAuth (username, password) {
    debug('checking user authenticity.');

    // Return ES6 Promise
    return new Promise(function(resolve, reject) {

      App.api.user.read({
        'username': username
      })
      .then(function(docs) {
        if (docs !== null) {
          debug('comparing password with hash.');

          App.Encrypt.compare(password, docs[0].password, function(err, res) {
            if (!err) {
              debug('password compared with hash.');
              debug(res ? 'Password correct.' : 'Password incorrect.');

              resolve(res);
            } else {
              debug('error comparing password with hash.');

              reject(new Error(err));
            }
          });
        }
      }, function(err) {
        reject(new Error(err));
      });
    });
  }

  /**
   * Unauthenticates the user (logs the user out of the session).
   *
   * @func unAuth
   * @param {Object} data
   * @return {boolean} If the unauthentication was successful.
   */
  unAuth(req, res) {
    debug('unauthenticating user.');

    let authenticated = true;

    req.session.destroy(function(err) {
      if (!err) {
        debug('user unauthenticated.');

        authenticated = false;
        res.redirect('/');
      } else {
        debug('Error unauthenticating user.');
        debug(err);
      }
    });

    return authenticated;
  }

  /**
   * @func isAdmin
   * @param {String}
   * @return {boolean}
   */
  isAdmin(user) {
    debug('checking if user is admin');

    // Return ES6 Promise
    return new Promise(function(resolve, reject) {
      App.db.users.find({
        'admin': true
      }, function(err, docs) {

        if(err) {
          reject(new Error(err));
        }

        if(docs) {
          resolve(true);
        } else {
          resolve(false);
        }

      });
    });
  }

  /**
   * @func makeAdmin
   * @param {String}
   */
  makeAdmin(user) {
    debug('changing user perms');

    // Return ES6 Promise
    return new Promise(function(resolve, reject) {
      App.db.users.update({
        'username': user
      }, {
        $set: {
          'admin': true
        }
      }, function(err, docs) {
        if(!err) {
          resolve(true);
        } else {
          reject(new Error(err));
        }
      });
    });
  }

  /**
   * @func removeUser
   * @param {String}
   */
  removeUser(user) {
    debug('remove: ' + user);

    return new Promise(function(resolve, reject) {
      App.db.users.remove({
        'username': user
      }, function(err, docs) {
        if(err) {
          reject(new Error(err));
        } else {
          resolve(true);
        }
      });
    });
  }

  /**
   * @func removeID
   * @param {String}
   */
  removeThread(id) {
    debug('removing Thread: ' + id);

    // Return ES6 Promise
    return new Promise(function(resolve, reject) {
      App.db.threads.remove({
        'id': id
      }, function(err, docs) {
        if(err) {
          reject(new Error(err));
        } else {
          resolve(true);
        }
      });
    });
  }
};

module.exports = auth;