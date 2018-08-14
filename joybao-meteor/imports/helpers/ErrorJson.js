const ErrorCode = {};
const ErrorMessage = {};

ErrorCode.SUCCESS = 0;
ErrorCode.SERVER = 500;
ErrorCode.WECHAT_INVALID = 501;
ErrorCode.WECHAT_CODE = 502;
ErrorCode.USER_ROLE = 503;

ErrorCode.UNKNOW = 556;

ErrorCode.PERSON = {
    IDENTITY: 1000,
    IS_IDENTITY_IN_PROCESSING: 1001,
    IS_IDENTITY_SUCCESS: 1002,

    UNEXISTED: 1010,
    NOBODY: 1011,

    NO_PHONE: 1020,
    HAS_PHONE: 1021,
    NOT_FOUND_BY_PHONE: 1022,
    HAS_PERSON_PHONE: 1023,
    VALIDATOR_PHONE_ERROR: 1024,

    SIGN_PASSWORD: 1030,
    HAS_SIGN_PASSWORD: 1031,
    NO_SIGN_PASSWORD: 1032,
    VALIDATOR_SIGN_PASSWORD_RESET_ERROR: 1033,
    ERROR_RECOGNITION: 1034,
};

ErrorCode.COMPANY = {
    EXISTED: 2000,
    UNEXISTED: 2001,
    NOT_EXIST: 2002,
    NO_CERTIFICATE: 2003,

    NO_MASTER: 2010,
    EMPTY_NAME: 2011,

    IDENTITY_ERROR: 2020,
    NO_LEAGLE: 2021,
    NO_ORGCODE: 2022,
};


ErrorCode.AGENT = {
    HAS_BEEN_AGENTS: 2100,
    NO_FOUND_AGENT: 2101,
};

ErrorCode.SMS = {
    REPEAT: 2200,
    VALIDATE: 2201,
};

ErrorCode.TEMPLATE = {
    NOT_FOUND: 2300,
};

ErrorCode.SEAL = {
    NOT_MATCH: 2400,
    NOT_PASS: 2401,
    NOT_CURRENT_USER: 2402,
    NOT_EXIST: 2404,
    OVER_MAX: 2405,
    IS_DEFAULT: 2406,
    IS_NOT_DEFAULT: 2407,
};

ErrorCode.CONTRATCT = {
    NOT_SIGNATURE_RECORD: 3000,
    HAS_FINISHED: 3001,
    HAS_CONFIRMED: 3002,
    HAS_SIGN: 3003,
    NO_RECEIVER: 3004,
    HAS_COMPANY_SIGN: 3005,
    SIGN_CODE: 3006,
    NO_CONTRACT: 3007,
    NO_USER_SEAL: 3008,
    NO_COMPANY_SEAL: 3009,
    NO_SIGN_NUMBER: 3010,
    NO_ANNEX: 3011,
    REPEAT_RECEIVER: 3012,
};

ErrorCode.AUDIT = {
    NO_ADMIN: 3500,
    NOT_RECORD: 3501,
    NO_TYPE: 3502,
    HAS_AUDIT: 3503,
};

ErrorCode.BILL = {
    NO_BILL: 3600,
    NO_BILL_BELONG: 3601,
    NO_DEBIT_BELONG: 3602,
    NO_YEAR: 3603,
    NO_MONTH: 3604,
};

ErrorCode.PACKAGE = {
    NOT_FOUND: 3700,
};
ErrorCode.ORDER = {
    INVALID_PACKAGE: 3800,
    UNIFIEDORDER_ERR: 3801,
    CALLBACK_ERR: 3802,
    CALLBACK_MISS: 3803,
};

ErrorCode.THIRD = {
    NO_THIRD: 5000,
    NO_COMPANY: 5001,
    NO_COMPANY_PHONE: 5002,
    NO_LOGISTICS_ID: 5003,
    ADMIN_SECRET_ERROR: 5004,
};

ErrorCode.XCOMPANY = {
    UNEXISTED: 3900,
    ERRPARSE: 3901,
    ERRUPSERT: 3902,
};

ErrorCode.OCR = {
    ERRREQUEST: 4000,
    ERRPARSE: 4001,
    ERRRECOGNITION: 4002,
};

ErrorMessage[ErrorCode.UNKNOW] = "未知错误";
ErrorMessage[ErrorCode.SERVER] = "服务器错误";
ErrorMessage[ErrorCode.IDENTITY] = "认证资料不能为空";
ErrorMessage[ErrorCode.WECHAT_INVALID] = "无效的用户数据";
ErrorMessage[ErrorCode.WECHAT_CODE] = "无效的登录Code";
ErrorMessage[ErrorCode.USER_ROLE] = "您无需修改身份";

