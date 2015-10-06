var mongoose = require('mongoose');

var UserSchema = new mongoose.Schema({
  username: String,
  password: String,
  points: Number,
  wins: Number,
  losses: Number
});

module.exports = mongoose.model('User', UserSchema);
