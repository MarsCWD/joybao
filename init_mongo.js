/** Mongo script For Init the ServerConfig **/

const
    Basic = {
        name: "Basic",
        value: {
            personSignatureNumber: 8, // 个人签署次数
            companySignatureNumber: 8, // 公司签署次数
        },
        source: "basic",
    },
    WeChatObj = {
        name: "WeChat",
        value: {
            // appID: "wx0755e74dfbf22cbe",
            // appSecret: "24aed9f9fbaf08d5401fb1eadb0505c7",

            appID: "wx24abc2f5897a20f3",
            // appID: "wx656682f05be691b6",
            appSecret: "39d086b4cb80c8f172c17ba395a71c06",
            // appSecret: "b8f34880b3c7e51af08cd00e0d86322d",
            OpenAPI: {
                appletUrl: "https://api.weixin.qq.com/sns/"
            },
            WePay: {
                payUrl: "https://api.mch.weixin.qq.com/pay/unifiedorder",
                mch_id: "1482303712",
                mch_key: "HqFiA1i2xG7etyHjQnrXLpx9MiyGu8eE",
                callback: "https://lucky.0575s.com/order.callback",
                expire_time: 60 * 5
            },
            Red: {
                redUrl: "https://api.mch.weixin.qq.com/mmpaymkttransfers/sendredpack",
                mch_id: "1482303712",
                mch_key: "HqFiA1i2xG7etyHjQnrXLpx9MiyGu8eE",
                send_name: "白鲸宝",
                total_amount: "1",
                total_num: "1",
                wishing: "感谢您对白鲸宝的支持",
                act_name: "实名认证返红包",
                remark: "我是备注"
            }
        },

        source: "wechat",
    },
    TokenObj = {
        name: "Token",
        value: {
            expiratime: 30 * 60 * 1000,
        },
        source: "server"
    },
    ALiYun = {
        name: "ALiYun",
        value: {
            AccessKeyId: "LTAIrmSbEBS2rSMV",
            AccessKeySecret: "RWh7WFfMwk5CMIlUwqxvx5jvcVEgHs",
            expiratime: 30 * 60 * 1000,
            maxSize: 10 * 1024 * 1024,
            bucket: "joybao",
        },
        source: "ALiYun"
    },
    ALiDaYu = {
        name: "ALiDaYu",
        value: {
            AppKey: "23765274",
            AppSecret: "4708280983398a8567b9475e1fe2ac25",
            SMSType: {
                SIGN_CODE: {
                    name: "签署验证码",
                    value: "SMS_68155204",
                },
                PHONE_CODE: {
                    name: "手机认证码",
                    value: "SMS_69060090",
                },
                RESET_SIGN_PASSWORD_CODE: {
                    name: "重置签署密码",
                    value: "SMS_75830180",
                },
            },
        },
        source: "ALiDaYu"
    },
    Bill = {
        name: "Bill",
        value: {
            sort: ["面料交易"]
        },
        source: "Config",
    },
    Grant = {
        name: "Grant",
        value: {
            url: "http://localhost:8888/oauth/token"
        },
        source: "Grant"
    },
    YouYun = {
        name: "YouYun",
        value: {
            url: "http://haixia.91uyun.com",
            appKey: "HXCSYY",
            appSecret: "a94b38ba5785b05c18a06e6957aba3c3"
        },
        source: "YouYun"
    },
    HuiYu = {
        name: "HuiYu",
        value: {
            user_name: "bjxx",
            password: "sxbjxx123",
            api_version: "v2.0",
            product_set: "corp_basic_pro",
            url: "http://api.huiyu.org.cn/HuiYuApiServer/per/product"
        },
        source: "HuiYu",
    },
    AipOcr = {
        name: "AipOcr",
        value: {
            AppId: "9886440",
            ApiKey: "rn7jg1eBoSd5381WWdGbDxU1",
            SecretKey: "ymFrZTBjcyI4B7VGXLVLPmVpmXxHQwnp"
        },
        source: "AipOcr",
    };

const config = [Basic, WeChatObj, TokenObj, ALiYun, ALiDaYu, Bill, Grant, YouYun, HuiYu, AipOcr];

db.ServerConfig.remove({});
config.forEach(item => db.ServerConfig.insert(item));
