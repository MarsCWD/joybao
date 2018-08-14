import { RestMethodMixin } from "meteor/simple:rest-method-mixin";
import { SimpleSchema } from "meteor/aldeed:simple-schema";

import validator from "../../imports/helpers/simple-schema-validator";
import ValidatedMethod from "../../imports/helpers/CustomValidatedMethod";

import { BillDao, DebitDao } from "../../imports/api/bill/dao";
import { ContractSignatureDao } from "../../imports/api/contract/dao";

import { BillSchema } from "../../imports/api/bill/Bill";

import { ErrorCode, ErrorJSON } from "../../imports/helpers/ErrorJson";

import Logger from "../../imports/helpers/Logger";
import ServerConfigDao from "../../imports/api/config/dao";

import MongoDBHelper from "../../imports/helpers/MongoDBHelper";

const BillSort = ServerConfigDao.findOne("Bill").value.sort;

/**
 * 生成新的账目
 * 1. 判断当前用户是否已经完成认证
 * 2. 若有合约单号,则检查合约是否已经存在 并且该用户需参与到该合约中
 * 3. TODO 合约分类检查
 * 4. 为账目添加一些默认属性
 * 5. TODO 添加短信提醒(需要实现短信 Job?)
 */
new ValidatedMethod({
    name: "bill.new",
    mixins: [RestMethodMixin],
    validate: validator(new SimpleSchema({
        session: {
            type: Object,
            blackbox: true,
        },
        bill: {
            label: "账目内容",
            type: BillSchema,
        },
    })),
    run({ session, bill }) {
        // 若有合约单号
        if (bill.contract) {
            // 当前用户是否参与该合约
            let record = ContractSignatureDao.findOne(session.phone, bill.contract.contractId);
            if (!record) {
                return ErrorJSON(ErrorCode.CONTRATCT.NOT_SIGNATURE_RECORD);
            }

            // 当前客户是否参与该合约
            record = ContractSignatureDao.findOne(bill.relation.userPhone, bill.contract.contractId);
            if (!record) {
                return ErrorJSON(ErrorCode.CONTRATCT.NO_RECEIVER);
            }
        }

        const billObj = bill;
        billObj.userId = session.userId;

        const data = BillDao.insert(billObj);
        if (!data) {
            return ErrorJSON(ErrorCode.SERVER);
        }

        return { success: true, data };
    },
    restOptions: {
        url: "/bill.new",
        getArgsFromRequest(req) {
            const obj = req.body;
            obj.session = req.session;
            try {
                obj.bill = JSON.parse(obj.bill);
            } catch (e) {
                const err = new Meteor.Error("Invalid json string", "Invalid json string");
                err.statusCode = 400;
                throw err;
            }
            return [obj];
        },
    },
});

/**
 * 查看现有的账单列表 和 账本信息
 * 1. 生成查询条件
 * 2. 查找对应的账目记录
 * 3. 查找对应的对账记录
 */
new ValidatedMethod({
    name: "bill.list",
    mixins: [RestMethodMixin],
    validate: null,
    run({ session, year, month }) {
        if (isNaN(year) || year < 2000 || year > 3000) {
            return ErrorJSON(ErrorCode.BILL.NO_YEAR);
        }

        // 构造日期查询条件
        const query = { userId: session.userId, year };
        if (!isNaN(month)) {
            if (month > 12 || month < 1) {
                return ErrorJSON(ErrorCode.NO_MONTH);
            }
            query.month = month;
        }

        const bills = BillDao.find(query, { limit: 10, sort: { updatedAt: -1 } });
        const debits = DebitDao.find(query, { limit: 10, sort: { updatedAt: -1 } });
        return { success: true, data: { bills, debits } };
    },
    restOptions: {
        url: "/bill.list",
        getArgsFromRequest(req) {
            const obj = {};
            obj.session = req.session;
            obj.year = parseInt(req.query.year, 10);
            obj.month = parseInt(req.query.month, 10);
            return [obj];
        },
        httpMethod: "get",
    },
});

/**
 * 查看账目分类
 */
new ValidatedMethod({
    name: "bill.sort.list",
    mixins: [RestMethodMixin],
    validate: null,
    run() {
        return { success: true, data: BillSort };
    },
    restOptions: { url: "/bill.sort.list", httpMethod: "get" },
});

/**
 * 记账删除接口
 * 1. 判断当前用户拥有这条账目记录
 * 2. 将该记录 isActive 置为 false
 */
new ValidatedMethod({
    name: "bill.delete",
    mixins: [RestMethodMixin],
    validate: validator(new SimpleSchema({
        session: {
            type: Object,
            blackbox: true,
        },
        billId: {
            label: "记录Id",
            type: String,
        },
    })),
    run({ session, billId }) {
        if (!BillDao.hasBill(session.userId, billId)) {
            return ErrorJSON(ErrorCode.BILL.NO_BILL_BELONG);
        }

        const res = BillDao.remove(billId);
        if (!res) {
            return ErrorJSON(ErrorCode.SERVER);
        }

        return { success: true };
    },
    restOptions: {
        url: "/bill.delete",
        getArgsFromRequest(req) {
            const obj = req.body;
            obj.session = req.session;
            return [obj];
        },
    },
});

/**
 * TODO 查看对账的详细明细
 */
new ValidatedMethod({
    name: "debit.view",
    mixins: [RestMethodMixin],
    validate: validator(new SimpleSchema({
        session: {
            type: Object,
            blackbox: true,
        },
        debitId: {
            label: "对账Id",
            type: String,
        },
    })),
    run({ session, debitId }) {
        if (!DebitDao.hasDebit(session.userId, debitId)) {
            return ErrorJSON(ErrorCode.BILL.NO_DEBIT_BELONG);
        }

        const data = BillDao.list(debitId, {
            fields: MongoDBHelper.fields(["userId"], false),
        });

        return { success: true, data };
    },
    restOptions: {
        url: "/debit.view",
        httpMethod: "get",
        getArgsFromRequest(req) {
            const obj = {};
            obj.session = req.session;
            obj.debitId = req.query.debitId;
            return [obj];
        },
    },
});
