import { RestMethodMixin } from "meteor/simple:rest-method-mixin";
import { SimpleSchema } from "meteor/aldeed:simple-schema";

import SealDao from "../../imports/api/seal/dao";
import PersonDao from "../../imports/api/person/dao";
import CompanyDao from "../../imports/api/company/dao";
import AgentRecordDao from "../../imports/api/agent/dao";
import AuditRecordDao from "../../imports/api/audit/dao";

import SessionHelper from "../collections/session";
import Logger from "../../imports/helpers/Logger";
import ConstantCode from "../../imports/helpers/ConstantCode";
import validator from "../../imports/helpers/simple-schema-validator";
import ValidatedMethod from "../../imports/helpers/CustomValidatedMethod";
import MongoDBHelper from "../../imports/helpers/MongoDBHelper";
import { ErrorCode, ErrorJSON } from "../../imports/helpers/ErrorJson";

// TODO 公司主帐号审核代理人

/**
 * 根据审核Id 查看审核内容
 */
new ValidatedMethod({
    name: "audit.view",
    mixins: [RestMethodMixin],
    validate: null,
    run({ session, recordId }) {
        const isAdmin = session.isAdmin === "true";
        if (!isAdmin && !CompanyDao.isMaster(session.userId, session.currentCompanyId)) {
            return ErrorJSON(ErrorCode.AUDIT.NO_ADMIN);
        }

        const record = AuditRecordDao.findOne(recordId);
        if (!record) {
            return ErrorJSON(ErrorCode.AUDIT.NOT_RECORD);
        }

        if (record.type === ConstantCode.AUDIT.TYPE.PERON_IDENTITY) {
            if (!isAdmin) {
                return ErrorJSON(ErrorCode.AUDIT.NO_ADMIN);
            }
            const data = PersonDao.findOne(record.refId, {
                fields: MongoDBHelper.fields(["nickName", "phone", "avatarUrl", "identity", "updatedAt"])
            });
            return { success: true, data };
        } else if (record.type === ConstantCode.AUDIT.TYPE.COMPANY_IDENTITY) {
            if (!isAdmin) {
                return ErrorJSON(ErrorCode.AUDIT.NO_ADMIN);
            }
            const company = CompanyDao.findOne(record.refId, {
                fields: MongoDBHelper.fields(["identityId", "accountId", "isActive"], false)
            });

            const person = PersonDao.findOne(company.mainAccountId, {
                fields: MongoDBHelper.fields(["nickName", "phone", "avatarUrl", "identity", "updatedAt"])
            });

            // 删除 Company 中的MainAccountId 属性
            // "mainAccountId",
            delete person._id;
            delete company.mainAccountId;

            return { success: true, data: { company, person } };
        } else if (record.type === ConstantCode.AUDIT.TYPE.SEAL) {
            if (!isAdmin) {
                return ErrorJSON(ErrorCode.AUDIT.NO_ADMIN);
            }
            const data = SealDao.findOne(record.refId, {
                fields: MongoDBHelper.fields(["templateType", "imgB64", "updatedAt"])
            });
            return { success: true, data };
        } else if (record.type === ConstantCode.AUDIT.TYPE.AGENT_IDENTITY) {
            const agent = AgentRecordDao.findOne(record.refId);
            const person = PersonDao.findOne(agent.userId, {
                fields: MongoDBHelper.fields(["nickName", "phone", "avatarUrl", "identity", "updatedAt"])
            });
            delete agent.userId;
            return { success: true, data: { person, agent } };
        }
        return ErrorJSON(ErrorCode.AUDIT.NO_TYPE);
    },
    restOptions: {
        url: "/audit.view",
        getArgsFromRequest(req) {
            const obj = {};
            obj.session = req.session;
            obj.recordId = req.query.recordId;
            return [obj];
        },
        httpMethod: "get",
    },
});

