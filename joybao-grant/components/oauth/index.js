const oauthServer = require('oauth2-server')
const Request = oauthServer.Request
const Response = oauthServer.Response

const config = require('../../config')
const db = require('./db')
const oauth = require('./oauth')

module.exports = app => {
    app.all('/oauth/token', (req, res, next) => {
        const request = new Request(req)
        const response = new Response(res)

        oauth
            .token(request, response)
            .then(token => {
                // const data = {
                //     accessToken: token.accessToken,
                //     accessTokenExpiresAt: token.accessTokenExpiresAt,
                // }
                res.json(token)
            })
            .catch(err => res.status(err.code || 500).json(err))
    })

    app.post('/authorise', (req, res) => {
        const request = new Request(req)
        const response = new Response(res)

        return oauth
            .authorize(request, response)
            .then(data => res.json(data))
            .catch(err => res.status(err.code || 500).json(err))
    })

    app.get('/authorise', (req, res) => {
        return db.OAuthClient.findOne({
            where: {
                client_id: req.query.client_id,
                redirect_uri: req.query.redirect_uri,
            },
            attributes: ['id', 'name'],
        })
    })
}
