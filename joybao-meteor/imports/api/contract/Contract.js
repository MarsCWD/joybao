/** 合约记录表 **/
import { Mongo } from "meteor/mongo";
import { SimpleSchema } from "meteor/aldeed:simple-schema";
import { BasicSchemaObj } from "../common/schema";

import Logger from "../../helpers/Logger";
import ConstantCode from "../../helpers/ConstantCode";

const Contract = new Mongo.Collection("Contract");

/** 发起方个人资料 */
const SenderSchema = new SimpleSchema({
    userId: {
        label: "合约个人ID",
        type: String,
        optional: true,
    },
    userName: {
        label: "合约个人名",
        type: String,
    },
    userPhone: {
        label: "合约个人联系方式",
        type: String,
        regEx: SimpleSchema.RegEx.ChinaPhone,
    },
    avatar: {
        label: "合约个人头像",
        type: String,
        optional: true,
    },
    type: {
        label: "签署身份",
        type: String,
        optional: true,
        allowedValues: ["Person", "Company"],
    },
    isMaster: {
        label: "是否是主体账户",
        type: Boolean,
        optional: true,
    },
    companyId: {
        label: "签署的公司ID",
        type: String,
        optional: true,
    },
    companyName: {
        label: "签署的公司名",
        type: String,
        optional: true,
    },
});

/** 合约个人资料 */
const ContractPersonSchema = new SimpleSchema({
    userId: {
        label: "合约个人ID",
        type: String,
        optional: true,
    },
    userName: {
        label: "合约个人名",
        type: String,
    },
    userPhone: {
        label: "合约个人联系方式",
        type: String,
        regEx: SimpleSchema.RegEx.ChinaPhone,
    },
    avatar: {
        label: "合约个人头像",
        type: String,
        optional: true,
    },
    type: {
        label: "签署身份",
        type: String,
        optional: true,
        allowedValues: ["Person", "Company"],
    },
    isMaster: {
        label: "是否是主体账户",
        type: Boolean,
        optional: true,
    },
    companyId: {
        label: "签署的公司ID",
        type: String,
        optional: true,
    },
    companyName: {
        label: "签署的公司名",
        type: String,
        optional: true,
    },
    signState: { // ConstantCode.CONTRACT.SIGNATURE_STATE
        label: "签署状态",
        type: String,
        allowedValues: Object.values(ConstantCode.CONTRACT.SIGNATURE_STATE),
        optional: true,
        autoValue() {
            if (this.isInsert) {
                return ConstantCode.CONTRACT.SIGNATURE_STATE.NEED_SIGNED;
            }
            return undefined;
        },
    },
    confirmState: { // ConstantCode.CONTRACT.CONFIRMED_STATE
        label: "确认状态",
        type: String,
        allowedValues: Object.values(ConstantCode.CONTRACT.CONFIRMED_STATE),
        optional: true,
        autoValue() {
            if (this.isInsert) {
                return ConstantCode.CONTRACT.CONFIRMED_STATE.NEED_CONFIRMED;
            }
            return undefined;
        },
    },
    property: { // 签署顺序由大及小 从1 开始
        label: "签署顺序",
        type: Number,
    },
    updatedAt: {
        label: "签署或确认时间",
        type: Date,
        optional: true,
    },
});

/** 责任人 */
const DutyPersonSchema = new SimpleSchema({
    userName: {
        label: "用户名",
        type: String,
    },
    userPhone: {
        label: "用户联系方式",
        type: String,
    },
});

/** 附件表 */
const AnnexSchema = new SimpleSchema({
    name: {
        label: "附件名",
        type: String,
    },
    path: {
        label: "附件的文件路径",
        type: String,
    },
});

/** 字段表 */
const FiledMapSchema = new SimpleSchema({
    filedName: {
        label: "字段名",
        type: String,
    },
    filedValue: {
        label: "字段值",
        type: String,
    },
});

/** 合约表 */
const ContractSchemaObj = {
    name: {
        label: "合约名",
        type: String,
    },
    sender: {
        label: "发起人",
        type: SenderSchema,
        optional: true,
    },
    receivers: {
        label: "收件人",
        type: [ContractPersonSchema],
    },
    duties: {
        label: "责任人",
        type: DutyPersonSchema,
    },

    contractTemplateId: {
        label: "合同模板Id",
        type: String,
        optional: true,
    },
    contractTemplateName: {
        label: "合同模板名",
        type: String,
        optional: true,
    },
    fields: {
        label: "字段值",
        type: [FiledMapSchema],
        optional: true,
    },

    signCount: {
        label: "已签约数量",
        type: Number,
        optional: true,
        autoValue() {
            if (this.isInsert) {
                return 0;
            } else if (this.isUpsert) {
                return { $setOnInsert: 0 };
            }

            return undefined;
        },
    },
    confirmCount: {
        label: "已确认数量",
        type: Number,
        optional: true,
        autoValue() {
            if (this.isInsert) {
                return 0;
            } else if (this.isUpsert) {
                return { $setOnInsert: 0 };
            }

            return undefined;
        },
    },

    signPayment: {
        label: "签署付费方式",
        type: String,
        allowedValues: Object.values(ConstantCode.CONTRACT.SIGN_PAYMENT),
        denyUpdate: true,
    },
    status: { // ConstantCode.CONTRACT.CONTRACT_STATUS
        label: "合约状态",
        type: String,
        optional: true,
        allowedValues: Object.values(ConstantCode.CONTRACT.CONTRACT_STATUS),
        autoValue() {
            if (this.isInsert) {
                return ConstantCode.CONTRACT.CONTRACT_STATUS.WAIT;
            } else if (this.isUpsert) {
                return { $setOnInsert: ConstantCode.CONTRACT.CONTRACT_STATUS.WAIT };
            }
            return undefined;
        },
    },
    payment: { // ConstantCode
        label: "付款方式",
        type: String,
        allowedValues: Object.values(ConstantCode.CONTRACT.PAY_MENT),
        optional: true,
    },
    annex: {
        label: "附件",
        type: [AnnexSchema],
    },

    signEndAt: {
        label: "签约截止日期",
        type: Date,
    },
    acceptanceAt: {
        label: "验收日期",
        type: Date,
        optional: true,
    },
    paymentAt: {
        label: "付款截止日期",
        type: Date,
        optional: true,
    },

    contractServiceId: {
        label: "最新的易签宝签署ServiceId",
        type: String,
        optional: true,
    },
};

Logger.info("Contract init once");
Object.assign(ContractSchemaObj, BasicSchemaObj);
const ContractSchema = new SimpleSchema(ContractSchemaObj);
Contract.attachSchema(ContractSchema);
export { Contract, ContractSchema, ContractPersonSchema };
