/** 验证码记录表 **/
import { Mongo } from "meteor/mongo";
import { SimpleSchema } from "meteor/aldeed:simple-schema";

import ConstantCode from "../../helpers/ConstantCode";

const ValidateCode = new Mongo.Collection("ValidateCode");

const ValidateCodeSchema = new SimpleSchema({
    userId: {
        label: "用户ID",
        type: String,
        denyUpdate: true,
    },
    phone: {
        label: "手机号码",
        type: String,
        regEx: SimpleSchema.RegEx.ChinaPhone,
        denyUpdate: true,
    },
    validateCode: {
        label: "验证码",
        type: String,
        denyUpdate: true,
    },
    scene: {
        label: "场景",
        type: String,
        denyUpdate: true,
        allowedValues: Object.values(ConstantCode.SMS.SCENE),
    },
    status: {
        label: "验证码状态",
        type: String,
        autoValue() {
            if (this.isInsert) {
                return ConstantCode.MOBILE_VALIDATE_CODE.STATUS.NOT_VALIDATE;
            }
            return undefined;
        },
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
});

ValidateCode.attachSchema(ValidateCodeSchema);
export { ValidateCode, ValidateCodeSchema };
