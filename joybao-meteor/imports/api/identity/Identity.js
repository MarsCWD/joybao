/** 企业认证记录表 **/
import { Mongo } from "meteor/mongo";
import { SimpleSchema } from "meteor/aldeed:simple-schema";

const Identity = new Mongo.Collection("Identity");

const IdentitySchema = new SimpleSchema({
    type: {
        label: `验证方式 1:人工对公打款 2:自动对公打款
            3:银行卡四要素 4:人脸和身份证识别`,
        type: Number,
    },
    errCode: {
        label: "认证错误码",
        type: Number,
        optional: true
    },
    msg: {
        label: "认证错信息",
        type: String,
        optional: true
    },
    submitAt: {
        label: "认证发起时间",
        type: Date
    },
    expiryAt: {
        label: "认证有效时间",
        type: Date
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
});

Identity.attachSchema(IdentitySchema);
export default Identity;