ErrorMessage[ErrorCode.PERSON.WECHAT] = "微信资料错误";
ErrorMessage[ErrorCode.PERSON.IS_IDENTITY_IN_PROCESSING] = "正在认证";
ErrorMessage[ErrorCode.PERSON.IS_IDENTITY_SUCCESS] = "已成功认证";
ErrorMessage[ErrorCode.PERSON.UNEXISTED] = "用户未存在或未完成认证";
ErrorMessage[ErrorCode.PERSON.NOBODY] = "未找到此用户";
ErrorMessage[ErrorCode.PERSON.SIGN_PASSWORD] = "签署密码不正确";
ErrorMessage[ErrorCode.PERSON.HAS_PHONE] = "用户已经绑定手机号码";
ErrorMessage[ErrorCode.PERSON.VALIDATOR_PHONE_ERROR] = "用户手机验证失败";
ErrorMessage[ErrorCode.PERSON.VALIDATOR_SIGN_PASSWORD_RESET_ERROR] = "验证码不正确";
ErrorMessage[ErrorCode.PERSON.HAS_PERSON_PHONE] = "该手机号码已被用户绑定";
ErrorMessage[ErrorCode.PERSON.HAS_SIGN_PASSWORD] = "用户已绑定签署密码";
ErrorMessage[ErrorCode.PERSON.NO_SIGN_PASSWORD] = "用户还未绑定签署密码";
ErrorMessage[ErrorCode.PERSON.NOT_FOUND_BY_PHONE] = "未能根据该手机号码查找到用户";
ErrorMessage[ErrorCode.PERSON.NO_PHONE] = "当前用户还未绑定手机号码";
ErrorMessage[ErrorCode.PERSON.IDENTITY] = "个人认证资料不能为空";
ErrorMessage[ErrorCode.PERSON.ERROR_RECOGNITION] = "个人识别认证失败";

ErrorMessage[ErrorCode.COMPANY.EXISTED] = "企业已存在";
ErrorMessage[ErrorCode.COMPANY.IS_IDENTITY_IN_PROCESSING] = "企业正在认证";
ErrorMessage[ErrorCode.COMPANY.UNEXISTED] = "企业未存在或未完成认证";
ErrorMessage[ErrorCode.COMPANY.NO_MASTER] = "当前用户非该企业的主体账户";
ErrorMessage[ErrorCode.COMPANY.NOT_EXIST] = "该企业未存在";
ErrorMessage[ErrorCode.COMPANY.EMPTY_NAME] = "企业名不能为空";
ErrorMessage[ErrorCode.COMPANY.NO_CERTIFICATE] = "代理人认证需上传授权书";
ErrorMessage[ErrorCode.COMPANY.IDENTITY_ERROR] = "企业认证资料不足";
ErrorMessage[ErrorCode.COMPANY.NO_LEAGLE] = "认证人不是法人";
ErrorMessage[ErrorCode.COMPANY.NO_ORGCODE] = "企业代码不匹配";

ErrorMessage[ErrorCode.AGENT.HAS_BEEN_AGENTS] = "你已经代理该公司";
ErrorMessage[ErrorCode.AGENT.NO_FOUND_AGENT] = "未找到此代理人";

ErrorMessage[ErrorCode.SMS.REPEAT] = "短信发送太过频繁";
ErrorMessage[ErrorCode.SMS.VALIDATE] = "短信验证码验证失败";

ErrorMessage[ErrorCode.TEMPLATE.NOT_FOUND] = "未找到模板";

ErrorMessage[ErrorCode.SEAL.NOT_MATCH] = "签章类别与用户身份不匹配";
ErrorMessage[ErrorCode.SEAL.NOT_PASS] = "该签章未存在或未完成认证";
ErrorMessage[ErrorCode.SEAL.NOT_CURRENT_USER] = "当前签章不存在或不属于该用户";
ErrorMessage[ErrorCode.SEAL.NOT_EXIST] = "签章不存在";
ErrorMessage[ErrorCode.SEAL.OVER_MAX] = "签章总数超过五个";
ErrorMessage[ErrorCode.SEAL.IS_DEFAULT] = "当前签章为默认签章";
ErrorMessage[ErrorCode.SEAL.IS_NOT_DEFAULT] = "当前签章不为默认签章";

