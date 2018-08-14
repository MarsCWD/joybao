/** 个人信息表 */
import { Mongo } from "meteor/mongo";
import { SimpleSchema } from "meteor/aldeed:simple-schema";

import { Basic } from "../common/schema";

import Logger from "../../helpers/Logger";
import ConstantCode from "../../helpers/ConstantCode";

const Person = new Mongo.Collection("Person");

/** 个人认证资料 **/
const PersonIdentitySchema = new SimpleSchema({
    identityId: {
        label: "认证信息ID",
        type: String,
        optional: true,
    },
    IDCard: {
        label: "身份证号码",
        type: String,
        optional: true,
        regEx: SimpleSchema.RegEx.IDCard,
    },
    realName: {
        label: "姓名",
        type: String,
        optional: true,
        regEx: SimpleSchema.RegEx.PersonName,
    },
    /** 身份证验证 **/
    idCardFont: {
        label: "身份证照片前面文件ID",
        type: String,
        optional: true,
    },
    idCardBack: {
        label: "身份证照片背面文件ID",
        type: String,
        optional: true,
    },
    facePhoto: {
        label: "人脸识别照片文件ID",
        type: String,
        optional: true,
    },
});

class PersonClass extends Basic {
    constructor() {
        super(true);
        this.unionId = {
            label: "微信unionID",
            type: String,
            unique: true,
        };
        this.phone = {
            label: "手机号码",
            type: String,
            optional: true,
            regEx: SimpleSchema.RegEx.ChinaPhone,
        };
        this.openId = {
            label: "微信openId",
            type: String,
        };
        this.nickName = {
            label: "微信nickName",
            type: String,
        };
        this.gender = {
            label: "微信gender",
            type: Number,
        };
        this.city = {
            label: "微信city",
            type: String,
            optional: true,
        };
        this.province = {
            label: "微信province",
            type: String,
            optional: true,
        };
        this.country = {
            label: "微信country",
            type: String,
            optional: true,
        };
        this.avatarUrl = {
            label: "微信avatarUrl",
            type: String,
        };
        this.watermark = {
            label: "微信watermark",
            type: Object,
            optional: true,
        };
        this.realName = {
            label: "真实姓名",
            type: String,
            optional: true,
            regEx: SimpleSchema.RegEx.PersonName,
        };
        this.identity = {
            label: "个人认证资料",
            type: PersonIdentitySchema,
            optional: true,
        };
        this.identityState = {
            label: "个人认证状态",
            type: String,
            optional: true,
            allowedValues: Object.values(ConstantCode.IDENTITY_STATUS),
        };
        this.defaultSealId = {
            label: "默认签章Id",
            type: String,
            optional: true,
        };
        this.accountId = {
            label: "易签宝个人Id",
            type: String,
            optional: true,
        };
        this.currentBudget = {
            label: "当月预算",
            type: Number,
            optional: true,
        };
        this.signatureNumber = {
            label: "签署次数",
            type: Number,
            optional: true,
            min: 0,
        };
        this.lockSignatureNumber = {
            label: "冻结的签署次数",
            type: Number,
            optional: true,
            min: 0,
        };
    }
}

Logger.info("Person init once");
const PersonSchema = new PersonClass();
Person.attachSchema(PersonSchema);
export { Person, PersonSchema, PersonIdentitySchema };
