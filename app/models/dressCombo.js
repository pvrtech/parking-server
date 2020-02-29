// load the things we need
var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

// define the schema for our Combo Dress model
var comboDressSchema = mongoose.Schema({
    type         : Array,
    userid       : String,
    dressids     : Array,
    events       : Array
});

// create the model for users and expose it to our app
module.exports = mongoose.model('ComboDress', comboDressSchema);
