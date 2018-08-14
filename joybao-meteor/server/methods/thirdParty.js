/**
 * TODO It's should disable In release version
 * 第三方调用接口
 */
import { SimpleSchema } from "meteor/aldeed:simple-schema";
import { RestMethodMixin } from "meteor/simple:rest-method-mixin";
import ValidatedMethod from "../../imports/helpers/CustomValidatedMethod";

import CompanyDao from "../../imports/api/company/dao";
import { ContractDao, ContractSignatureDao } from "../../imports/api/contract/dao";

import { CompanySchema } from "../../imports/api/company/Company";
import { ContractSchema } from "../../imports/api/contract/Contract";
import { ContractSignaturePositionSchema } from "../../imports/api/contract/ContractSignature";

import Role from "../../imports/helpers/Role";
import ConstantCode from "../../imports/helpers/ConstantCode";
import ContractHelper from "../../imports/helpers/ContractHelper";
import { addCompanyIdentity } from "../../imports/helpers/Certificate";

import Logger from "../../imports/helpers/Logger";
import validator from "../../imports/helpers/simple-schema-validator";
import { ErrorCode, ErrorJSON } from "../../imports/helpers/ErrorJson";

/**
 * 第三方客户端申请企业
 */
new ValidatedMethod({
    name: "third.certificate.company",
    mixins: [RestMethodMixin],
    validate: validator(new SimpleSchema({
        session: {
            type: Object,
            blackbox: true,
        },
        company: {
            label: "公司资料",
            type: CompanySchema,
        },
    })),
    run({ session, company }) {
        if (!session.isThirdParty) {
            return ErrorJSON(ErrorCode.THIRD.NO_THIRD);
        }

        if (!company.logisticsId) {
            return ErrorJSON(ErrorCode.COMPANY.NO_LOGISTICS_ID);
        }
        const codes = addCompanyIdentity(company, ConstantCode.COMPANY.SOURCE.YOU_YUN);
        const companyId = codes[1];
        if (codes[0] !== ErrorCode.SUCCESS) {
            return ErrorJSON(codes[0]);
        }

        // TODO NEED Update state?
        return { success: true, data: { companyId } };
    },
    restOptions: {
        url: "/third.certificate.company",
        getArgsFromRequest(req) {
            const obj = req.body;
            obj.session = req.session;
            try {
                obj.company = obj.company ? JSON.parse(obj.company) : null;
                obj.company.mainAccountId = req.session.userId;
            } catch (e) {
                const err = new Meteor.Error("Invalid json string", "Invalid json string");
                err.statusCode = 400;
                throw err;
            }

            // Judge the Company regiest method
            const OrgCode = obj.company.OrgCode;
            if (OrgCode.length === 15) {
                obj.company.regType = ConstantCode.COMPANY.REG_TYPE.REGCODE;
                obj.company.codeNO = OrgCode;
            } else if (OrgCode.length === 18) {
                obj.company.regType = ConstantCode.COMPANY.REG_TYPE.MERGE;
                obj.company.codeUSC = OrgCode;
            } else {
                Logger.error("OrgCode is invalid");
                return null;
            }
            return [obj];
        }
    }
});

/**
 * 第三方生成对应的合约并签署
 */
