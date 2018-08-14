import { RestMethodMixin } from "meteor/simple:rest-method-mixin";
import ValidatedMethod from "../../imports/helpers/CustomValidatedMethod";

import Common from "../../imports/helpers/Common";

import ServerConfigDao from "../../imports/api/config/dao";

const crypto = require("crypto");

const ALiYunObj = ServerConfigDao.findOne("ALiYun").value;

/**
 * TODO 转publish
 * 文件上传接口
 */
new ValidatedMethod({
    name: "file.upload",
    mixins: [RestMethodMixin],
    validate: null,
    run() {
        const times = new Date().getTime() + ALiYunObj.expiratime;
        const expiration = new Date(times).toISOString();

        const policyText = JSON.stringify({
            expiration,
            conditions: [
                ["content-length-range", 0, ALiYunObj.maxSize]
            ]
        });
        const orign = new Buffer(policyText);
        const policyBase64 = orign.toString("base64");
        const message = policyBase64;
        const signature = crypto.createHmac("sha1", ALiYunObj.AccessKeySecret).update(message).digest().toString("base64");
        return { success: true, data: { policy: policyBase64, signature, salt: Math.random().toString(36).slice(-4) } };
    },
    restOptions: {
        url: "/file.upload",
    },
});

/**
 * 图片上传
 */
new ValidatedMethod({
    name: "image.upload",
    mixins: [RestMethodMixin],
    validate: null,
    run() {
        return { success: true };
    },
    restOptions: {
        url: "/image.upload",
        httpMethod: "post",
        getArgsFromRequest(req) {
            const upload = Meteor.wrapAsync(Common.getFile);
            const res = upload(req);
            return [res];
        }
    },
});
