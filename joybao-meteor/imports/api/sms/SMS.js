/** 短信发送队列 **/
import { Mongo } from "meteor/mongo";
import { SimpleSchema } from "meteor/aldeed:simple-schema";

import ConstantCode from "../../helpers/ConstantCode";

const SMS = new Mongo.Collection("SMS");

const SMSSchema = new SimpleSchema({
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
    params: {
        type: String,
        label: "发送内容", // 以模板形式存储
    },
    templateId: {
        type: String,
        label: "短信模板Id", // 阿里云对应的模板Id
    },
    scene: {
        label: "场景",
        type: String,
        denyUpdate: true,
        allowedValues: Object.values(ConstantCode.SMS.SCENE),
    },
    state: {
        type: String,
        label: "当前状态",
        allowedValues: Object.values(ConstantCode.SMS.STATE),
        autoValue() {
            if (this.isInsert) {
                return ConstantCode.SMS.STATE.WAIT;
            } else if (this.isUpsert) {
                return { $setOnInsert: ConstantCode.SMS.STATE.WAIT };
            }
            return undefined;
        },
    },
    errorCode: {
        type: String,
        label: "发送错误状态码",
        optional: true,
    },
    erorrMsg: {
        type: String,
        label: "发送错误信息",
        optional: true,
    },
    sendDate: {
        type: Date,
        label: "发送日期", // 若设置了发送日期属性,则由Job直接读取发送日期并在指定时间发送
        autoValue() {
            if (this.isInsert) {
                return new Date();
            } else if (this.isUpsert) {
                return { $setOnInsert: new Date() };
            }
            return undefined;
        }
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
});

SMS.attachSchema(SMSSchema);
export { SMS, SMSSchema };