// /**
//  * 审核结果
//  * @type {String}
//  */
// new ValidatedMethod({
//     name: "audit.result.person",
//     mixins: [RestMethodMixin],
//     validate: validator(new SimpleSchema({
//         session: {
//             type: Object,
//             blackbox: true,
//         },
//         recordId: {
//             type: String,
//             label: "审核记录",
//         },
//         realName: {
//             type: String,
//             label: "用户姓名",
//             regEx: SimpleSchema.RegEx.PersonName,
//             optional: true
//         },
//         IDCard: {
//             type: String,
//             label: "用户身份证",
//             regEx: SimpleSchema.RegEx.IDCard,
//             optional: true
//         },
//         pass: {
//             type: Boolean,
//             label: "审核结果",
//         },
//         remark: {
//             type: String,
//             label: "备注",
//             optional: true,
//         },
//     })),
//     run({ session, recordId, realName, IDCard, pass, remark }) {
//         if (session.isAdmin !== "true") {
//             return ErrorJSON(ErrorCode.AUDIT.NO_ADMIN);
//         }
//
//         const record = AuditRecordDao.findOne(recordId);
//         if (!record) {
//             return ErrorJSON(ErrorCode.AUDIT.NOT_RECORD);
//         }
//
//         if (record.status !== ConstantCode.AUDIT_STATUS.IN_PROCESSING) {
//             return ErrorJSON(ErrorCode.AUDIT.HAS_AUDIT);
//         }
//
//         const status = pass ? ConstantCode.AUDIT_STATUS.PASS : ConstantCode.AUDIT_STATUS.REJECT;
//         const updateObj = {
//             status,
//             remark,
//             auditor: session.userId,
//             verifyAt: new Date(),
//             userRealName: realName,
//             userIDCard: IDCard,
//         };
//         let res = AuditRecordDao.updateSpecifiedFieldById(recordId, updateObj);
//         if (!res) {
//             return ErrorJSON(ErrorCode.SERVER);
//         }
//         if (status === ConstantCode.AUDIT_STATUS.REJECT) {
//             return { success: true };
//         }
//
//         res = PersonDao.updateSpecifiedFieldById(record.refId, {
//             realName,
//             "identity.realName": realName,
//             "identity.IDCard": IDCard,
//         });
//         if (!res) {
//             return ErrorJSON(ErrorCode.SERVER);
//         }
//         return { success: true };
//     },
//     restOptions: {
//         url: "/audit.result.person",
//         getArgsFromRequest(req) {
//             const obj = req.body;
//             obj.session = req.session;
//             obj.pass = obj.pass === "true";
//             return [obj];
//         },
//     },
// });

/**
 * 公司验证
 */
new ValidatedMethod({
    name: "audit.result.company",
    mixins: [RestMethodMixin],
    validate: validator(new SimpleSchema({
        session: {
            type: Object,
            blackbox: true,
        },
        recordId: {
            type: String,
            label: "审核记录",
        },
        pass: {
            type: Boolean,
            label: "审核结果",
        },
        remark: {
            type: String,
            label: "备注",
            optional: true,
        },
    })),
    run({ session, recordId, pass, remark }) {
        if (session.isAdmin !== "true") {
            return ErrorJSON(ErrorCode.AUDIT.NO_ADMIN);
        }

        const record = AuditRecordDao.findOne(recordId);
        if (!record) {
            return ErrorJSON(ErrorCode.AUDIT.NOT_RECORD);
        }
        const company = CompanyDao.findOne(record.refId);
        if (!company) {
            return ErrorJSON(ErrorCode.COMPANY.NOT_EXIST);
        }

        const status = pass ? ConstantCode.AUDIT_STATUS.PASS : ConstantCode.AUDIT_STATUS.REJECT;
        const res = AuditRecordDao.updateSpecifiedFieldById(recordId, {
            status,
            remark,
            auditor: session.userId,
            verifyAt: new Date(),
        });
        if (!res) {
            return ErrorJSON(ErrorCode.SERVER);
        }

        const person = PersonDao.findOneByUserId(company.mainAccountId);
        if (!person) {
            return ErrorJSON(ErrorCode.PERSON.NOBODY);
        }

        // if (person.identityState !== ConstantCode.IDENTITY_STATUS.SUCCESS) {
        //     res = PersonDao.updateSpecifiedFieldById(person._id, {
        //         realName: agentObj.realName,
        //         "identity.realName": agentObj.realName,
        //         "identity.IDCard": agentObj.IDCard,
        //     });
        //     if (!res) {
        //         return ErrorJSON(ErrorCode.SERVER);
        //     }
        //     res = AuditRecordDao.updateSpecifiedFieldById(person.identity.identityId, {
        //         status,
        //         remark,
        //         auditor: session.userId,
        //         verifyAt: new Date(),
        //         userRealName: agentObj.realName,
        //         userIDCard: agentObj.IDCard,
        //     });
        //     if (!res) {
        //         return ErrorJSON(ErrorCode.SERVER);
        //     }
        // }

        return { success: true };
    },
    restOptions: {
        url: "/audit.result.company",
        getArgsFromRequest(req) {
            const obj = req.body;
            obj.session = req.session;
            obj.pass = obj.pass === "true";
            return [obj];
        },
    },
});

