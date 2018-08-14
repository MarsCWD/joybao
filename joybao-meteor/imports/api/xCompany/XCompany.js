/**
 * Created by Yifeng.Shen on 2017/7/24.
 */
/** 企业信息 */
import { Mongo } from "meteor/mongo";
import { SimpleSchema } from "meteor/aldeed:simple-schema";

import ConstantCode from "../../helpers/ConstantCode";

const XCompany = new Mongo.Collection("XCompany");

/** 企业信息 **/
const XCompanySchema = new SimpleSchema({
    name: {
        label: "企业名称",
        type: String,
        unique: true,
    },
    codeORG: {
        label: "组织机构代码",
        type: String,
        optional: true,
        // regEx: SimpleSchema.RegEx.CodeORG,
    },
    status: {
        label: "经营状况",
        type: String,
        optional: true,
    },
    startTime: {
        label: "成立时间",
        type: String,
        optional: true,
    },
    address: {
        label: "注册地址",
        type: String,
        optional: true,
    },
    codeUSC: {
        label: "社会统一信用代码",
        type: String,
        // unique: true,
        optional: true,
        // regEx: SimpleSchema.RegEx.CodeUSC,
    },
    codeNO: {
        label: "企业注册号",
        type: String,
        optional: true,
    },
    OrgCode : {
        label:"信用代码或企业注册号",
        type: String,
        optional: true
    },
    legalName: {
        label: "法人姓名",
        type: String,
        optional: true,
        // regEx: SimpleSchema.RegEx.PersonName,
    },
    legalID: {
        label: "法人身份证号",
        type: String,
        optional: true,
        // regEx: SimpleSchema.RegEx.IDCard,
    },
    bankCardName: {
        label: "对公账户户名（一般来说即企业名称）",
        type: String,
        optional: true,
    },
    cardNo: {
        label: "企业对公银行账号",
        type: String,
        optional: true,
        // regEx: SimpleSchema.RegEx.BankCard,
    },
    bank: {
        label: "企业银行账号开户行名称",
        type: String,
        optional: true,
    },
    provice: {
        label: "企业银行账号开户行所在省份",
        type: String,
        optional: true,
    },
    city: {
        label: "企业银行账号开户行所在城市",
        type: String,
        optional: true,
    },
    bankBranch: {
        label: "企业银行账号开户行支行全称",
        type: String,
        optional: true,
    },
    license: {
        label: "营业执照照片",
        type: String,
        optional: true,
    },
    rawData: {
        label: "原始数据",
        type: [Object],
        blackbox: true
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
        // denyUpdate: true,
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
});

XCompany.attachSchema(XCompanySchema);
export { XCompany, XCompanySchema };
