// load the things we need
var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

// define the schema for our Car Details model
var carDetailsSchema = mongoose.Schema({
    cartype: String,
    userid: String
});

// create the model for users and expose it to our app
module.exports = mongoose.model('CarDetails', carDetailsSchema);