new ValidatedMethod({
    name: "third.contract.new",
    mixins: [RestMethodMixin],
    validate: validator(new SimpleSchema({
        session: {
            type: Object,
            blackbox: true,
        },
        companyId: {
            label: "公司Id",
            type: String,
        },
        contract: {
            label: "合约内容",
            type: ContractSchema,
        },
        signPosition: {
            label: "签署位置",
            type: ContractSignaturePositionSchema,
        },
    })),
    run({ session, contract, companyId, signPosition }) {
        // 判断公司是否属于当前第三方客户端代理
        const company = CompanyDao.findOneByCompanyId(companyId);
        if (!company || company.mainAccountId !== session.userId) {
            return ErrorJSON(ErrorCode.THIRD.NO_COMPANY);
        }

        /** 拼接组装发起人对象 */
        const senderObj = {};
        senderObj.userId = session.userId;
        senderObj.userName = session.clientName;
        senderObj.property = 0;
        senderObj.userPhone = company.phone;
        senderObj.avatar = session.avatar || "http://joybao.oss-cn-hangzhou.aliyuncs.com/wximages/people.png";
        senderObj.type = Role.COMPANY;
        senderObj.companyId = company._id;
        senderObj.companyName = company.name;
        senderObj.isMaster = session.isMaster;

        // 添加合约发件人
        const contractObj = contract;
        contractObj.sender = senderObj;

        // 合约发件人加入到收件人列表中
        const receiver = {
            confirmState: ConstantCode.CONTRACT.CONFIRMED_STATE.CONFIRMED,
            signState: ConstantCode.CONTRACT.SIGNATURE_STATE.NEED_ESIGN,
        };
        Object.assign(receiver, senderObj);
        contractObj.receivers.push(receiver);

        /** 签约人人数判断 **/
        const receiverSet = new Set(contractObj.receivers.map(item => item.userPhone));
        if (receiverSet.size !== contractObj.receivers.length) {
            Logger.info(`收件人 receiverSet:${receiverSet.size} receivers:${contractObj.receivers.length}`);
            return ErrorJSON(ErrorCode.CONTRATCT.REPEAT_RECEIVER);
        }
        const receiverLen = contractObj.receivers.length;
        if (receiverLen < 2) {
            return ErrorJSON(ErrorCode.CONTRATCT.NO_RECEIVER);
        }

        /** 判断附件数目 **/
        const annexLen = contractObj.annex.length;
        if (annexLen === 0) {
            return ErrorJSON(ErrorCode.CONTRATCT.NO_ANNEX);
        }

        /** 若发起人承担 冻结签署次数 */
        const signPayment = contract.signPayment;
        const remain = company.signatureNumber - company.lockSignatureNumber;
        /** 根据签署次数承担人 选择冻结次数 **/
        const lockNum = signPayment === ConstantCode.CONTRACT.SIGN_PAYMENT.SENDER ? receiverLen : 1;
        if (remain < lockNum) {
            return ErrorJSON(ErrorCode.CONTRATCT.NO_SIGN_NUMBER);
        }
        /** 冻结签署次数 */
        if (!CompanyDao.updateSignatureNumber(session.currentCompanyId, { $inc: { lockSignatureNumber: lockNum } })) {
            Logger.error("thirdParty updateSignatureNumber error");
            return ErrorJSON(ErrorCode.SERVER);
        }

        /** 合同入库 **/
        const contractId = ContractDao.insert(contractObj);
        if (!contractId) {
            Logger.error("thirdParty insert contract error");
            return ErrorJSON(ErrorCode.SERVER);
        }

        /** 合约pdf生成并发送短信 **/
        let res = ContractHelper.newContract(contractId, contractObj, session.userId, company.name, false);
        if (res) {
            Logger.error(`ErrorCode is ${res}`);
            return ErrorJSON(ErrorCode.SERVER);
        }

        Logger.info("newContract is OK");

        // 发起方签署一次
        const signPositionObj = signPosition;
        signPositionObj.sealId = company.defaultSealId;
        const accountId = company.accountId;
        /** 合约签署 */
        res = ContractSignatureDao.signCompany(contractId, company.phone, accountId, signPositionObj);
        if (!res) {
            Logger.error("thirdParty signCompany error");
            return ErrorJSON(ErrorCode.SERVER);
        }

        return { success: true, data: { contractId } };
    },
    restOptions: {
        url: "/third.contract.new",
        getArgsFromRequest(req) {
            const obj = req.body;
            try {
                obj.session = req.session;
                obj.contract = obj.contract ? JSON.parse(obj.contract) : {};
                obj.signPosition = obj.signPosition ? JSON.parse(obj.signPosition) : {};
            } catch (e) {
                const err = new Meteor.Error("Invalid json string", "Invalid json string");
                err.statusCode = 400;
                throw err;
            }
            return [obj];
        },
    },
});

/**
 * 查看当前客户端代理的企业
 */
new ValidatedMethod({
    name: "third.user.view",
    mixins: [RestMethodMixin],
    validate: null,
    // run({ session }) {
    run() {
        // TODOs
        return { success: true };
    },
    restOptions: {
        url: "/third.user.view",
        httpMethod: "get",
        getArgsFromRequest(req) {
            const obj = {};
            obj.session = req.session;
            return [obj];
        }
    }
});