/**
 * 代理人审核结果
 */
new ValidatedMethod({
    name: "audit.agent.result",
    mixins: [RestMethodMixin],
    validate: validator(new SimpleSchema({
        session: {
            type: Object,
            blackbox: true,
        },
        recordId: {
            type: String,
            label: "审核记录Id",
        },
        pass: {
            type: Boolean,
            label: "审核结果",
        },
        remark: {
            type: String,
            label: "备注",
            optional: true,
        },
    })),
    run({ session, recordId, pass, remark }) {
        const isAdmin = session.isAdmin === "true";
        if (!isAdmin && !CompanyDao.isMaster(session.userId, session.currentCompanyId)) {
            return ErrorJSON(ErrorCode.AUDIT.NO_ADMIN);
        }

        const record = AuditRecordDao.findOne(recordId);
        if (!record) {
            return ErrorJSON(ErrorCode.AUDIT.NOT_RECORD);
        }

        const agent = AgentRecordDao.findOne(record.refId);
        if (!agent) {
            return ErrorJSON(ErrorCode.SERVER);
        }

        const person = PersonDao.findOne(agent.userId);
        if (!person) {
            return ErrorJSON(ErrorCode.PERSON.NOBODY);
        }

        /** 认证表更新状态 */
        const status = pass ? ConstantCode.AUDIT_STATUS.FINISH : ConstantCode.AUDIT_STATUS.REJECT;
        let res = AuditRecordDao.updateSpecifiedFieldById(recordId, {
            status,
            remark,
            auditor: session.userId,
            verifyAt: new Date(),
        });
        if (!res) {
            return ErrorJSON(ErrorCode.SERVER);
        }
        /** 代理人表更新状态 */
        res = AgentRecordDao.updateSpecifiedFieldById(record.refId, {
            status: pass ? ConstantCode.AGENT_STATUS.SUCCESS : ConstantCode.AGENT_STATUS.REJECT
        });
        if (!res) {
            return ErrorJSON(ErrorCode.SERVER);
        }

        const company = CompanyDao.findOneByCompanyId(agent.companyId);
        if (!company) {
            Logger.error("获取企业出错", res);
            return ErrorJSON(ErrorCode.SERVER);
        }

        /** 代理人更新session表 **/
        if (pass) {
            res = SessionHelper.sessionUpdateByUserId(agent.userId, {
                name: company.name,
                isMaster: false,
                defaultSealId: undefined,
                currentCompanyId: company._id,
                identityState: ConstantCode.IDENTITY_STATUS.SUCCESS,
            });
            if (!res) {
                Logger.error("更新session状态表出错", res);
                return ErrorJSON(ErrorCode.SERVER);
            }
        } else {
            res = SessionHelper.updateSessionStateWithPerson(agent.userId);
            if (!res) {
                Logger.error("更新session状态表出错", res);
                return ErrorJSON(ErrorCode.SERVER);
            }
        }

        return { success: true };
    },
    restOptions: {
        url: "/audit.agent.result",
        getArgsFromRequest(req) {
            const obj = req.body;
            obj.session = req.session;
            obj.pass = obj.pass === "true";
            return [obj];
        },
    }
});

