import md5 from "md5";
import request from "request";
import xml2js from "xml2js";
/**
 * 生成随机字符串
 * @param  {[type]} len [description]
 * @return {[type]}     [description]
 */
exports.randomString = function(len, type = "string") {
    len = len || 32;
    var $chars = "";
    if (type != "string") {
        $chars = "1234567890";
    } else {
        $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678'; /****默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1****/
    }　　
    var maxPos = $chars.length;　　
    var pwd = '';　　
    for (i = 0; i < len; i++) {　　　　
        pwd += $chars.charAt(Math.floor(Math.random() * maxPos));　　
    }　　
    return pwd;
}

/**
 * 生成签名
 * @param  {[type]} optins [description]
 * @return {[type]}        [description]
 */
exports.generateSignature = function (param) {
    var querystring = Object.keys(param)
        .filter(function (key) {
            return param[key] !== undefined && param[key] !== '';
        })
        .sort()
        .map(function (key) {
            return key + '=' + param[key];
        })
        .join("&");
    querystring += "&key=" + this.WeChat.WePay.mch_key;
    return md5(querystring)
        .toUpperCase();
}


/**
 * 下单统一接口
 * @param  {[type]} optins [description]
 * @return {[type]}        [description]
 */
exports.unifiedorder = function (context, param, cb) {
    const that = context;
    param.notify_url = that.WeChat.WePay.callback;
    param.appid = that.appid;
    param.mch_id = that.WeChat.WePay.mch_id;
    param.nonce_str = that.randomString();
    param.sign = that.generateSignature(param);
    // this.request(config.WECHAT.PAYAPI,param,cb);
    request({
        url: that.WeChat.WePay.payUrl,
        method: 'POST',
        body: that.buildXML(param),
        agentOptions: {
            // pfx: this.options.pfx,
            // passphrase:   this.options.mch_id
        }
    }, function (err, response, body) {
        that.parseXML(body, cb);
    });
}


exports.buildXML = function (json) {
    const builder = new xml2js.Builder();
    return builder.buildObject(json);
};

exports.parseXML = function (xml, fn) {
    let parser = new xml2js.Parser({ trim: true, explicitArray: false, explicitRoot: false });
    parser.parseString(xml, fn || function (err, result) {});
};
