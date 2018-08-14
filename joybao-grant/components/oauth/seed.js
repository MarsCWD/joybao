const config = require('./../../config')
const db = require('./db')

const User = db.User
const OAuthScope = db.OAuthScope
const OAuthClient = db.OAuthClient
const OAuthAccessToken = db.OAuthAccessToken
const OAuthRefreshToken = db.OAuthRefreshToken
const OAuthAuthorizationCode = db.OAuthAuthorizationCode

// 初始化权限域
OAuthScope.find({}).remove()
    .then(() => OAuthScope.create({
        scope: 'profile',
        is_default: false
    }, {
        scope: 'defaultscope',
        is_default: true
    }, {
        scope: 'logistics',
        is_default: false
    }))
    .then(() => console.log('finished populating OAuthScope'))

// 初始化部分用户
User.find({}).remove()
    .then(() => User.create({
        appID: 'userKK899P',
        appSecret: '7MW11AMU4R31YHBPHGT7KC7NBCZSJOAVCXHC',
        name: '测试'
    }))
    .then(user => {
        console.log('finished populating users', user)
        return OAuthClient.find({}).remove()
            .then(() => {
                return OAuthClient.create({
                    client_id: 'joybaoU77K2O',
                    client_secret: '5FL8CPF2CNEO0O6ATPW5NUIUAW6G9KPYOOTM',
                    redirect_uri: 'http://localhost/cb',
                    User: user._id,
                    scope: 'logistics',
                })
            })
            .then(client => {
                console.log('finished populating OAuthClient', client)
            })
            .catch(console.error)
    })
