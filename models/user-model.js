var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
    email: {type: String, required: true},
    password:{type:String,require:true},
    displayname: {type: String, required: true},
    avata:{type: String},
    googleId:{type: String},
    facebookId:{type:String},
});

// Export model.
module.exports = mongoose.model('User', UserSchema);