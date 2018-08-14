import { RestMethodMixin } from "meteor/simple:rest-method-mixin";
import { SimpleSchema } from "meteor/aldeed:simple-schema";

import ValidatedMethod from "../../imports/helpers/CustomValidatedMethod";
import validator from "../../imports/helpers/simple-schema-validator";

import AuditRecordDao from "../../imports/api/audit/dao";
import SealDao from "../../imports/api/seal/dao";
import { SealSchema } from "../../imports/api/seal/Seal";

import SessionHelper from "../collections/session";
import MongoDBHelper from "../../imports/helpers/MongoDBHelper";
import ConstantCode from "../../imports/helpers/ConstantCode";
import { ErrorCode, ErrorJSON } from "../../imports/helpers/ErrorJson";

/**
 * 生成签章
 */
new ValidatedMethod({
    name: "seal.new",
    mixins: [RestMethodMixin],
    validate: validator(new SimpleSchema({
        session: {
            type: Object,
            blackbox: true,
        },
        sealObj: {
            label: "签章信息",
            type: SealSchema,
        }
    })),
    run({ session, sealObj }) {
        const saveObj = sealObj;
        let needUpdateDefaultSealId = false; // 是否需要更新默认签章
        if (session.identityState !== ConstantCode.IDENTITY_STATUS.SUCCESS) {
            return ErrorJSON(ErrorCode.PERSON.UNEXISTED);
        }

        if (session.currentCompanyId) {
            if (saveObj.templateType !== ConstantCode.SEAL.TYPE.COMPANY_PHOTO &&
                saveObj.templateType !== ConstantCode.SEAL.TYPE.COMPANY_SEAL) {
                return ErrorJSON(ErrorCode.SEAL.NOT_MATCH);
            }
        } else if (saveObj.templateType !== ConstantCode.SEAL.TYPE.PERSON_PHOTO &&
            saveObj.templateType !== ConstantCode.SEAL.TYPE.PERSON_SEAL &&
            saveObj.templateType !== ConstantCode.SEAL.TYPE.PERSON_SIGNATURE) {
            return ErrorJSON(ErrorCode.SEAL.NOT_MATCH);
        }
        saveObj.default = false;

        /** 若当前公司签章数目超过5 **/
        if (SealDao.count(session.userId, session.currentCompanyId) >= 5) {
            return ErrorJSON(ErrorCode.SEAL.OVER_MAX);
        }

        /** 若是公司签章 **/
        if (session.currentCompanyId) {
            saveObj.companyId = session.currentCompanyId;
        }

        /** TODO 图片需要验证文件路径的合法性 **/
        saveObj.userId = session.userId;

        /** 如果是模板印章 **/
        if (saveObj.templateType === ConstantCode.SEAL.TYPE.PERSON_SEAL || saveObj.templateType === ConstantCode.SEAL.TYPE.COMPANY_SEAL) {
            saveObj.status = ConstantCode.AUDIT_STATUS.FINISH;
            saveObj.sealData = saveObj.imgB64;
        } else {
            saveObj.status = ConstantCode.AUDIT_STATUS.IN_PROCESSING;
        }

        /** 若无默认签章 **/
        const hasDefault = !!session.defaultSealId;
        if (!hasDefault && saveObj.status === ConstantCode.AUDIT_STATUS.FINISH) {
            saveObj.default = true;
            needUpdateDefaultSealId = true;
        }

        /** 签章插入 **/
        const sealId = SealDao.insert(saveObj);
        if (!sealId) {
            return ErrorJSON(ErrorCode.SERVER);
        }

        /** 若无默认签章 **/
        if (needUpdateDefaultSealId) {
            const res = SessionHelper.sessionUpdate(session.token, { defaultSealId: sealId });
            if (!res) {
                return ErrorJSON(ErrorCode.SERVER);
            }
        }

        /** 加入审核表 **/
        if (saveObj.status !== ConstantCode.AUDIT_STATUS.FINISH) {
            const audit = {
                title: session.name,
                subject: ConstantCode.AUDIT.SUBJECT.SEAL,
                refId: sealId,
                type: ConstantCode.AUDIT.TYPE.SEAL,
                status: ConstantCode.AUDIT_STATUS.IN_PROCESSING,
            };

            const auditId = AuditRecordDao.insert(audit);
            if (!auditId) {
                return ErrorJSON(ErrorCode.SERVER);
            }

            const res = SealDao.updateSpecifiedFieldById(sealId, { auditId });
            if (!res) {
                return ErrorJSON(ErrorCode.SERVER);
            }
        }

        return { success: true, data: { sealId } };
    },
    restOptions: {
        url: "/seal.new",
        getArgsFromRequest(req) {
            const obj = {};
            obj.sealObj = req.body;
            obj.session = req.session;
            return [obj];
        },
    },
});

/**
 * TODO 转publish
 * 获取当前用户的签章
 */
new ValidatedMethod({
    name: "seal.list",
    mixins: [RestMethodMixin],
    validate: null,
    run({ session }) {
        const data = SealDao.list(session.userId, session.currentCompanyId, {
            fields: MongoDBHelper.fields(["_id", "sealData", "imgB64", "status", "updatedAt"]),
            sort: { updatedAt: -1 }
        });
        return { success: true, data };
    },
    restOptions: {
        url: "/seal.list",
        getArgsFromRequest(req) {
            const obj = {};
            obj.session = req.session;
            return [obj];
        },
        httpMethod: "get",
    }
});

