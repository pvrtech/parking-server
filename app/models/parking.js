// load the things we need
var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

// define the schema for our dress model
var parkingSchema = mongoose.Schema({
    name         : String,
    type         : Array,
    userid       : String,
    image        : Object,
    location     : Array
});

// create the model for dresss and expose it to our app
module.exports = mongoose.model('Parking', parkingSchema);
