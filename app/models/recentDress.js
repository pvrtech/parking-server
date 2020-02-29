// load the things we need
var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

// define the schema for our Recent Dress model
var recentDressSchema = mongoose.Schema({
    userid       : String,
    dressid      : String,
    event        : Array,
    comboid      : String,
    lastweardate : Date
});

// create the model for users and expose it to our app
module.exports = mongoose.model('RecentDress', recentDressSchema);
