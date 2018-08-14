/** 合约记录表 **/
import { Mongo } from "meteor/mongo";
import { SimpleSchema } from "meteor/aldeed:simple-schema";
import { BasicSchemaObj } from "../common/schema";

import Logger from "../../helpers/Logger";
import ConstantCode from "../../helpers/ConstantCode";

const ContractSignature = new Mongo.Collection("ContractSignature");

const SenderSchema = new SimpleSchema({
    senderPhone: {
        label: "发起人号码",
        type: String,
    },
    senderName: {
        label: "发起人姓名",
        type: String,
    },
    userName: {
        label: "发起人个人姓名",
        type: String,
    },
    senderAvatar: {
        label: "发起人头像",
        type: String,
    },
    refId: {
        label: "发起人Id",
        type: String,
    },
    type: {
        label: "签署身份",
        type: String,
        optional: true,
        allowedValues: ["Person", "Company"],
    },
});

/** 签署位置 **/
const ContractSignaturePositionSchema = new SimpleSchema({
    signatureType: { // ConstantCode.CONTRACT.SIGN_TYPE
        label: "签章类型",
        type: String,
        allowedValues: Object.values(ConstantCode.CONTRACT.SIGN_TYPE),
    },
    positionType: {
        // 定位类型，0-坐标定位，1-关键字定位，
        // 若选择关键字定位，签署类型(signType)必须指定为关键字签署才会生效。
        label: "定位类型",
        type: String,
    },
    pageIndex: { // 签署页码，若为多页签章，支持页码格式“1-3,5,8“，若为坐标定位时，不可空
        label: "签章页面",
        type: String,
        optional: true,
    },
    keyWord: { // 关键字，仅限关键字签章时有效，若为关键字定位时，不可空
        label: "关键字",
        type: String,
        optional: true,
    },
    positionX: {
        label: "定位位置X",
        type: Number,
        // min: 0,
        decimal: false,
    },
    positionY: {
        label: "定位位置Y",
        type: Number,
        // min: 0,
        decimal: false,
    },
    sealId: {
        label: "签章Id",
        type: String,
        optional: true,
    },
    showText: {
        label: "文档显示文字",
        type: String,
        optional: true,
    },
    width: {
        label: "签章宽度",
        type: Number,
        optional: true,
        decimal: false,
    },
});

/** 签署记录表 **/
const ContractSignatureSchemaObj = {
    sender: {
        label: "发起人",
        type: SenderSchema,
    },

    userId: {
        label: "签署用户Id",
        type: String,
        optional: true,
    },
    userName: {
        label: "接收人姓名",
        type: String,
        optional: true,
    },
    userPhone: {
        label: "签署用户电话做唯一标识",
        type: String,
    },
    userAvatar: {
        label: "签署人",
        type: String,
        optional: true,
    },
    companyId: {
        label: "公司Id",
        type: String,
        optional: true,
    },
    receiverName: {
        label: "接收方姓名",
        type: String,
        optional: true,
    },
    accountId: {
        label: "ESign客户Id",
        type: String,
        optional: true,
    },

    contractId: {
        label: "合约Id",
        type: String,
    },
    contractName: {
        label: "合约名",
        type: String,
    },
    contractState: {
        label: "合约状态",
        type: String,
        autoValue() {
            if (this.isInsert) {
                return ConstantCode.CONTRACT.CONTRACT_STATUS.WAIT;
            } else if (this.isUpsert) {
                return ConstantCode.CONTRACT.CONTRACT_STATUS.WAIT;
            }
            return undefined;
        },
        allowedValues: Object.values(ConstantCode.CONTRACT.CONTRACT_STATUS),
        optional: true,
    },
    signPayment: {
        label: "签署付费方式",
        type: String,
        allowedValues: Object.values(ConstantCode.CONTRACT.SIGN_PAYMENT),
        denyUpdate: true,
    },

    signState: { // ConstantCode.CONTRACT.SIGNATURE_STATE
        label: "签署状态",
        type: String,
        optional: true,
        allowedValues: Object.values(ConstantCode.CONTRACT.SIGNATURE_STATE),
    },
    confirmState: {
        label: "确认状态",
        type: String,
        optional: true,
        allowedValues: Object.values(ConstantCode.CONTRACT.CONFIRMED_STATE),
    },

    signCode: {
        label: "签署密码",
        type: String,
    },
    signPosition: {
        label: "文件签署位置",
        type: ContractSignaturePositionSchema,
        optional: true,
    },
    signFile: {
        label: "签署证明文件地址",
        type: String,
        optional: true,
    },
    signFileId: {
        label: "签署文件的ServiceId",
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

    createAt: {
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
                return true;
            }
            return undefined;
        },
        optional: true,
    },
};

Logger.info("Company init once");
Object.assign(ContractSignatureSchemaObj, BasicSchemaObj);
const ContractSignatureSchema = new SimpleSchema(ContractSignatureSchemaObj);
ContractSignature.attachSchema(ContractSignatureSchema);
export { ContractSignature, ContractSignatureSchema, ContractSignaturePositionSchema };
