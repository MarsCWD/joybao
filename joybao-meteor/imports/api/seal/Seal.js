/** 签章表 **/
import { Mongo } from "meteor/mongo";
import { SimpleSchema } from "meteor/aldeed:simple-schema";
import ConstantCode from "../../helpers/ConstantCode";

const Seal = new Mongo.Collection("Seal");

const SealSchema = new SimpleSchema({
    auditId: {
        label: "审核记录Id",
        type: String,
        optional: true,
    },
    userId: { // 用户ID
        label: "用户Id",
        type: String,
        optional: true,
    },
    companyId: { // 关联的企业ID
        label: "企业Id",
        type: String,
        optional: true,
    },
    accountId: {
        label: "关联的账户Id",
        type: String,
        optional: true,
    },
    default: {
        label: "是否默认签章",
        type: Boolean,
        optional: true,
    },
    sealData: { // 最终的签章结果
        label: "签章图片",
        type: String,
        optional: true,
    },
    templateType: { // 模板类型 ConstantCode.SEAL
        label: "签章模板类型",
        type: String,
    },
    imgB64: {
        label: "手绘印章图片",
        type: String,
        optional: true,
    },
    base64: {
        label: "Base64",
        type: Buffer,
        optional: true,
    },
    status: {
        label: "签章状态",
        type: String,
        optional: true,
        allowedValues: Object.values(ConstantCode.AUDIT_STATUS),
    },
    createdAt: {
        type: Date,
        autoValue() {
            if (this.isInsert) {
                return new Date();
            } else if (this.isUpsert) {
                return { $setOnInsert: new Date() };
            }
            this.unset(); // Prevent user from supplying their own value
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
});

Seal.attachSchema(SealSchema);
export { Seal, SealSchema };
