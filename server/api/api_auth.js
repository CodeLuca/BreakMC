/**
 * Auth API
 *
 * @module api_forums
 * @return {Class}
 */

'use strict';

var debug = require('debug')('api_auth');

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
   isAuth(username, password) {
    
   }
};

module.exports = auth;