/**
 * 更换默认签章
 * 1. 当前用户已处于认证成功状态
 * 2. 如果该签名存在且已通过认证
 * 3. 更新签名
 * 4. 更新用户的默认签名Id
 */
new ValidatedMethod({
    name: "seal.change",
    mixins: [RestMethodMixin],
    validate: null,
    run({ session, newId }) {
        if (session.defaultSealId === newId) {
            return ErrorJSON(ErrorCode.SEAL.IS_DEFAULT);
        }

        /** 判断新签章 **/
        const obj = SealDao.findUserSealId(session.userId, session.currentCompanyId, newId);
        if (!obj) {
            return ErrorJSON(ErrorCode.SEAL.NOT_CURRENT_USER);
        } else if (obj.status !== ConstantCode.AUDIT_STATUS.FINISH) {
            return ErrorJSON(ErrorCode.SEAL.NOT_PASS);
        }

        let res;
        if (session.defaultSealId) {
            res = SealDao.updateSpecifiedFieldById(session.defaultSealId, { default: false });
            if (!res) {
                return ErrorJSON(ErrorCode.SERVER);
            }
        }
        res = SealDao.updateSpecifiedFieldById(newId, { default: true });
        if (!res) {
            return ErrorJSON(ErrorCode.SERVER);
        }

        res = SessionHelper.sessionUpdate(session.token, { defaultSealId: newId });
        if (!res) {
            return ErrorJSON(ErrorCode.SERVER);
        }

        return { success: true };
    },
    restOptions: {
        url: "/seal.change",
        getArgsFromRequest(req) {
            const obj = req.body;
            obj.session = req.session;
            return [obj];
        },
    }
});

new ValidatedMethod({
    name: "seal.view",
    mixins: [RestMethodMixin],
    validate: null,
    run({ session }) {
        const data = SealDao.findUserSealId(session.userId, session.currentCompanyId, session.defaultSealId, {
            fields: MongoDBHelper.fields(["sealData", "base64", "status"])
        });
        if (!data) {
            return ErrorJSON(ErrorCode.SEAL.NOT_CURRENT_USER);
        } else if (data.status !== ConstantCode.AUDIT_STATUS.FINISH) {
            return ErrorJSON(ErrorCode.SEAL.NOT_PASS);
        }

        if (data.base64) {
            const buffers = new Buffer(data.base64);
            data.base64 = buffers.toString("base64");
        }

        return { success: true, data };
    },
    restOptions: {
        url: "/seal.view",
        httpMethod: "get",
        getArgsFromRequest(req) {
            const obj = {};
            obj.session = req.session;
            return [obj];
        },
    }
});

/**
 * joybao client调用 根据签章Id获取签章
 */
new ValidatedMethod({
    name: "seal.view.joybao",
    mixins: [RestMethodMixin],
    validate: null,
    run({ sealId, userId, companyId }) {
        const data = SealDao.findUserSealId(userId, companyId, sealId, {
            fields: MongoDBHelper.fields(["sealData", "base64", "status"])
        });
        if (!data) {
            return ErrorJSON(ErrorCode.SEAL.NOT_CURRENT_USER);
        } else if (data.status !== ConstantCode.AUDIT_STATUS.FINISH) {
            return ErrorJSON(ErrorCode.SEAL.NOT_PASS);
        }

        if (data.base64) {
            const buffers = new Buffer(data.base64);
            data.base64 = buffers.toString("base64");
        }

        return { success: true, data };
    },
    restOptions: {
        url: "/seal.view.joybao",
        httpMethod: "get",
        getArgsFromRequest(req) {
            const obj = {};
            obj.sealId = req.query.sealId;
            obj.userId = req.query.userId;
            obj.companyId = req.query.companyId;
            return [obj];
        },
    }
});

/**
 * 删除签章
 * 1. 判断当前签章是否属于该用户
 * 2. 检查该签章是否是默认签章
 * 3. 移除签章
 */
new ValidatedMethod({
    name: "seal.delete",
    mixins: [RestMethodMixin],
    validate: null,
    run({ session, sealId }) {
        if (sealId === session.defaultSealId) {
            return ErrorJSON(ErrorCode.SEAL.IS_DEFAULT);
        }

        const obj = SealDao.findUserSealId(session.userId, session.currentCompanyId, sealId, {
            fields: MongoDBHelper.fields(["sealData", "status"])
        });
        if (!obj) {
            return ErrorJSON(ErrorCode.SEAL.NOT_CURRENT_USER);
        }

        const res = SealDao.remove(sealId);
        if (!res) {
            return ErrorJSON(ErrorCode.SERVER);
        }

        return { success: true };
    },
    restOptions: {
        url: "/seal.delete",
        httpMethod: "get",
        getArgsFromRequest(req) {
            const obj = {};
            obj.session = req.session;
            obj.sealId = req.query.sealId;
            return [obj];
        },
    },
});
