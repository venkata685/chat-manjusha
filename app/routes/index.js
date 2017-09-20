'use strict';

var express	 	= require('express');
var router 		= express.Router();
var passport 	= require('passport');

var User = require('../models/user');
var Room = require('../models/room');
var Message = require('../models/message');

// Home page
router.get('/', function(req, res, next) {
	// If user is already logged in, then redirect to rooms page
	if(req.isAuthenticated()){
		res.redirect('/rooms');
	}
	else{
		res.render('login', {
			success: req.flash('success')[0],
			errors: req.flash('error'), 
			showRegisterForm: req.flash('showRegisterForm')[0]
		});
	}
});

// Login
router.post('/login', passport.authenticate('local', { 
	successRedirect: '/rooms', 
	failureRedirect: '/',
	failureFlash: true
}));

// Register via username and password
router.post('/register', function(req, res, next) {

	var credentials = {'username': req.body.username, 'password': req.body.password };

	if(credentials.username === '' || credentials.password === ''){
		req.flash('error', 'Missing credentials');
		req.flash('showRegisterForm', true);
		res.redirect('/');
	}else{

		// Check if the username already exists for non-social account
		User.findOne({'username': new RegExp('^' + req.body.username + '$', 'i')}, function(err, user){
			if(err) throw err;
			if(user){
				req.flash('error', 'Username already exists.');
				req.flash('showRegisterForm', true);
				res.redirect('/');
			}else{
				User.create(credentials, function(err, newUser){
					if(err) throw err;
					req.flash('success', 'Your account has been created. Please log in.');
					res.redirect('/');
				});
			}
		});
	}
});


// Rooms
router.get('/rooms', [User.isAuthenticated, function(req, res, next) {
	Room.find(function(err, rooms){
		if(err) throw err;
		res.render('rooms', { rooms });
	});
}]);
// Rooms
router.get('/messages', [User.isAuthenticated, function(req, res, next) {
	
	Message.find(function(err, messages){
		if(err) throw err;
		var starred_messages = [];
		User.findOne({'username':req.user.username}, function(err, user){
			starred_messages = user.starred;
			res.render('messages', { messages, starred_messages });
		});
	});
}]);

// Chat Room 
router.get('/chat/:id', [User.isAuthenticated, function(req, res, next) {
	var roomId = req.params.id;
	Room.findById(roomId, function(err, room){
		if(err) throw err;
		if(!room){
			return next(); 
		}
		res.render('chatroom', { user: req.user, room: room });
	});
	
}]);
// Chat Room 
router.get('/star/:id', [User.isAuthenticated, function(req, res, next) {
	var messageId = req.params.id;
	User.findOne({'username':req.user.username}, function(err, user){
		var added = user.starred.addToSet(messageId);		
		user.save();
	});

	res.send({"success": true});	
}]);
router.post('/msg/:id', [User.isAuthenticated, function(req, res, next) {
	var messageId = req.params.id;
	var newMessage = req.body.msg;
	Message.findById(messageId, function(err, message){
		if(message.username == req.user.username){

			message.content = newMessage;		
			message.save();
			res.send({"owner": true});
		}else{
			res.send({"owner": false});
		}
	});
	
}]);
// Logout
router.get('/logout', function(req, res, next) {
	// remove the req.user property and clear the login session
	req.logout();

	// destroy session data
	req.session = null;

	// redirect to homepage
	res.redirect('/');
});

module.exports = router;