ErrorMessage[ErrorCode.CONTRATCT.NOT_SIGNATURE_RECORD] = "当前用户未找到对应的合约";
ErrorMessage[ErrorCode.CONTRATCT.HAS_FINISHED] = "该合约已完成";
ErrorMessage[ErrorCode.CONTRATCT.HAS_CONFIRMED] = "当前用户已无需确认该合约";
ErrorMessage[ErrorCode.CONTRATCT.HAS_SIGN] = "当前用户已无需签署该合约";
ErrorMessage[ErrorCode.CONTRATCT.NO_RECEIVER] = "当前合约无签收人";
ErrorMessage[ErrorCode.CONTRATCT.HAS_COMPANY_SIGN] = "该公司已在此合约上进行签署";
ErrorMessage[ErrorCode.CONTRATCT.SIGN_CODE] = "动态签署码不匹配";
ErrorMessage[ErrorCode.CONTRATCT.NO_CONTRACT] = "未找到该合约";
ErrorMessage[ErrorCode.CONTRATCT.NO_USER_SEAL] = "该签章不属于该用户";
ErrorMessage[ErrorCode.CONTRATCT.NO_COMPANY_SEAL] = "该签章不属于该公司";
ErrorMessage[ErrorCode.CONTRATCT.NO_SIGN_NUMBER] = "签署次数不足";
ErrorMessage[ErrorCode.CONTRATCT.NO_ANNEX] = "未上传图片";
ErrorMessage[ErrorCode.CONTRATCT.REPEAT_RECEIVER] = "收件人重复";

ErrorMessage[ErrorCode.AUDIT.NO_ADMIN] = "权限不足";
ErrorMessage[ErrorCode.AUDIT.NOT_RECORD] = "并未找到该记录";
ErrorMessage[ErrorCode.AUDIT.NO_TYPE] = "并未找到该分类";
ErrorMessage[ErrorCode.AUDIT.HAS_AUDIT] = "该记录已经完成审核";

ErrorMessage[ErrorCode.BILL.NO_BILL] = "当前账单不存在";
ErrorMessage[ErrorCode.BILL.NO_BILL_BELONG] = "该账单不属于你";
ErrorMessage[ErrorCode.BILL.NO_DEBIT_BELONG] = "该账单不属于你";
ErrorMessage[ErrorCode.BILL.NO_YEAR] = "请输入正确的年份";
ErrorMessage[ErrorCode.BILL.NO_MONTH] = "请输入正确的月份";

ErrorMessage[ErrorCode.PACKAGE.NOT_FOUND] = "当前未找到有效的套餐";

ErrorMessage[ErrorCode.ORDER.INVALID_PACKAGE] = "充值数据与套餐数据并不一致";
ErrorMessage[ErrorCode.ORDER.UNIFIEDORDER_ERR] = "支付失败:调用微信下单失败";
ErrorMessage[ErrorCode.ORDER.CALLBACK_ERR] = "支付失败:微信回调显示业务结果失败";
ErrorMessage[ErrorCode.ORDER.CALLBACK_MISS] = "支付失败:微信回调通信失败";

ErrorMessage[ErrorCode.THIRD.NO_THIRD] = "无权调用";
ErrorMessage[ErrorCode.THIRD.NO_COMPANY] = "没有找到对应的公司";
ErrorMessage[ErrorCode.THIRD.NO_COMPANY_PHONE] = "请输入公司联系方式";
ErrorMessage[ErrorCode.THIRD.NO_LOGISTICS_ID] = "没有承运企业id";
ErrorMessage[ErrorCode.THIRD.ADMIN_SECRET_ERROR] = "appID或appSecret错误";

ErrorMessage[ErrorCode.XCOMPANY.ERRPARSE] = "获取企业信息失败:解析结果失败";
ErrorMessage[ErrorCode.XCOMPANY.ERRUPSERT] = "获取企业信息失败:存入结果失败";
ErrorMessage[ErrorCode.XCOMPANY.UNEXISTED] = "获取企业信息失败:找不到该企业";

ErrorMessage[ErrorCode.OCR.ERRREQUEST] = "图片识别失败";
ErrorMessage[ErrorCode.OCR.ERRRECOGNITION] = "图片无法识别";
ErrorMessage[ErrorCode.OCR.ERRPARSE] = "识别结果解析失败";


const ErrorJSON = function(code) {
    return { success: false, message: ErrorMessage[code || ErrorCode.UNKNOW] };
};

export { ErrorCode, ErrorJSON };
