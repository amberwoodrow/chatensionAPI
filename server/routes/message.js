var dotenv = require('dotenv');
dotenv.load();

var express = require('express');
var router = express.Router();
var Room = require('../models/room.js');
var Message = require('../models/message.js');
var Pusher = require('pusher');
var path = require('path');

// When you create a new Pusher object you are automatically connected to Pusher.
// can have auth property as well
var pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_KEY,
  secret: process.env.PUSHER_SECRET_SAUCE,
  encrypted: true
});

// Config
pusher.port = 443;

router.get('/', function(req, res, next) {
  var currentUrl = req.query.currentUrl;
  currentUrl = currentUrl.toString();
  res.render("index", {currentUrl: currentUrl});
});
  // gets zee code to put in iframe


// GET room, if room doesn't exist it creates one
router.get('/api/room', function(req, res, next) {

  Room.findOne({"url": req.query.currentUrl})
  .populate('_messages')
  .exec(function(err, data){
    if(err){
      res.json({'message': err});
    } else {
      if (data === null) {
        // create room
        newRoom = new Room({
          url: req.query.currentUrl,
        });
        newRoom.save(function(err, data){
          if(err){
            res.status(401).json({"Error": err+", Could not create new room"});
          } else {
            // better handle success in extension, tell user they created a room
            console.log("Success: New room created");
            res.json(data);
          }
        });
      } else {
        // found room, returns messages
        res.json(data);
      }
    }
  });
});

// Post to messages
router.post('/api/message', function(req, res, next) {

  pusher.trigger(req.body.url, 'messageRecieved', {
    messageContent: req.body.text,
    name: req.body.name,
    timeStamp: req.body.timeStamp
  });

  Room.findOne({"url": req.body.url})
  .exec(function(err, room) {
    console.log(room)
    var newMessage = new Message({
      _room: room,
      messageContent: req.body.text,
      name: req.body.name,
      timeStamp: req.body.timeStamp
    });
    console.log(room)

    room._messages.push(newMessage);

    room.save(function(err, data){
      if(err){ res.json({'message':err}); }

      newMessage.save(function(err, data){
        if(err){ res.json({'message':err}); }
      });
    });
  });
});

module.exports = router;
