var User = require('../models/userModel.js');

var controller = {};

controller.updateLevel = function( request, response ) {
  User.findOneAndUpdate(
    {"username": request.body.username},
    {$set: {"level": request.body.level}},
    {new:true},
    function(error, user){
      if (error){
        throw error;
      } else {
        response.status( 200 ).send( user );
      }
    });
};

// A custom middleware for Passport
controller.findUserById = function( request, response, next ) {
  var id;
  if (request.session.passport) {
    if( request.session.passport.user ) {
      console.log( 'USER IS: ', request.session.passport.user );
    }
    id = request.session.passport.user;
  }

  User.findOne({"_id": id}, "username level", function(error, user){
      if (error) {
        throw error;
      } else if (!user) {
        next();
      } else {
        response.set({
          username: user.username,
          level: user.level
        });
        next();
      }
    });
};

controller.getUsers = function ( request, response, next ) {
  User.find({}, function (error, users){
    if( error ) {
      response.status( 404 ).send( );
    } else {
      response.status( 200 ).send( users );
    }
  });
};

module.exports = controller;
