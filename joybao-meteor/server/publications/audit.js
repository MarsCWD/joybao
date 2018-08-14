import { Meteor } from "meteor/meteor";
import { publishComposite } from "meteor/reywood:publish-composite";

import { Seal } from "../../imports/api/seal/Seal";
import { Person } from "../../imports/api/person/Person";
import { Company } from "../../imports/api/company/Company";
import { AuditRecord } from "../../imports/api/audit/AuditRecord";
import { ContractSignature } from "../../imports/api/contract/ContractSignature";

import SealDao from "../../imports/api/seal/dao";
import PersonDao from "../../imports/api/person/dao";
import CompanyDao from "../../imports/api/company/dao";
import AuditRecordDao from "../../imports/api/audit/dao";
import { ContractDao, ContractSignatureDao } from "../../imports/api/contract/dao";

import Role from "../../imports/helpers/Role";
import Logger from "../../imports/helpers/Logger";
import SessionHelper from "../collections/session";
import ContractHelper from "../../imports/helpers/ContractHelper";
import ConstantCode from "../../imports/helpers/ConstantCode";
import MongoDBHelper from "../../imports/helpers/MongoDBHelper";

import ServerConfigDao from "../../imports/api/config/dao";

const Basic = ServerConfigDao.findOne("Basic").value;

/** 账户认证相关 开始 **/

/**
 * Java-client 调用该方法 更新成功
 * @type {[type]}
 */
Meteor.method("esign.person.ok", data => {
    Logger.log("更新个人资料");
    const userId = data.userId;
    const recordId = data.recordId;
    const accountId = data.accountId;

    let res = AuditRecordDao.updateSpecifiedFieldById(recordId, { accountId, status: ConstantCode.AUDIT_STATUS.FINISH });
    if (!res) {
        return Logger.error("更新认证记录出错", res);
    }

    res = PersonDao.updateSpecifiedFieldById(userId, {
        accountId,
        lockSignatureNumber: 0,
        signatureNumber: Basic.personSignatureNumber,
        identityState: ConstantCode.IDENTITY_STATUS.SUCCESS
    });
    if (!res) {
        return Logger.error("更新个人状态出错", res);
    }

    const person = PersonDao.findOneByUserId(userId);
    if (!person) {
        return Logger.error("获取个人出错", res);
    }

    /** 更新session状态表 **/
    res = SessionHelper.sessionUpdateByUserId(userId, {
        realName: person.realName,
        state: ConstantCode.IDENTITY_STATUS.SUCCESS,
        identityState: ConstantCode.IDENTITY_STATUS.SUCCESS,
    });
    if (!res) {
        return Logger.error("1.更新session状态表出错", res);
    }
    res = SessionHelper.sessionOperateSelector({ userId, name: { $exists: false } }, { $set: { name: person.realName } });
    if (res === undefined || res === null) {
        return Logger.error("2.更新session状态表出错", res);
    }

    return Logger.info(`个人 ${userId} 认证成功`);
});

/**
 * Java-client 调用该方法 更新认证失败
 * @type {[type]}
 */
Meteor.method("esign.person.no", data => {
    const userId = data.userId;
    const recordId = data.recordId;
    const errCode = data.errCode;
    const errMsg = data.errMsg;
    Logger.error(`用户 ${userId} error`);

    /** 更新认证记录 **/
    let res = AuditRecordDao.updateSpecifiedFieldById(recordId, {
        errCode,
        errMsg,
        status: ConstantCode.AUDIT_STATUS.FAILURE
    });
    if (!res) {
        return Logger.error("更新认证记录出错", res);
    }

    /** 更新个人状态 **/
    res = PersonDao.updateSpecifiedFieldById(userId, { identityState: ConstantCode.IDENTITY_STATUS.FAILURE });
    if (!res) {
        return Logger.error("更新个人状态出错", res);
    }

    /** 更新session状态表 **/
    res = SessionHelper.sessionUpdateByUserId(userId, {
        state: ConstantCode.IDENTITY_STATUS.FAILURE,
        identityState: ConstantCode.IDENTITY_STATUS.FAILURE,
    });
    if (!res) {
        return Logger.error("更新session状态表出错", res);
    }

    return Logger.info(`个人 ${userId} 认证失败`);
});

/**
 * Java-client 调用该方法 更新成功
 * @type {[type]}
 */
