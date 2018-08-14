const ConstantCode = {};

ConstantCode.SEAL = {
    TYPE: {
        COMPANY_SEAL: "CompanySeal",
        COMPANY_PHOTO: "CompanyPhoto",
        PERSON_SEAL: "PersonSeal",
        PERSON_PHOTO: "PersonPhoto",
        PERSON_SIGNATURE: "PersonSignature",
    }
};

ConstantCode.IDENTITY_STATUS = {
    INIT: "Init",
    IN_PROCESSING: "InProcessing",
    SUCCESS: "Success",
    FAILURE: "Failure",
    REMOVE: "Remove",
    PASS:"Pass",
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
    CONTRACT_STATUS: {
        WAIT: "Wait", // 等待签署
        FINISH: "Finish" // 完成签署
    },
    SIGNATURE_STATE: {
        NEED_SIGNED: "NeedSigned",
        SIGNED: "Signed",
    },
    CONFIRMED_STATE: {
        NEED_CONFIRMED: "NeedConfirmed",
        CONFIRMED: "Confirmed",
    },
};

/** 模板状态 **/
ConstantCode.TEMPLATE = {
    TYPE: {
        COMPANY: "company",
        PERSONAL: "personal",
        IDCARD: "idcard",
        AGENT: "agent",
    }
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

/** 签署方 **/
ConstantCode.SIGN_PAYMNET = {
    SENDER:"Sender",
    RECIVER:"Reciver"
};


export default ConstantCode;
