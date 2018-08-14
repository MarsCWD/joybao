/**
 * Created by Yifeng.Shen on 2017/6/30.
 */
import md5 from "md5";
import request from "request";
import xml2js from "xml2js";

/**
 * 发放红包
 * @param  {[type]} optins [description]
 * @return {[type]}        [description]
 */
exports.grantRed = function (context, param, cb) {
    const that = context;
    param.wxappid = that.appid;
    param.mch_id = that.WeChat.WePay.mch_id;
    param.nonce_str = that.randomString();
    param.send_name = that.WeChat.Red.send_name; // 商户名称
    param.total_amount = that.parseAmount(that.WeChat.Red.total_amount); // 金额
    param.total_num = that.WeChat.Red.total_num; // 人数
    param.wishing = that.WeChat.Red.wishing; // 祝福语
    param.act_name = that.WeChat.Red.act_name; // 活动名称
    param.remark = that.WeChat.Red.remark; // 备注
    param.sign = that.generateSignature(param);
    // this.request(config.WECHAT.PAYAPI,param,cb);
    request({
        url: that.WeChat.Red.redUrl,
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
/**
 * 生成红包金额
 * @param amount (1,2,3);(1-2);(1-2,5-6)(单位分)
 */
exports.parseAmount = function (amount) {
    try {
        const options = amount.split(",");
        const option = options[this.random(0, options.length - 1 - 1)];
        const range = option.split("-");
        if (range.length > 1) {
            return this.random(range[0], range[1]);
        }
        else {
            return range;
        }
    }
    catch (err){
        throw new Error(err);
    }
}

exports.random = function(l,r){
    let random = Math.round(Math.random() * (r - l + 1),0);
    console.log(random);
    return  random;
}
