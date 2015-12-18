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


  ticketPermission(username, id) {
    debug('is user authorized to see ticket?');

    let self = this;

    return new Promise(function(resolve, reject) {
      Promise.all([
        self.getSingleTicket(id),
        App.api.auth.isAdmin(username, true)
        ]).then(function(docs) {
          if(docs[0][0].user == username) {
            resolve(true);
          } else {
            if(docs[1] == true) {
              resolve(true);
            } else {
              resolve(false);
            }
          }
        }, function(err) {
          reject(new Error(err));
        });
    });
  }


  // Reply to Ticket
  reply(req) {
    debug('attempting to reply to ticket.');

    return new Promise(function(resolve, reject) {

      App.db.tickets.update({
        'id': req.params.id
      }, {
        $push: {
          'replies': {
            'user': req.session.username,
            'content': req.body.content
          }
        },
        $set: {
          'status': 'read'
        }
      }, function(err, docs) {
        if(!err) {
          resolve(docs);
        } else {
          reject(err);
        }
      });

    });
  }
};

module.exports = tickets;