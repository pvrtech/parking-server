// load the things we need
var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

// define the schema for our parking model
var parkingSchema = mongoose.Schema({
    name: String,
    type: String,
    userid: String,
    images: Array,
    facilities: Array,
    location: {
        latitude: Number,
        longitude: Number
    }
});

// create the model for parkings and expose it to our app
module.exports = mongoose.model('Parking', parkingSchema);
