'use strict';

var Mongoose  = require('mongoose');

/**
 * Each connection object represents a user connected through a unique socket.
 * Each connection object composed of {userId + socketId}. Both of them together are unique.
 *
 */
var MessageSchema = new Mongoose.Schema({
    content: { type: String, required: true },
    username: { type:  String, required:true, index: true  },
    date: { type: Date, required:true },
    room_id: { type: String, required: true, index: true  },
    room_name: { type: String, required: true },
});

var messageModel = Mongoose.model('message', MessageSchema);

module.exports = messageModel;