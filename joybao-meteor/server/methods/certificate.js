import { ValidatedMethod } from "meteor/mdg:validated-method";
import { SimpleSchema } from "meteor/aldeed:simple-schema";
import { RestMethodMixin } from "meteor/simple:rest-method-mixin";

import PersonDao from "../../imports/api/person/dao";
import CompanyDao from "../../imports/api/company/dao";
import XCompanyDao from "../../imports/api/xCompany/dao";

import { CompanySchema } from "../../imports/api/company/Company";

import Logger from "../../imports/helpers/Logger";
import AipOcrHelper from "../init/AipOcrHelper";
import SessionHelper from "../collections/session";
import MongoDBHelper from "../../imports/helpers/MongoDBHelper";
import ConstantCode from "../../imports/helpers/ConstantCode";
import validator from "../../imports/helpers/simple-schema-validator";
import { ErrorCode, ErrorJSON } from "../../imports/helpers/ErrorJson";

const Certificate = require("../../imports/helpers/Certificate");

/**
 * 身份证识别
 */
new ValidatedMethod({
    name: "idCard.recognition",
    mixins: [RestMethodMixin],
    validate: validator(new SimpleSchema({
        session: {
            type: Object,
            blackbox: true,
        },
        fileName: {
            label: "身份证图片id",
            type: String,
        },
        isFront: {
            label: "正反",
            type: String
        }
    })),
    run({ session, fileName, isFront }) {
        const recognitionIdCard = Meteor.wrapAsync(AipOcrHelper.recognitionIdCard);
        try {
            const url = Meteor.settings.imageURL + fileName;
            const data = recognitionIdCard(url, isFront === "true");
            // 调用身份证识别失败
            if (!data) {
                return ErrorJSON(ErrorCode.OCR.ERRPARSE);
            }
            const res = PersonDao.updateSpecifiedFieldById(session.userId, { identity: { IDCard: data.IDCard, realName: data.realName, idCardFont: fileName } });
            if (!res) {
                return ErrorJSON(ErrorCode.SERVER);
            }
            return { success: true, data };
        } catch (err) {
            return ErrorJSON(ErrorCode.OCR.ERRREQUEST);
        }
    },
    restOptions: {
        url: "/certificate.idCard.recognition",
        getArgsFromRequest(req) {
            const obj = req.body;
            obj.session = req.session;
            return [obj];
        },
    },
});

/**
 * 个人身份证验证
 */
new ValidatedMethod({
    name: "certificate.personal.idCard",
    mixins: [RestMethodMixin],
    validate: null,
    run({ session }) {
        /** 当前正在认证 **/
        if (session.identityState === ConstantCode.IDENTITY_STATUS.IN_PROCESSING) {
            return ErrorJSON(ErrorCode.PERSON.IS_IDENTITY_IN_PROCESSING);
        }
        /** 当前个人已完成认证 **/
        if (session.state === ConstantCode.IDENTITY_STATUS.SUCCESS) {
            return ErrorJSON(ErrorCode.PERSON.IS_IDENTITY_SUCCESS);
        }
        /** 用户表里是否有个人资料 **/
        const person = PersonDao.findHasIdentity(session.userId);
        if (!person) {
            return ErrorJSON(ErrorCode.PERSON.ERROR_RECOGNITION);
        }

        /** 更新Session (状态表) 避免因特殊情况(如DDP调用过快) 避免可能出现的状态覆盖 **/
        const res = SessionHelper.sessionUpdate(session.token, {
            state: ConstantCode.IDENTITY_STATUS.IN_PROCESSING,
            identityState: ConstantCode.IDENTITY_STATUS.IN_PROCESSING,
        });
        if (!res) {
            Logger.error("sessionUpdate error");
            return ErrorJSON(ErrorCode.SERVER);
        }

        /** 调用添加个人认证 */
        const code = Certificate.addPersonIdentity(person.identity.realName, session.userId);
        if (code !== ErrorCode.SUCCESS) {
            // 错误处理 回滚Session
            SessionHelper.sessionUpdate(session.token, {
                state: ConstantCode.IDENTITY_STATUS.INIT,
                identityState: ConstantCode.IDENTITY_STATUS.INIT,
            });
            return ErrorJSON(code);
        }

        return { success: true };
    },
    restOptions: {
        url: "/certificate.personal.idCard",
        getArgsFromRequest(req) {
            const obj = {};
            obj.session = req.session;
            return [obj];
        },
    },
});

/**
 * 企业认证
 */
