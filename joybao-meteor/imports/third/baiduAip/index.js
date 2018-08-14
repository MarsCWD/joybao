var urllib = require('urllib');

var _request = require('request');

const OPENAPI_TOKEN_URL = 'https://aip.baidubce.com/oauth/2.0/token';

const OPENAPI_GRANTTYPE_CLIENT = 'client_credentials';

const REQUEST_TOKEN_METHOD = 'post';

const PATH_OCR_IDCARD = 'https://aip.baidubce.com/rest/2.0/ocr/v1/idcard';
var wrapper = function(callback) {
    return function(err, res, body) {
        callback = callback || function() {};

        if (body) {
            body = JSON.parse(body);
        }
        return callback(err, body);
    };
}

var AccessToken = function(accessToken, expireTime) {
    if (!(this instanceof AccessToken)) {
        return new AccessToken(accessToken, expireTime);
    }
    this.accessToken = accessToken;
    this.expireTime = expireTime;
};
// 判断是否过期
AccessToken.prototype.isValid = function() {
    return !!this.accessToken && (new Date().getTime()) < this.expireTime;
};

var AipOcr = function(APP_ID, API_KEY, SECRET_KEY, getToken, saveToken) {
    this.APP_ID = APP_ID;
    this.API_KEY = API_KEY;
    this.SECRET_KEY = SECRET_KEY;
    this.getToken = getToken || function(callback) {
        callback(null, this.store);
    };
    this.saveToken = saveToken || function(token, callback) {
        this.store = token;
        callback(null);
    };

    AipOcr.prototype.idcard = function(image, isFront, callback) {
        this.preRequest(this._idcard, arguments);
    };

    AipOcr.prototype._idcard = function(image, isFront, callback) {
        var url = PATH_OCR_IDCARD+'?access_token=' + this.token.accessToken;
        this.request(url, {
            image: image,
            id_card_side: isFront ? "front" : "back",
            detect_direction:true
        }, callback);
    };
};

//
AipOcr.prototype.request = function(url, opts, callback) {
    var options = {};
    if (typeof opts === 'function') {
        callback = opts;
        opts = {};
    }
    for (var key in opts) {
        if (key !== 'headers') {
            options[key] = opts[key];
        } else if (opts.headers) {
            options.headers = options.headers || {};
            _.extend(options.headers, opts.headers);
        }
    }

    _request.post(url, {
        form: options
    }, wrapper(callback));
    // urllib.request(url, options, callback);
};

AipOcr.prototype.getAccessToken = function(callback) {
    var that = this;
    var url = OPENAPI_TOKEN_URL;
    this.request(url, {
        grant_type: OPENAPI_GRANTTYPE_CLIENT,
        client_id: this.API_KEY,
        client_secret: this.SECRET_KEY
    }, function(err, data) {
        if (err) {
            return callback(err);
        }
        // 过期时间，因网络延迟等，将实际过期时间提前10小时，以防止临界点
        var expireTime = (new Date().getTime()) + (data.expires_in - 10 * 60 * 60) * 1000;
        var token = AccessToken(data.access_token, expireTime);
        that.saveToken(token, function(err) {
            if (err) {
                return callback(err);
            }
            callback(err, token);
        });
    });
    return this;
};


AipOcr.prototype.preRequest = function(method, args, retryed) {
    var that = this;
    var callback = args[args.length - 1];
    // 调用用户传入的获取token的异步方法，获得token之后使用（并缓存它）。
    that.getToken(function(err, token) {
        if (err) {
            return callback(err);
        }
        var accessToken;
        // 有token并且token有效直接调用
        if (token && (accessToken = AccessToken(token.accessToken, token.expireTime)).isValid()) {
            // 暂时保存token
            that.token = accessToken;
            if (!retryed) {
                var retryHandle = function(err, data, res) {
                    // 40001 重试
                    if (data && data.error_code && (data.error_code === 100 || data.error_code === 110 || data.error_code === 111)) {
                        return that.preRequest(method, args, true);
                    }
                    callback(err, data, res);
                };
                // 替换callback
                var newargs = Array.prototype.slice.call(args, 0, -1);
                newargs.push(retryHandle);
                method.apply(that, newargs);
            } else {
                method.apply(that, args);
            }
        } else {
            // 使用appid/appsecret获取token
            that.getAccessToken(function(err, token) {
                // 如遇错误，通过回调函数传出
                if (err) {
                    return callback(err);
                }
                // 暂时保存token
                that.token = token;
                method.apply(that, args);
            });
        }
    });
}

module.exports = AipOcr;
