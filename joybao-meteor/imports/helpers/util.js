/**
 * 参见：http://mp.weixin.qq.com/wiki/index.php?title=返回码说明
 */
exports.wrapper = function wrapper(callback) {
    return (error, data, res) => {
        let err = error;
        const cb = callback || (() => {});

        if (err) {
            err.name = `WeChatAPI${err.name}`;
            return cb(err, data, res);
        }

        if (data.errcode) {
            err = new Error(data.errmsg);
            err.name = "WeChatAPIError";
            err.code = data.errcode;
            return cb(err, data, res);
        }

        return cb(null, data, res);
    };
};

/*!
 * 对提交参数一层封装，当POST JSON，并且结果也为JSON时使用
 */
exports.postJSON = function postJSON(data) {
    return {
        dataType: "json",
        type: "POST",
        data,
        headers: {
            "Content-Type": "application/json"
        }
    };
};

exports.make = function make(hostOrign, name, fn, ...args) {
    const host = hostOrign;
    host[name] = function pre() {
        this.preRequest(this[`_${name}`], args);
    };
    host[`_${name}`] = fn;
};

exports.isNullOrWhitespace = function isNullOrWhitespace(input) {
    if (typeof input === "undefined" || input === null) {
        return true;
    }

    return input.replace(/\s/g, "").length < 1;
};
