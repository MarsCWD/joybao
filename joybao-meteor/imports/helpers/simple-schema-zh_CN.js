import { SimpleSchema } from "meteor/aldeed:simple-schema";

SimpleSchema.messages({
    required: "必须填写[label]",
    minString: "[label]不能短于[min]字符",
    maxString: "[label]不能超过[max]字符",
    minNumber: "[label]不能小于[min]",
    maxNumber: "[label]不能超过[max]",
    minNumberExclusive: "[label]必须大于[min]",
    maxNumberExclusive: "[label]必须小于[max]",
    minDate: "[label]必须在[min]时或之后",
    maxDate: "[label]不能在[max]之后",
    badDate: "[label]不是一个正确的日期",
    minCount: "至少包含[minCount]项",
    maxCount: "不能超过[maxCount]项",
    noDecimal: "[label]必须是整数",
    notAllowed: "[label]填写不正确",
    expectedString: "[label]必须是字符串",
    expectedNumber: "[label]必须是数字",
    expectedBoolean: "[label]必须是是/否类型",
    expectedArray: "[label]必须是一组值",
    expectedObject: "[label]必须是一个对象",
    expectedConstructor: "[label]必须是[type]",
    keyNotInSchema: "[key]不符合结构规则",
    notUnique: "[label]必须是唯一的",
    regEx: [
        { msg: "[label] 不符合要求" },
        { exp: SimpleSchema.RegEx.Email, msg: "[label] 必须是正确的邮箱地址" },
        { exp: SimpleSchema.RegEx.Domain, msg: "[label] 必须是正确的域名" },
        { exp: SimpleSchema.RegEx.WeakDomain, msg: "[label] 必须是正确的域名" },
        { exp: SimpleSchema.RegEx.IP, msg: "[label] 必须是一个正确的IPv4或IPv6地址" },
        { exp: SimpleSchema.RegEx.IPv4, msg: "[label] 必须是一个正确的IPv4地址" },
        { exp: SimpleSchema.RegEx.IPv6, msg: "[label] 必须是一个正确的IPv6地址" },
        { exp: SimpleSchema.RegEx.Url, msg: "[label] 必须是一个正确的URL地址" },
        { exp: SimpleSchema.RegEx.Id, msg: "[label] 必须是一个正确的数字ID" },
        { exp: SimpleSchema.RegEx.Phone, msg: "[label] 必须是一个正确的电话号码" },
        { exp: SimpleSchema.RegEx.ChinaPhone, msg: "[label] 必须是一个正确的电话号码" }
    ],

    // customs
    passwordMismatch: "两次密码不相同",
    // keyNotInSchema: "[key] is not allowed by the schema"
});