new ValidatedMethod({
    name: "certificate.company",
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
        certificateId: {
            label: "代理人证书文件ID",
            type: String,
            optional: true
        },
    })),
    run({ session, company, certificateId }) {
        /** 若用户正在认证 */
        if (session.identityState === ConstantCode.IDENTITY_STATUS.IN_PROCESSING) {
            return ErrorJSON(ErrorCode.PERSON.IS_IDENTITY_IN_PROCESSING);
        }

        const sessionObj = { identityState: ConstantCode.IDENTITY_STATUS.IN_PROCESSING };
        /** 若用户未认证成功且缺少个人认证资料 **/
        if (session.identityState !== ConstantCode.IDENTITY_STATUS.SUCCESS) {
            const person = PersonDao.findHasIdentity(session.userId);
            if (!person) {
                return ErrorJSON(ErrorCode.PERSON.ERROR_RECOGNITION);
            }

            /** 进行用户实名认证 **/
            const code = Certificate.addPersonIdentity(person.identity.realName, session.userId);
            if (code !== ErrorCode.SUCCESS) {
                return ErrorJSON(code);
            }

            sessionObj.state = ConstantCode.IDENTITY_STATUS.IN_PROCESSING;
        }

        /** 查询个人, 填充公司相关资料 **/
        const person = PersonDao.findOneByUserId(session.userId, {
            fields: MongoDBHelper.fields(["identity"])
        });

        /** 法人注册 **/
        const companyObj = company;
        if (company.userType === "2") {
            companyObj.legalName = person.identity.realName;
            companyObj.legalID = person.identity.IDCard;
        } else if (company.userType === "1") {
            companyObj.agentName = person.identity.realName;
            companyObj.agentID = person.identity.IDCard;
        }

        /** 判断企业注册来源 **/
        let XCompany = null;
        let source = ConstantCode.COMPANY.SOURCE.PLATFORM;
        /** 若存在XCompanyId 且 检验有效,则说明经 惠誉调用 可直接过审核 **/
        if (session.XCompanyId) {
            XCompany = XCompanyDao.findOneWithId(session.XCompanyId);
            if (!XCompany) {
                Logger.error("No XCompany");
                return ErrorJSON(ErrorCode.SERVER);
            }
            // 法人信息不匹配
            if (XCompany.legalName !== company.legalName) {
                return ErrorJSON(ErrorCode.COMPANY.NO_LEAGLE);
            }
            // 惠誉 校验未通过
            if (XCompany.name === company.name &&
                XCompany.OrgCode === company.OrgCode &&
                !company.agentName) {
                source = ConstantCode.COMPANY.SOURCE.HUI_YU;
            }
        }

        /** 添加企业 */
        const codes = Certificate.addCompanyIdentity(companyObj, source);
        const companyId = codes[1];
        const companyName = codes[2];
        if (codes[0] !== ErrorCode.SUCCESS) {
            return ErrorJSON(codes[0]);
        }

        /** 添加一条主体代理人记录 */
        const code = Certificate.addAgentIdentity(companyId, companyName,
            session.userId, person.identity.realName, true, certificateId);
        if (code !== ErrorCode.SUCCESS) {
            return ErrorJSON(code);
        }

        /** 更新Session (状态表)**/
        const res = SessionHelper.sessionUpdate(session.token, sessionObj);
        if (!res) {
            Logger.error("sessionUpdate error");
            return ErrorJSON(ErrorCode.SERVER);
        }

        return { success: true };
    },
    restOptions: {
        url: "/certificate.company",
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
        },
    },
});

/**
 * 代理人认证
 */
new ValidatedMethod({
    name: "certificate.agent",
    mixins: [RestMethodMixin],
    validate: validator(new SimpleSchema({
        session: {
            type: Object,
            blackbox: true,
        },
        companyId: {
            label: "认证企业ID",
            type: String,
        },
        certificateId: {
            label: "代理人证书文件ID",
            type: String,
        },
    })),
    run({ session, companyId, certificateId }) {
        /** 若用户正在认证 */
        if (session.identityState === ConstantCode.IDENTITY_STATUS.IN_PROCESSING) {
            return ErrorJSON(ErrorCode.PERSON.IS_IDENTITY_IN_PROCESSING);
        }

        /** 判断企业是否存在 */
        const company = CompanyDao.findOne({ _id: companyId });
        if (!company || company.identityState !== ConstantCode.IDENTITY_STATUS.SUCCESS) {
            return ErrorJSON(ErrorCode.COMPANY.UNEXISTED);
        }

        const sessionObj = { identityState: ConstantCode.IDENTITY_STATUS.IN_PROCESSING };
        /** 若用户未认证成功且缺少个人认证资料 **/
        if (session.identityState !== ConstantCode.IDENTITY_STATUS.SUCCESS) {
            const person = PersonDao.findHasIdentity(session.userId);
            if (!person) {
                return ErrorJSON(ErrorCode.PERSON.ERROR_RECOGNITION);
            }

            /** 进行用户实名认证 **/
            const code = Certificate.addPersonIdentity(person.identity.realName, session.userId);
            if (code !== ErrorCode.SUCCESS) {
                return ErrorJSON(code);
            }

            sessionObj.state = ConstantCode.IDENTITY_STATUS.IN_PROCESSING;
        }

        /** 添加一条代理人记录 */
        const code = Certificate.addAgentIdentity(companyId, company.name,
            session.userId, session.realName, false, certificateId);
        if (code !== ErrorCode.SUCCESS) {
            return ErrorJSON(code);
        }

        /** 更新Session (状态表)**/
        const res = SessionHelper.sessionUpdate(session.token, sessionObj);
        if (!res) {
            return ErrorJSON(ErrorCode.SERVER);
        }

        return { success: true };
    },
    restOptions: {
        url: "/certificate.agent",
        getArgsFromRequest(req) {
            const obj = req.body;
            obj.session = req.session;
            return [obj];
        },
    },
});
