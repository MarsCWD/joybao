/*!
 * 微信api基础类：
 * 1. 提供微信签名Token的认证
 * 2. 提供微信AccessToken的发布(定期刷新)和订阅
 */
import urllib from "urllib";
import util from "../../helpers/util";
import ServerConfigDao from "../../api/config/dao";

const WeChat = ServerConfigDao.findOne("WeChat")
    .value;
const wrapper = util.wrapper;

class AccessToken {
    constructor(accessToken, expireTime) {
        if (!(this instanceof AccessToken)) {
            return new AccessToken(accessToken, expireTime);
        }
        this.accessToken = accessToken;
        this.expireTime = expireTime;
    }

    isValid() {
        return !!this.accessToken && (new Date()
                .getTime()) < this.expireTime;
    }
}

// function AccessToken(accessToken, expireTime) {
//     if (!(this instanceof AccessToken)) {
//         return new AccessToken(accessToken, expireTime);
//     }
//     this.accessToken = accessToken;
//     this.expireTime = expireTime;
// };

// 判断是否过期
// AccessToken.prototype.isValid = function() {
//     return !!this.accessToken && (new Date().getTime()) < this.expireTime;
// };

class API {

    constructor(appid, appsecret, getToken, saveToken) {
        this.appid = appid;
        this.appsecret = appsecret;
        this.getToken = getToken || function getTokenDefault(callback) {
                callback(null, this.store);
            };
        this.saveToken = saveToken || function saveTokenDefault(token, callback) {
                this.store = token;
                callback(null);
            };
        this.WeChat = WeChat;

        this.defaults = {};
    }

    // 设置API类库的相关配置
    // e.g. oauth.setOpts({timeout: 15000});
    setOpts(opts) {
        this.defaults = opts;
    }

    // 处理微信请求公共类
    static request(url, optsOrign, callback) {
        let cb = callback,
            opts = optsOrign;
        const options = {};
        if (typeof optsOrign === "function") {
            cb = optsOrign;
            opts = {};
        }

        const keys = Object.keys(opts);
        for (let i = 0, len = keys.length; i < len; i += 1) {
            const key = keys[i];
            if (key !== "headers") {
                options[key] = opts[key];
            } else if (opts.headers) {
                options.headers = options.headers || {};
                _.extend(options.headers, opts.headers);
            }
        }

        urllib.request(url, options, cb);
    }

    /*!
     * 根据创建API时传入的appid和appsecret获取access token
     * 进行后续所有API调用时，需要先获取access token
     * @param {Function} callback 回调函数
     */
    getAccessToken(callback) {
        const that = this;
        const url = `${WeChat.OpenAPI.apiURL}token?grant_type=client_credential&appid=${this.appid}&secret=${this.appsecret}`;
        API.request(url, { dataType: "json" }, wrapper((err, data) => {
                if (err) {
                    return callback(err);
                }
                // 过期时间，因网络延迟等，将实际过期时间提前10秒，以防止临界点
                const expireTime = (new Date()
                        .getTime()) + ((data.expires_in - 10) * 1000);
        const token = AccessToken(data.access_token, expireTime);
        return that.saveToken(token, error => {
                if (error) {
                    return callback(error);
                }
                return callback(error, token);
    });
    }));
        return this;
    }

    /**
     * 根据用户传来的JSCode获取SessionKey 和 openid
     * @param  {[type]}   jsCode [description]
     * @param  {Function} cb     [description]
     * @return {[type]}          [description]
     */
    getSessionKey(jsCode, options, cb) {
        API.request(
            `${WeChat.OpenAPI.appletUrl}jscode2session?appid=${this.appid}&secret=${this.appsecret}&js_code=${jsCode}&grant_type=authorization_code`,
            options, cb
        );
    }

    /*!
     * 需要access token的接口调用如果采用preRequest进行封装后，就可以直接调用。
     * 无需依赖getAccessToken为前置调用。
     * @param {Function} method 需要封装的方法
     * @param {Array} args 方法需要的参数
     */
    preRequest(method, args, retryed) {
        const that = this;
        const callback = args[args.length - 1];
        // 调用用户传入的获取token的异步方法，获得token之后使用（并缓存它）。
        that.getToken((err, token) => {
            if (err) {
                return callback(err);
            }
            let accessToken;
        const isValid = (accessToken = AccessToken(token.accessToken, token.expireTime))
            .isValid();
        // 有token并且token有效直接调用
        if (token && isValid) {
            // 暂时保存token
            that.token = accessToken;
            if (!retryed) {
                const retryHandle = (error, data, res) => {
                    // 40001 重试
                    if (data && data.errcode && data.errcode === 40001) {
                        return that.preRequest(method, args, true);
                    }
                    return callback(error, data, res);
                };
                // 替换callback
                const newargs = Array.prototype.slice.call(args, 0, -1);
                newargs.push(retryHandle);
                return method.apply(that, newargs);
            }
            return method.apply(that, args);
        }

        // 使用appid/appsecret获取token
        return that.getAccessToken((error, tokenRes) => {
            // 如遇错误，通过回调函数传出
            if (error) {
                return callback(error);
            }
            // 暂时保存token
            that.token = tokenRes;
        return method.apply(that, args);
    });
    });
    }

    getLatestToken(callback) {
        const that = this;
        // 调用用户传入的获取token的异步方法，获得token之后使用（并缓存它）。
        that.getToken((err, token) => {
            if (err) {
                return callback(err);
            }
            let accessToken;
        const isValid = (accessToken = AccessToken(token.accessToken, token.expireTime))
            .isValid();
        // 有token并且token有效直接调用
        if (token && isValid) {
            return callback(null, accessToken);
        }

        // 使用appid/appsecret获取token
        return that.getAccessToken(callback);
    });
    }