Meteor.method("esign.company.ok", data => {
    Logger.log("更新公司资料");
    const companyId = data.companyId;
    const recordId = data.recordId;
    const accountId = data.accountId;
    let res = CompanyDao.updateSpecifiedFieldById(companyId, {
        accountId,
        signatureNumber: Basic.companySignatureNumber,
        lockSignatureNumber: 0,
        identityState: ConstantCode.IDENTITY_STATUS.SUCCESS,
    });
    if (!res) {
        Logger.error("更新资料出错", res);
    }

    res = AuditRecordDao.updateSpecifiedFieldById(recordId, { accountId, status: ConstantCode.AUDIT_STATUS.FINISH });
    if (!res) {
        Logger.error("更新认证记录出错", res);
    }

    const company = CompanyDao.findOneByCompanyId(companyId);
    if (!company) {
        Logger.error("获取企业出错", res);
    }

    res = SessionHelper.sessionUpdateByUserId(company.mainAccountId, {
        name: company.name,
        isMaster: true,
        defaultSealId: undefined,
        currentCompanyId: companyId,
        identityState: ConstantCode.IDENTITY_STATUS.SUCCESS,
    });
    if (!res) {
        Logger.error("更新session状态表出错", res);
    }
});

/**
 * Java-client 调用该方法 更新认证失败
 * @type {[type]}
 */
Meteor.method("esign.company.no", data => {
    const companyId = data.companyId;
    const recordId = data.recordId;
    const errCode = data.errCode;
    const errMsg = data.errMsg;
    Logger.error(`公司 ${companyId} error`);
    let res = CompanyDao.updateSpecifiedFieldById(companyId, {
        identityState: ConstantCode.IDENTITY_STATUS.FAILURE,
    });
    if (!res) {
        return Logger.error("更新资料出错", res);
    }

    res = AuditRecordDao.updateSpecifiedFieldById(recordId, {
        errCode,
        errMsg,
        status: ConstantCode.AUDIT_STATUS.FAILURE
    });
    if (!res) {
        return Logger.error("更新认证记录出错", res);
    }

    const company = CompanyDao.findOneByCompanyId(companyId);
    if (!company) {
        return Logger.error("获取企业出错", res);
    }

    res = SessionHelper.updateSessionStateWithPerson(company.mainAccountId);
    if (!res) {
        return Logger.error("更新Session出错", res);
    }
    return Logger.error(`公司 ${companyId} error OK`);
});

publishComposite("esign.identity", {
    find() {
        return AuditRecord.find({
            status: ConstantCode.AUDIT_STATUS.PASS
        });
    },
    children: [{
        collectionName: "Person",
        find(auditRecord) {
            if (auditRecord.type === ConstantCode.AUDIT.TYPE.PERON_IDENTITY) {
                return Person.find({ _id: auditRecord.refId }, {
                    fields: MongoDBHelper.fields(["_id", "phone", "identity"])
                });
            }
            return undefined;
        },
    }, {
        collectionName: "Company",
        find(auditRecord) {
            if (auditRecord.type === ConstantCode.AUDIT.TYPE.COMPANY_IDENTITY) {
                return Company.find({ _id: auditRecord.refId }, {
                    fields: MongoDBHelper.fields(["mainAccountId", "identityState", "createdAt", "updatedAt", "isActive"], false)
                });
            }
            return undefined;
        }
    }, {
        collectionName: "Seal",
        find(auditRecord) {
            if (auditRecord.type === ConstantCode.AUDIT.TYPE.SEAL) {
                return Seal.find({ _id: auditRecord.refId }, {});
            }
            return undefined;
        }
    }]
});

/** 账户认证相关 结束 **/

