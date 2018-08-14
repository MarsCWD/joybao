const mongoose = require('mongoose'),
    Schema = mongoose.Schema

const UserSchema = new Schema({
    name: String,
    appID: { type: String, unique: true },
    appSecret: String,
    scope: String
})

module.exports = mongoose.model('User', UserSchema)
