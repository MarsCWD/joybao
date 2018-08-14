const _ = require('lodash')
const db = require('./db')

const User = db.User
const OAuthScope = db.OAuthScope
const OAuthClient = db.OAuthClient
const OAuthAccessToken = db.OAuthAccessToken
const OAuthRefreshToken = db.OAuthRefreshToken
const OAuthAuthorizationCode = db.OAuthAuthorizationCode

// 获取身份令牌
function getAccessToken(bearerToken) {
    console.log("getAccessToken", bearerToken)
    return OAuthAccessToken
        .findOne({ access_token: bearerToken })
        .populate('User')
        .populate('OAuthClient')
        .then(accessToken => {
            console.log('at', accessToken)
            if (!accessToken) return false

            const token = accessToken
            token.user = token.User
            token.client = token.OAuthClient
            token.scope = token.scope

            return token
        })
        .catch(err => console.error("getAccessToken: ", err))
}

// 获取客户端
function getClient(clientId, clientSecret) {
    console.log("getClient", clientId, clientSecret)
    const query = { client_id: clientId }
    if (clientSecret) query.client_secret = clientSecret

    return OAuthClient
        .findOne(query)
        .then(client => {
            if (!client) return new Error("client not found")
            const clientWithGrants = client
            // clientWithGrants.grants = ['authorization_code', 'password', 'refresh_token', 'client_credentials']
            clientWithGrants.grants = ['client_credentials']
            clientWithGrants.redirectUris = [clientWithGrants.redirect_uri]
            delete clientWithGrants.redirect_uri

            return clientWithGrants
        })
        .catch(err => console.error("getClient: ", err))
}

// 存储Token
function saveToken(token, client, user) {
    console.log("saveToken", token, client, user)
    return OAuthAccessToken
        .create({
            access_token: token.accessToken,
            expires: token.accessTokenExpiresAt,
            OAuthClient: client._id,
            User: user._id,
            scope: token.scope
        })
        .then(resultArray => {
            return _.assign( // expected to return client and user, but not returning
                {
                    client: client,
                    user: user,
                    access_token: token.accessToken, // proxy
                    refresh_token: token.refreshToken, // proxy
                },
                token
            )
        })
        .catch(err => console.error("saveToken: ", err))
}

// 根据账户密码获取用户
function getUser(appID, appSecret) {
    console.log("getUser", appID, appSecret)
    return User
        .findOne({ appID })
        .then(user => (user && user.appSecret === appSecret) ? user : false)
        .catch(err => console.error("getUser: ", err))
}

// 根据客户端获取用户
function getUserFromClient(client) {
    console.log("getUserFromClient", client)
    const query = { client_id: client.client_id }
    if (client.client_secret) query.client_secret = client.client_secret

    return OAuthClient
        .findOne(query)
        .populate('User')
        .then(client => {
            console.log(client)
            if (!client) return false
            if (!client.User) return false
            return client.User
        })
        .catch(err => console.error("getUserFromClient: ", err))
}

// 根据授权码获取响应信息
function getAuthorizationCode(code) {
    console.log("getAuthorizationCode", code)
    return OAuthAuthorizationCode
        .findOne({ authorization_code: code })
        .populate('User')
        .populate('OAuthClient')
        .then(authCodeModel => {
            if (!authCodeModel) return false
            const client = authCodeModel.OAuthClient
            const user = authCodeModel.User
            return {
                code,
                client,
                user,
                expiresAt: authCodeModel.expires,
                redirectUri: client.redirect_uri,
                scope: authCodeModel.scope,
            }
        })
        .catch(err => console.error("getAuthorizationCode: ", err))
}

// 存储授权码
function saveAuthorizationCode(code, client, user) {
    console.log("saveAuthorizationCode", code, client, user)
    return OAuthAuthorizationCode
        .create({
            expires: code.expiresAt,
            OAuthClient: client._id,
            authorization_code: code.authorizationCode,
            User: user._id,
            scope: code.scope
        })
        .then(() => {
            code.code = code.authorizationCode
            return code
        })
        .catch(err => console.error("saveAuthorizationCode: ", err))
}

// 撤销授权码
function revokeAuthorizationCode(code) {
    console.log("revokeAuthorizationCode", code)
    return OAuthAuthorizationCode
        .findOne({ authorization_code: code.code })
        .then(rCode => {
            const expiredCode = code
            expiredCode.expiresAt = new Date('2015-05-28T06:59:53.000Z')
            return expiredCode
        })
        .catch(err => console.error("revokeAuthorizationCode: ", err))
}

// 校验权限域
function validateScope(token, client, scope) {
    console.log("validateScope", token, client, scope)
    return (user.scope === client.scope) ? scope : false
}

// 认证权限
function verifyScope(token, scope) {
    console.log("verifyScope", token, scope)
    return token.scope === scope
}

module.exports = {
    saveToken,
    getAccessToken,

    getClient,
    getUser,
    getUserFromClient,

    getAuthorizationCode,
    saveAuthorizationCode,
    revokeAuthorizationCode,

    // validateScope,
    verifyScope
}
