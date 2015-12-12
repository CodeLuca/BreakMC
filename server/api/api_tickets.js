/**
 * Tickets API
 *
 * @module api_forums
 * @return {Class}
 */

'use strict';

var debug = require('debug')('api_tickets');

class tickets {

  constructor() {
    debug('exported');
  }

  // Get Tickets
  getTickets(query) {
    debug('getting tickets.');

    return new Promise(function(resolve, reject) {
      App.db.tickets.find(query, function(err, docs) {
        if(!err) {
          resolve(docs);
        } else {
          reject(err);
        }
      });
    });
  }

  // Create Ticket
  newTicket(req) {
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
    let date = dd+'/'+mm+'/'+yyyy;

    return new Promise(function(resolve, reject) {
      App.db.tickets.insert({
        'user': req.session.username,
        'content': req.body,
        'type': req.body.type,
        'date': date,
        'status': 'unread',
        'replies': [],
        'id': App.shortid.generate()
      }, function(err, docs) {
        if(!err) {
          resolve(docs);
        } else {
          reject(new Error(err));
        }
      });
    });
  }

  // Get a ticket
  getSingleTicket(id) {
    debug('getting a ticket');

    // ES6 Promise
    return new Promise(function(resolve, reject) {
      App.db.tickets.find({
        'id': id
      }, function(err, docs) {
        if(!err) {
          resolve(docs);
        } else {
          reject(new Error(err));
        }
      });
    });
  }
};

module.exports = tickets;