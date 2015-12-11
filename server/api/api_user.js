/**
 * User API
 *
 * @module api_forums
 * @return {Class}
 */

'use strict';

let debug = require('debug')('api_user');

class user {

  constructor() {
    debug('exported');
  }

  /**
   * Creates a new user
   *
   * @func create
   * @param {Object} data
   * @param {String} data.username
   * @param {Hash} data.password
   */
   create(data) {
    debug('creating user.');

    // Return an ES6 promise
    return new Promise(function(resolve, reject) {
      // Create empty arrays which ids will be stored.
      data.posts = [],
      data.tickets = [],
      data.apps = [];
      
      // Insert into databse.
      App.db.users.insert(data, function(err, doc) {
        
        if(!err) {
          debug('user created.');

          // If there are no errors, resolve promise and return document created.
          resolve(doc);
        
        } else {
          debug('error creating user');
          debug(err);

          // Return the error and the reason.
          reject(new Error(err));
        }

      });
    });
   }

  /**
   * Reads data from a user.
   *
   * @func read
   * @param {Object} data
   * @return {Object} A promise object.
   */
   read(data) {
    debug('attempting to read user.');

    // Return an ES6 Promise
    return new Promise(function(resolve, reject) {

      App.db.users.find(data, function(err, docs) {

        if (!err) {
          if (docs[0]) {
            debug('user read.');
            resolve(docs);
          } else {
            resolve(null);
          }
        } else {
          debug('error reading user.');
          debug(err);

          reject(new Error(err));
        }

      });
    });
   }
  
  /**
   * Updates data on a user.
   *
   * @func update
   * @param {string} id
   * @param {Object} data
   * @return {Object} A promise object.
   *
   * @todo Check Mongo docs on `save` method.
   */
   update(query, update) {
    debug('updating user.');

    // Return ES6 Promise
    return new Promise(function(resolve, reject) {

      App.db.users.update(
      query,
      update,
      function(err, result) {

        if(!err) {
          debug(result);
          if(result.n > 0) {
            debug('user updated');
            resolve(true);
          } else {
            resolve(null);
          }
        } else {
          debug('error updating user.');
          debug(err);

          reject(new Error(err));
        }

      });
    });
   }
  
  /**
   * Deletes a user.
   *
   * @func destroy
   * @param {Object} data
   * @return {boolean} If the user was deleted.
   */
  destroy(data) {
    debug('deleting user.');
    
    // Return ES6 Promise
    return new Promise(function(resolve, reject) {

      App.db.user.remove(data, 1, function(err, doc) {
        
        if(!err) {
          debug('user detroyed');
          resolve(true);
        } else {
          debug('error destroying user.');
          reject(new Error(err));
        }

      });
    });
  }

  /**
   * Check if a user exists.
   *
   * @func isExist
   * @param {string} username
   * @return {boolean} If the user exists.
   */
  isExist(username) {
    debug('checking if user exists.');

    let self = this;

    return new Promise(function(resolve, reject) {

      let exists = false;

      self.read({
        'username': username
      })
      .then(function(docs) {

        if (docs !== null) {
          debug('user exists.');
          exists = true;

        } else {
          debug('user does not exist.');
          exists = false;
        }

        resolve(exists);

      }).catch(function(err) {
        debug('error checking if user exists.');
        reject(new Error(err));
      })
    });
  }
};
module.exports = user;