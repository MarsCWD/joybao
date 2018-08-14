/** 个人账目表 */
import { Mongo } from "meteor/mongo";
import { SimpleSchema } from "meteor/aldeed:simple-schema";
import { BasicSchemaObj, RelationSchema, ContractSchema } from "../common/schema";

import Logger from "../../helpers/Logger";
import ConstantCode from "../../helpers/ConstantCode";

const Bill = new Mongo.Collection("Bill");

const BillSchemaObj = {
    userId: {
        label: "用户Id",
        type: String,
        optional: true,
    },
    amount: {
        label: "发货/采购金额",
        type: Number,
    },
    backMoney: {
        label: "回款金额",
        type: Number,
    },
    returnGoods: {
        label: "退货金额",
        type: Number,
    },
    type: { // 支出 收入 e.g
        label: "账目类型",
        type: String,
        allowedValues: Object.values(ConstantCode.BILL.TYPE),
    },
    sort: { // 具体的收入 支出
        label: "分类",
        type: String,
    },
    shipTime: {
        label: "发货时间",
        type: Date,
    },
    backTime: {
        label: "回款时间",
        type: Date,
    },
    contract: {
        label: "关联的合约",
        type: ContractSchema,
        optional: true,
    },
    relation: {
        label: "客户",
        type: RelationSchema,
    },
    name: {
        label: "账目名",
        type: String,
    },
    remark: {
        label: "备注",
        type: String,
        optional: true,
    },

    year: {
        type: Number,
        label: "年",
    },
    month: {
        type: Number,
        label: "月",
    },
    date: {
        type: Number,
        label: "日",
    },

    debitId: { // 由Job生成对账 并填入对应的Id
        type: String,
        label: "所属对账Id",
        optional: true,
    },
};

Logger.info("Bill init once");
Object.assign(BillSchemaObj, BasicSchemaObj);
const BillSchema = new SimpleSchema(BillSchemaObj);
Bill.attachSchema(BillSchema);
export { Bill, BillSchema };
