/** 对账明细 */
import { Mongo } from "meteor/mongo";
import { SimpleSchema } from "meteor/aldeed:simple-schema";
import { BasicSchemaObj, RelationSchema } from "../common/schema";

import Logger from "../../helpers/Logger";

const Debit = new Mongo.Collection("Debit");

const DebitSchemaObj = {
    userId: {
        label: "用户Id",
        type: String,
    },
    userPhone: {
        label: "用户手机号码",
        type: String,
    },

    relation: {
        label: "客户对象",
        type: RelationSchema,
    },

    income: {
        label: "收入金额",
        type: Number,
    },
    pay: {
        label: "支出金额",
        type: Number,
    },

    year: {
        type: Number,
        label: "年",
        optional: true,
    },
    month: {
        type: Number,
        label: "月",
        optional: true,
    },
};

Logger.info("Debit init once");
Object.assign(DebitSchemaObj, BasicSchemaObj);
const DebitSchema = new SimpleSchema(DebitSchemaObj);
Debit.attachSchema(DebitSchema);
export { Debit, DebitSchema };
