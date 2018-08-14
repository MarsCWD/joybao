const oauthServer = require('oauth2-server')
const config = require('../../config')

module.exports = new oauthServer({ model: require('./model'), grants: ['client_credentials'] })
