import Logger from "../../imports/helpers/Logger";
import ServerConfigDao from "../../imports/api/config/dao";

const ALiDaYu = ServerConfigDao.findOne("ALiDaYu").value;
const TopClient = require("../../imports/third/alidayu/topClient").TopClient;

const client = new TopClient({
    appkey: ALiDaYu.AppKey,
    appsecret: ALiDaYu.AppSecret,
    REST_URL: "http://gw.api.taobao.com/router/rest"
});

class AliYunSMSHelper {

    /**
     * 发送短信
     * @param  {[type]}   params       [短信参数]
     * @param  {[type]}   phone        [接收号码]
     * @param  {[type]}   templateCode [模版编号]
     * @return {[type]}                [description]
     */
    static sendSMS(params, phone, templateCode) {
        // return new Promise((resolve, reject) => {
        //     console.log(params, phone, templateCode);
        //     resolve();
        // });

        return new Promise((resolve, reject) => {
            client.execute("alibaba.aliqin.fc.sms.num.send", {
                extend: "56", // 公共回传参数
                sms_type: "normal", // 短信类型
                sms_free_sign_name: "白鲸宝", // 短信签名
                sms_param: params, // 短信模板变量
                rec_num: phone, // 短信接收号码
                sms_template_code: templateCode // 短信模板ID
            }, err => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }
}

Logger.debug("AliYunSMSHelper 执行一次");
// AliYunSMSHelper.sendSMS();

export { AliYunSMSHelper, ALiDaYu };
