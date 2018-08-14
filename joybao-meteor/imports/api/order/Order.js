/** 模板表 */
import {
    Mongo
} from "meteor/mongo";
import {
    SimpleSchema
} from "meteor/aldeed:simple-schema";
import ConstantCode from "../../helpers/ConstantCode";

const Order = new Mongo.Collection("Order");

/** 订单表 **/
const OrderSchema = new SimpleSchema({
    code: {
        label: "订单号",
        type: String
    },
    wechatCode: {
        label: "微信订单号",
        type: String,
        optional: true
    },
    userId: { // 用户ID
        label: "用户Id",
        type: String,
    },
    packageId: {
        label: "套餐id",
        type: String
    },
    company: {
        label: "所属公司信息",
        type: Object,
        optional: true
    },
    person: {
        label: "个人信息",
        type: Object,
        optional: true
    },
    userType: {
        label: "用户类型",
        type: String
    },
    targetId: {
        label: "充值的对象",
        type: String
    },
    increment: {
        label: "包含的签署次数",
        type: Number,
    },
    price: {
        label: "金额",
        type: Number,
    },
    status: {
        label: "支付状态",
        type: String,
        optional: true,
        allowedValues: Object.values(ConstantCode.ORDER.STATUS),
    },
    payAt: {
        label: "支付时间",
        type: Date,
        optional: true
    },
    errDes: {
        label: "支付失败原因",
        type: String,
        optional: true
    },
    time_start: {
        label: "交易起始时间",
        type: Date
    },
    time_expire: {
        label: "交易结束时间",
        type: Date
    },
    createAt: {
        type: Date,
        autoValue() {
            if (this.isUpsert) {
                return {
                    $setOnInsert: new Date()
                };
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
    }

});

Order.attachSchema(OrderSchema);
export {
    Order,
    OrderSchema
};
