import { SimpleSchema } from "meteor/aldeed:simple-schema";
import Logger from "../../imports/helpers/Logger";

function initRegEx() {
    Logger.log(JSON.stringify(Meteor.settings));
    SimpleSchema.RegEx.PersonName = /^([a-zA-Z\u4e00-\u9fa5\\·]{2,18})$/;
    SimpleSchema.RegEx.ChinaPhone = /^(13[0-9]|14[579]|15[0-3,5-9]|17[0135678]|18[0-9])\d{8}$/;
    SimpleSchema.RegEx.IDCard = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
    SimpleSchema.RegEx.BankCard = /^\d{16}|\d{19}$/;
    SimpleSchema.RegEx.CodeUSC = /[^_IOZSVa-z\W]{2}\d{6}[^_IOZSVa-z\W]{10}/;
    SimpleSchema.RegEx.CodeORG = /^[A-Za-z0-9]{8}-[A-Za-z0-9]{1}/;
    SimpleSchema.RegEx.CodeNO = /^\d{15}$/;
}

initRegEx();
