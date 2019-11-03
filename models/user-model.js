var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
    email: {type: String, required: true},
    password:{type:String,require:true},
    displayname: {type: String, required: true},
    dob:{type: Date, required: true},
    gender: {type:String, required:true}
});

// Export model.
module.exports = mongoose.model('User', UserSchema);