    static mixin(obj) {
        const keys = obj.keys();
        for (let i = 0, len = keys.length; i < len; i += 1) {
            const key = keys[i];
            if (Object.prototype.hasOwnProperty.call(API, key)) {
                throw new Error(`Don't allow override existed prototype method. method: ${key}`);
            }
            API.prototype[key] = obj[key];
        }
    }


}

//
// // var API = function(appid, appsecret, getToken, saveToken) {
// //     this.appid = appid;
// //     this.appsecret = appsecret;
// //     this.getToken = getToken || function(callback) {
// //         callback(null, this.store);
// //     };
// //     this.saveToken = saveToken || function(token, callback) {
// //         this.store = token;
// //         callback(null);
// //     };
// //
// //     this.defaults = {};
// // };
//
// // 设置API类库的相关配置
// // e.g. oauth.setOpts({timeout: 15000});
// API.prototype.setOpts = function(opts) {
//     this.defaults = opts;
// };
//
// // 处理微信请求公共类
// API.prototype.request = function(url, opts, callback) {
//     var options = {};
//     _.extend(options, this.defaults);
//     if (typeof opts === 'function') {
//         callback = opts;
//         opts = {};
//     }
//     for (var key in opts) {
//         if (key !== 'headers') {
//             options[key] = opts[key];
//         } else if (opts.headers) {
//             options.headers = options.headers || {};
//             _.extend(options.headers, opts.headers);
//         }
//     }
//     urllib.request(url, options, callback);
// };
//
// /*!
//  * 根据创建API时传入的appid和appsecret获取access token
//  * 进行后续所有API调用时，需要先获取access token
//  * @param {Function} callback 回调函数
//  */
// API.prototype.getAccessToken = function(callback) {
//     var that = this;
//     var url = config.OpenAPI.apiURL + 'token?grant_type=client_credential&appid=' + this.appid + '&secret=' + this.appsecret;
//     this.request(url, { dataType: 'json' }, wrapper(function(err, data) {
//         if (err) {
//             return callback(err);
//         }
//         // 过期时间，因网络延迟等，将实际过期时间提前10秒，以防止临界点
//         var expireTime = (new Date().getTime()) + (data.expires_in - 10) * 1000;
//         var token = AccessToken(data.access_token, expireTime);
//         that.saveToken(token, function(err) {
//             if (err) {
//                 return callback(err);
//             }
//             callback(err, token);
//         });
//     }));
//     return this;
// };
//
// /*!
//  * 需要access token的接口调用如果采用preRequest进行封装后，就可以直接调用。
//  * 无需依赖getAccessToken为前置调用。
//  * @param {Function} method 需要封装的方法
//  * @param {Array} args 方法需要的参数
//  */
// API.prototype.preRequest = function(method, args, retryed) {
//     var that = this;
//     var callback = args[args.length - 1];
//     // 调用用户传入的获取token的异步方法，获得token之后使用（并缓存它）。
//     that.getToken(function(err, token) {
//         if (err) {
//             return callback(err);
//         }
//         var accessToken;
//         // 有token并且token有效直接调用
//         if (token && (accessToken = AccessToken(token.accessToken, token.expireTime)).isValid()) {
//             // 暂时保存token
//             that.token = accessToken;
//             if (!retryed) {
//                 var retryHandle = function(err, data, res) {
//                     // 40001 重试
//                     if (data && data.errcode && data.errcode === 40001) {
//                         return that.preRequest(method, args, true);
//                     }
//                     callback(err, data, res);
//                 };
//                 // 替换callback
//                 var newargs = Array.prototype.slice.call(args, 0, -1);
//                 newargs.push(retryHandle);
//                 method.apply(that, newargs);
//             } else {
//                 method.apply(that, args);
//             }
//         } else {
//             // 使用appid/appsecret获取token
//             that.getAccessToken(function(err, token) {
//                 // 如遇错误，通过回调函数传出
//                 if (err) {
//                     return callback(err);
//                 }
//                 // 暂时保存token
//                 that.token = token;
//                 method.apply(that, args);
//             });
//         }
//     });
// };
//
// /**
//  * 获取最新的token
//  * @param {Function} method 需要封装的方法
//  * @param {Array} args 方法需要的参数
//  */
// API.prototype.getLatestToken = function(callback) {
//     var that = this;
//     // 调用用户传入的获取token的异步方法，获得token之后使用（并缓存它）。
//     that.getToken(function(err, token) {
//         if (err) {
//             return callback(err);
//         }
//         var accessToken;
//         // 有token并且token有效直接调用
//         if (token && (accessToken = AccessToken(token.accessToken, token.expireTime)).isValid()) {
//             callback(null, accessToken);
//         } else {
//             // 使用appid/appsecret获取token
//             that.getAccessToken(callback);
//         }
//     });
// };
//
//
/**
 * 用于支持对象合并。将对象合并到API.prototype上，使得能够支持扩展
 * @param {Object} obj 要合并的对象
 */
API.mixin = function(obj) {
    for (var key in obj) {
        if (API.prototype.hasOwnProperty(key)) {
            throw new Error('Don\'t allow override existed prototype method. method: ' + key);
        }
        API.prototype[key] = obj[key];
    }
};

API.AccessToken = AccessToken;

module.exports = API;
