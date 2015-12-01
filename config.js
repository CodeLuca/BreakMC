/**
 * Config
 * A module for config properties.
 *
 * @module config
 */

module.exports = function(App) {
  'use strict';

  return {

    db_path: 'mongodb://localhost:27017/breakmc',

    db_collections: ['users'],

    /**
     * The port that the app will run on.
     * @type {number}
     */
    port: 3000,

    /**
     * The cost of encrypting data.
     * @type {number}
     * @see {@link https://github.com/ncb000gt/node.bcrypt.js/#a-note-on-rounds}
     */
    encrypt_rounds: 10,
  };
};
