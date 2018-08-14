const config = require('./../../../config')
const mongoose = require('mongoose')

console.log(config.mongo.uri)
mongoose.connect(config.mongo.uri, err => {
    if (err) return console.log(err)
    console.log('Mongoose Connected')
})

const db = {}

db.User = require('./User')
db.OAuthScope = require('./OAuthScope')
db.OAuthClient = require('./OAuthClient')
db.OAuthAccessToken = require('./OAuthAccessToken')
db.OAuthRefreshToken = require('./OAuthRefreshToken')
db.OAuthAuthorizationCode = require('./OAuthAuthorizationCode')

module.exports = db;
