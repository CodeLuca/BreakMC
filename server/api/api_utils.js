/**
 * API utils
 *
 * @module api_utils
 * @return {Object}
 */

'use strict';

var debug = require('debug')('api_utils');

class utils {

  constructor() {
    debug('exported');
  }

  /**
   * @func hashPass
   * @param {Object}
   * @return {Object}
   */
  hash(data) {
    debug('hashing password.');

    // Returning an ES6 Promise
    return new Promise(function(resolve, reject) {

      // Hash data
      App.Encrypt.hash(
        data,
        App.config.encrypt_rounds,
        function(err, hash) {
          if (!err) {
            debug('password hashed.');
            resolve(hash);
          } else {
            debug('Error hashing password.');
            reject(new Error(err));
          }
        }
      );  
    });
  }
};

module.exports = utils;