/** 审核表 **/
import { Mongo } from "meteor/mongo";
import { SimpleSchema } from "meteor/aldeed:simple-schema";
import { BasicSchemaObj } from "../common/schema";

import Logger from "../../helpers/Logger";
import ConstantCode from "../../helpers/ConstantCode";

const AuditRecord = new Mongo.Collection("Audit");

const AuditRecordSchemaObj = {
    title: { // 企业或个人名称
        label: "标题",
        type: String,
    },
    subject: { // 实名认证,签名
        label: "审核的主题",
        type: String,
    },
    refId: { // 例如UserId CompanyId SealId 等
        label: "指向Id",
        type: String,
    },
    status: {
        label: "审核状态",
        type: String,
        allowedValues: Object.values(ConstantCode.AUDIT_STATUS),
        optional: true,
    },
    type: { // ConstantCode.AUDIT.TYPE
        label: "审核类别",
        type: String,
        allowedValues: Object.values(ConstantCode.AUDIT.TYPE),
    },
    accountId: {
        label: "易签宝返回的AccountID",
        type: String,
        optional: true,
    },
    auditorId: {
        label: "审核人Id",
        type: String,
        optional: true,
    },
    userRealName: {
        label: "用户真实姓名",
        type: String,
        optional: true,
        regEx: SimpleSchema.RegEx.PersonName,
    },
    userIDCard: {
        label: "用户身份证ID",
        type: String,
        optional: true,
        regEx: SimpleSchema.RegEx.IDCard,
    },
    verifyAt: {
        label: "审核人日期",
        type: Date,
        optional: true,
    },
    remark: {
        label: "审核备注",
        type: String,
        optional: true,
    },
    errCode: {
        label: "认证错误代码",
        type: Number,
        optional: true,
    },
    errMsg: {
        label: "认证错误原因",
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
    },
    updatedAt: {
        type: Date,
        autoValue() {
            return new Date();
        },
        optional: true,
    },
};

Logger.info("AuditRecord init once");
Object.assign(AuditRecordSchemaObj, BasicSchemaObj);
const AuditRecordSchema = new SimpleSchema(AuditRecordSchemaObj);
AuditRecord.attachSchema(AuditRecordSchema);
export { AuditRecord, AuditRecordSchema };
