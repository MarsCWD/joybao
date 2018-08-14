/** 单据表 **/
import { Mongo } from "meteor/mongo";
import { SimpleSchema } from "meteor/aldeed:simple-schema";

import { BasicSchemaObj } from "../common/schema";
import Logger from "../../helpers/Logger";

const SaleAgreement = new Mongo.Collection("SaleAgreement");

/** 单据表 **/
const SaleAgreementSchemaObj = {
    startLinker: {
        label: "发货人",
        type: String,
    },
    startLinkerId: {
        label: "发货人id",
        type: String,
    },
    startTel: {
        label: "发货人电话",
        type: String,
        regEx: SimpleSchema.RegEx.ChinaPhone,
    },
    startAddr: {
        label: "发货地",
        type: String,
    },

    endLinker: {
        label: "收货人",
        type: String,
    },
    endTel: {
        label: "收货人电话",
        type: String,
    },
    endAddr: {
        label: "收货地",
        type: String,
    },

    product: {
        label: "货物",
        type: String,
    },
    logisticsId: {
        label: "承运企业id", // 优运系统
        type: String,
    },
    remark: {
        label: "备注",
        type: String,
        optional: true,
    },
};

Logger.info("SaleAgreement init once");
Object.assign(SaleAgreementSchemaObj, BasicSchemaObj);
const SaleAgreementSchema = new SimpleSchema(SaleAgreementSchemaObj);
Object.assign(SaleAgreementSchema, BasicSchemaObj);
SaleAgreement.attachSchema(SaleAgreementSchema);

export { SaleAgreement, SaleAgreementSchema };
