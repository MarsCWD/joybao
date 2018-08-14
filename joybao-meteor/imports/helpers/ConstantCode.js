const ConstantCode = {};

/** 认证相关状态常量 **/
ConstantCode.IDENTITY_STATUS = {
    INIT: "Init",
    IN_PROCESSING: "InProcessing",
    SUCCESS: "Success", // 认证成功
    FAILURE: "Failure",
    REMOVE: "Remove",
};

/** 审核状态 **/
ConstantCode.AUDIT_STATUS = {
    IN_PROCESSING: "InProcessing",
    PASS: "Pass", // 审核通过
    FINISH: "Finish", // 认证完成
    REJECT: "Reject",
    FAILURE: "Failure",
    REMOVE: "Remove",
};

/** 代理人状态 **/
ConstantCode.AGENT_STATUS = {
    SUCCESS: "Success",
    PASS: "Pass",
    IN_PROCESSING: "InProcessing",
    REJECT: "Reject",
    REMOVE: "Remove",
};

/** 审核类型和主题 **/
ConstantCode.AUDIT = {
    TYPE: {
        PERON_IDENTITY: "PersonIdentity",
        COMPANY_IDENTITY: "CompanyIdentity",
        AGENT_IDENTITY: "AgentIdentity",
        SEAL: "Seal",
    },
    SUBJECT: {
        PERON_IDENTITY: "个人实名认证",
        COMPANY_IDENTITY: "企业认证",
        AGENT_IDENTITY: "代理人认证",
        SEAL: "签章",
    },
};

/** 签章类型 **/
ConstantCode.SEAL = {
    TYPE: {
        COMPANY_SEAL: "CompanySeal",
        COMPANY_PHOTO: "CompanyPhoto",
        PERSON_SEAL: "PersonSeal",
        PERSON_PHOTO: "PersonPhoto",
        PERSON_SIGNATURE: "PersonSignature",
    },
};

/** 验证码 **/
ConstantCode.MOBILE_VALIDATE_CODE = {
    STATUS: {
        NOT_VALIDATE: "未验证",
        VALIDATE_SUCCESS: "验证成功",
    },
    EXPIRED_TIME_LIMIT: 15 * 60 * 1000, // 15分钟内有效(毫秒)
    SEND_INTERVAL: 2 * 60 * 1000, // 120s 内允许重发
};

/** @type {Object} 短信发送的相关状态 */
ConstantCode.SMS = {
    STATE: {
        WAIT: "Wait",
        FINISH: "Finish",
        ERROR: "Error",
    },
    SCENE: {
        VALIDATE_CODE: "ValidateCode", // Binding user phone
        RESET_SIGN_PASSWORD: "ResetSignPassword", // Reset Sign password

        SIGN_CODE: "SignCode", // Sign contract code
    },
};

/** 合约签署状态 **/
ConstantCode.CONTRACT = {
    PAY_MENT: {
        CASH: "Cash", // 现金/支票
        ALIPAY: "Alipay", // 支付宝
        WECHAT: "Wechat", // 微信
        PUBLIC_MONEY: "PublicMoney", // 对公打款
        OTHER: "Other", // 其他
    },

    SIGN_TYPE: {
        SINGLE: "Single", // 单页签署
        MULTI: "Multi", // 多页签署
        EDGES: "Edges",
        KEY: "Key",
    },

    SIGN_PAYMENT: { // 签署次数由谁承担
        SENDER: "Sender", // 发起人承担
        RECIVER: "Reciver", // 收件人承担
    },

    CONTRACT_STATUS: {
        WAIT: "Wait", // 等待签署
        FINISH: "Finish" // 完成签署
    },
    SIGNATURE_STATE: {
        NEED_SIGNED: "NeedSigned",
        NEED_ESIGN: "Wait",
        SIGNED: "Signed",
        ERROR: "Error",
    },
    CONFIRMED_STATE: {
        NEED_CONFIRMED: "NeedConfirmed",
        CONFIRMED: "Confirmed",
    },
};

ConstantCode.BILL = {
    TYPE: {
        INCOME: "Income",
        PAY: "Pay",
    },
};

/** 订单状态 **/
ConstantCode.ORDER = {
    STATUS: {
        INIT: "Init",
        PADDING: "Padding",
        PAID: "Paid",
        FINISH: "Finish",
        CANCELED: "Canceled",
        FAILURE: "Failure",
    },
};

/** 公司类型 **/
ConstantCode.COMPANY = {
    TYPE: { // 企业类型
        NORMAL: "Normal", // 普通企业
        LOGISTICS: "Logistics", // 物流
    },
    REG_TYPE: { // 注册方式
        NORMAL: "Normal", // 组织机构代码号
        MERGE: "Merge", // 多证合一，传递社会信用代码号
        REGCODE: "Regcode", // 企业工商注册码
    },
    SOURCE: { // 企业注册来源
        PLATFORM: "Platform",
        YOU_YUN: "YouYun",
        HUI_YU: "HuiYu",
    },
};

ConstantCode.JOB = {
    TYPE: {
        RELATION: "Relation",
    },
    STATE: {
        WAIT: "Wait",
        FINISH: "Finish",
        ERROR: "Error",
    },
};

export default ConstantCode;