/**
 * 签章认证
 * @type {String}
 */
new ValidatedMethod({
    name: "audit.result.sealId",
    mixins: [RestMethodMixin],
    validate: validator(new SimpleSchema({
        session: {
            type: Object,
            blackbox: true,
        },
        recordId: {
            type: String,
            label: "审核记录",
        },
        pass: {
            type: Boolean,
            label: "审核结果",
        },
        remark: {
            type: String,
            label: "备注",
            optional: true,
        },
    })),
    run({ session, recordId, pass, remark }) {
        if (session.isAdmin !== "true") {
            return ErrorJSON(ErrorCode.AUDIT.NO_ADMIN);
        }

        const status = pass ? ConstantCode.AUDIT_STATUS.FINISH : ConstantCode.AUDIT_STATUS.REJECT;

        const record = AuditRecordDao.findOne(recordId);
        if (!record) {
            return ErrorJSON(ErrorCode.AUDIT.NOT_RECORD);
        }

        const seal = SealDao.findOne(record.refId);
        if (!seal) {
            return ErrorJSON(ErrorCode.SERVER);
        }

        const resultObj = { status };
        resultObj.default = !SealDao.hasDefault(seal.userId, seal.companyId);

        let res = SealDao.updateSpecifiedFieldById(record.refId, resultObj);
        if (!res) {
            return ErrorJSON(ErrorCode.SERVER);
        }

        res = AuditRecordDao.updateSpecifiedFieldById(recordId, {
            status,
            remark,
            auditor: session.userId,
            verifyAt: new Date(),
        });
        if (!res) {
            return ErrorJSON(ErrorCode.SERVER);
        }

        if (resultObj.default) {
            SessionHelper.sessionUpdateByUserId(seal.userId, { defaultSealId: seal._id });
        }

        return { success: true };
    },
    restOptions: {
        url: "/audit.result.sealId",
        getArgsFromRequest(req) {
            const obj = req.body;
            obj.session = req.session;
            obj.pass = obj.pass === "true";
            return [obj];
        },
    },
});

/**
 * TODO 转publish
 * 查看审核合约列表
 * 1. 生成基本查条件
 * 2. 若为管理员帐户
 *    1. 查询审核表
 *    2. 返回对应类型 audit 结果
 * 3. 若为公司主账户
 *    1. 查询代理人表
 *    2. 得到代理人列表信息
 *    3. 返回对应类型 agent 结果
 */
new ValidatedMethod({
    name: "audit.list",
    mixins: [RestMethodMixin],
    validate: null,
    run({ session, latest, companyId, status }) {
        const beginDate = latest ? new Date(parseInt(latest, 10)) : new Date();
        const query = {
            updatedAt: { $lt: beginDate },
        };
        if (status) {
            query.status = status;
        }

        // 管理员帐户
        if (session.isAdmin === "true") {
            // 查询审核表
            const data = AuditRecordDao.list(query, {
                sort: { updatedAt: -1 },
                fields: MongoDBHelper.fields(["refId", "accountId"], false),
                limit: 10,
            });

            return { success: true, data };
        }

        // 公司主体账户
        if (companyId && AgentRecordDao.isMaster(session.userId, companyId)) {
            // 查询代理人表
            query.companyId = companyId;
            query.isMaster = false;
            const tmpData = AgentRecordDao.find(query, {
                fields: MongoDBHelper.fields(["identityId"]),
                limit: 10,
            });
            const queryArr = tmpData.map(item => item.identityId);
            const data = AuditRecordDao.find({
                _id: { $in: queryArr }
            }, {
                sort: { updatedAt: -1 },
                fields: MongoDBHelper.fields(["refId", "accountId"], false)
            });
            return { success: true, data };
        }

        return ErrorJSON(ErrorCode.COMPANY.NO_MASTER);
    },
    restOptions: {
        url: "/audit.list",
        getArgsFromRequest(req) {
            const obj = {};
            obj.session = req.session;
            obj.latest = req.query.latest;
            obj.status = req.query.auditStatus;
            obj.companyId = req.query.companyId;
            return [obj];
        },
        httpMethod: "get",
    }
});
