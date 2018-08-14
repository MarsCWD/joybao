/** 企业信息 */
import { Mongo } from "meteor/mongo";
import { SimpleSchema } from "meteor/aldeed:simple-schema";
import { BasicSchemaObj } from "../common/schema";

import Logger from "../../helpers/Logger";
import ConstantCode from "../../helpers/ConstantCode";

const Company = new Mongo.Collection("Company");

/** 企业信息 */
const CompanySchemaObj = {
    name: {
        label: "企业名称",
        type: String,
        unique: true,
    },
    OrgCode: {
        label: "统一信用代码或注册号",
        type: String,
    },
    codeORG: {
        label: "组织机构代码", // 组织机构代码
        type: String,
        optional: true,
        regEx: SimpleSchema.RegEx.CodeORG,
    },
    codeUSC: {
        label: "社会统一信用代码",
        type: String,
        optional: true,
        regEx: SimpleSchema.RegEx.CodeUSC,
    },
    codeNO: {
        label: "注册号",
        type: String,
        optional: true,
        regEx: SimpleSchema.RegEx.CodeNO,
    },
    regType: {
        label: "注册方式",
        type: String,
        allowedValues: Object.values(ConstantCode.COMPANY.REG_TYPE),
    },
    legalName: {
        label: "法人姓名",
        type: String,
        regEx: SimpleSchema.RegEx.PersonName,
    },
    legalID: {
        label: "法人身份证号", // 法人认证时必须
        type: String,
        optional: true,
        regEx: SimpleSchema.RegEx.IDCard,
    },
    agentName: {
        label: "代理人姓名", // 代理人认证时必须
        type: String,
        optional: true,
        regEx: SimpleSchema.RegEx.PersonName,
    },
    agentID: {
        label: "代理人身份证号", // 代理人认证时必须
        type: String,
        optional: true,
        regEx: SimpleSchema.RegEx.IDCard,
    },
    certificateId: {
        label: "代理人证书文件ID", // 代理人认证时必须
        type: String,
        optional: true,
    },
    userType: { // 1-代理人注册，2-法人注册
        label: "注册人类型",
        type: String,
        allowedValues: ["1", "2"],
    },

    license: {
        label: "营业执照照片",
        type: String,
        optional: true,
    },

    mainAccountId: {
        label: "主账户ID",
        type: String,
    },
    identityId: {
        label: "认证信息ID",
        type: String,
        optional: true,
    },
    identityState: {
        label: "认证状态",
        type: String,
        autoValue() {
            if (this.isInsert) {
                return ConstantCode.IDENTITY_STATUS.IN_PROCESSING;
            } else if (this.isUpsert) {
                return { $setOnInsert: ConstantCode.IDENTITY_STATUS.IN_PROCESSING };
            }
            return undefined;
        },
        allowedValues: Object.values(ConstantCode.IDENTITY_STATUS),
        optional: true,
    },
    accountId: {
        label: "企业帐号注册完成后的accountId",
        type: String,
        optional: true,
    },

    signatureNumber: {
        label: "签署次数",
        type: Number,
        optional: true,
        min: 0,
    },
    lockSignatureNumber: {
        label: "冻结的签署次数",
        type: Number,
        optional: true,
        min: 0,
    },

    source: {
        label: "企业注册来源",
        type: String,
        optional: true,
        allowedValues: Object.values(ConstantCode.COMPANY.SOURCE),
    },
    defaultSealId: {
        label: "默认签章", // 第三方企业用
        type: String,
        optional: true,
    },
    phone: {
        label: "联系电话", // 第三方企业用
        type: String,
        optional: true,
        regEx: SimpleSchema.RegEx.ChinaPhone,
    },
    logisticsId: {
        label: "承运企业Id", // 第三方企业用
        type: String,
        optional: true,
    },

    createdAt: {
        type: Date,
        autoValue() {
            if (this.isInsert) {
                return new Date();
            } else if (this.isUpsert) {
                return { $setOnInsert: new Date() };
            }

            this.unset();
            return undefined;
        },
        denyUpdate: true,
        optional: true,
    },
    updatedAt: {
        type: Date,
        autoValue() {
            return new Date();
        },
        optional: true,
    },
    isActive: {
        type: Boolean,
        autoValue() {
            if (this.isInsert) {
                return true;
            } else if (this.isUpsert) {
                return { $setOnInsert: true };
            }
            return undefined;
        },
        optional: true,
    },
};

Logger.info("Company init once");
Object.assign(CompanySchemaObj, BasicSchemaObj);
const CompanySchema = new SimpleSchema(CompanySchemaObj);
Company.attachSchema(CompanySchema);
export { Company, CompanySchema };