/** 合约相关 开始 **/
Meteor.method("esign.contract.sign.ok", data => {
    Logger.log("开始签署完成");
    const recordId = data.recordId;
    const fileName = data.fileName;
    const serviceId = data.serviceId;
    const pageIndex = data.pageIndex;
    const contractId = data.contractId;
    const signatureType = data.signatureType;

    const record = ContractSignatureDao.findOneById(recordId);
    if (!record) {
        return Logger.error("查询签署记录");
    }

    /**
     * @description 17-06-09 分解pdf 并上传到阿里云 提取到 splitContract 方法
     */
    const func = Meteor.wrapAsync(ContractHelper.signatureContract);
    let pages = -1;
    if (signatureType === "Single") {
        pages = pageIndex;
    } else if (signatureType === "Multi") {
        pages = -1;
    } else {
        return Logger.error("未知的签署方式");
    }

    let res = func(contractId, fileName, pages);
    if (!res || !res.flag) {
        return Logger.error("分解pdf 上传阿里云出错");
    }

    // 更新签署记录
    res = ContractSignatureDao.updateSpecifiedFieldById(recordId, {
        signState: ConstantCode.CONTRACT.SIGNATURE_STATE.SIGNED,
        signFile: fileName,
        signFileId: serviceId,
    });
    if (!res) {
        return Logger.error("更新签署记录出错");
    }

    res = ContractDao.updateSpecifiedFieldById(contractId, { contractServiceId: serviceId });
    if (!res) {
        return Logger.error("更新合约出错");
    }

    // TODO 减去签署次数 In Job
    if (record.signPayment === ConstantCode.CONTRACT.SIGN_PAYMENT.SENDER) {
        /** 发起人承担 */
        if (record.sender.type === Role.COMPANY) {
            res = CompanyDao.updateSignatureNumber(record.sender.refId, {
                $inc: {
                    signatureNumber: -1,
                    lockSignatureNumber: -1,
                },
            });
            if (!res) {
                return Logger.error(`更新签署次数出错 ${record.sender.refId}`);
            }
        } else if (record.sender.type === Role.PERSON) {
            res = PersonDao.updateSignatureNumber(record.sender.refId, {
                $inc: {
                    signatureNumber: -1,
                    lockSignatureNumber: -1,
                },
            });
            if (!res) {
                return Logger.error(`更新签署次数出错 ${record.sender.refId}`);
            }
        } else {
            return Logger.error("发起人无身份");
        }
    } else if (record.signPayment === ConstantCode.CONTRACT.SIGN_PAYMENT.RECIVER) {
        /** 接收人承担 */
        if (record.companyId) {
            /** 公司身份签署 */
            res = CompanyDao.updateSignatureNumber(record.companyId, {
                $inc: {
                    signatureNumber: -1,
                    lockSignatureNumber: -1,
                },
            });
            if (!res) {
                return Logger.error(`更新签署次数出错 ${record.companyId}`);
            }
        } else {
            /** 个人身份签署 */
            res = PersonDao.updateSignatureNumber(record.userId, {
                $inc: {
                    signatureNumber: -1,
                    lockSignatureNumber: -1,
                },
            });
            if (!res) {
                return Logger.error(`更新签署次数出错 ${record.userId}`);
            }
        }
    }

    Logger.info("签署完成");

    Logger.info("检测合约是否可以生效");
    const flag = ContractHelper.isEffective(contractId);
    if (flag) {
        ContractHelper.effective(contractId);
    }

    return Logger.info("签署流程完成");
});

// TODO 签署的错误处理
Meteor.method("esign.contract.sign.no", () => {
    Logger.error("签署错误");
    // const recordId = data.recordId;
    // const errCode = data.errCode;
    // const errMsg = data.errMsg;
    //
    // // TODO 将状态置为未签署
    // const res = ContractSignatureDao.updateSpecifiedFieldById(recordId, {
    //     errCode,
    //     errMsg,
    //     signState: ConstantCode.CONTRACT.SIGNATURE_STATE.ERROR,
    // });
    // if (!res) {
    //     Logger.error("更新签署记录出错", res);
    // }

    // TODO 更新合约表中用户的状态
    // res = ContractDao.update({ _id: contractId }, {
    //
    // });
});

publishComposite("esign.contract.sign", {
    collectionName: "contract.sign",
    find() {
        return ContractSignature.find({
            signState: ConstantCode.CONTRACT.SIGNATURE_STATE.NEED_ESIGN,
        }, { fields: MongoDBHelper.fields(["userId", "companyId", "accountId", "contractId", "signPosition"]) });
    },
});
/** 合约相关 结束 **/

/**  第三方公司调用 开始 **/
Meteor.method("esign.company.seal.ok", data => {
    Logger.log("第三方公司生成签章成功");
    const userId = data.userId;
    const accountId = data.accountId;
    const companyId = data.companyId;

    const seal = data.sealData.replace(/^data:image\/\w+;base64,/, "");
    const dataBuffer = new Buffer(seal, "base64");
    const obj = {
        userId,
        companyId,
        accountId,
        default: true,
        base64: dataBuffer,
        status: ConstantCode.AUDIT_STATUS.FINISH,
        templateType: ConstantCode.SEAL.TYPE.COMPANY_SEAL,
    };
    const sealId = SealDao.insert(obj);
    if (!sealId) {
        return Logger.error(`签章生成错误 companyId:${companyId}`);
    }

    const res = CompanyDao.updateSpecifiedFieldById(companyId, {
        defaultSealId: sealId
    });
    if (!res) {
        return Logger.error("更新公司默认签章出现错误");
    }
    return Logger.info(`签章生成 sealId: ${sealId}`);
});

// TODO 第三方公司生成签章失败
Meteor.method("esign.company.seal.no", data => {
    Logger.log("第三方公司生成签章失败");
    Logger.log(data);
});

publishComposite("esign.company.seal", {
    collectionName: "company.seal",
    find() {
        return Company.find({
            defaultSealId: { $exists: false },
            source: ConstantCode.COMPANY.SOURCE.YOU_YUN,
            identityState: ConstantCode.IDENTITY_STATUS.SUCCESS,
        }, { fields: MongoDBHelper.fields(["mainAccountId", "accountId"]) });
    },
});
/**  第三方公司调用 结束 **/
