import { RestMethodMixin } from "meteor/simple:rest-method-mixin";
import { SimpleSchema } from "meteor/aldeed:simple-schema";

import ValidatedMethod from "../../imports/helpers/CustomValidatedMethod";
import validator from "../../imports/helpers/simple-schema-validator";

import SaleAgreementDao from "../../imports/api/saleAgreement/dao";
import { SaleAgreementSchema } from "../../imports/api/saleAgreement/SaleAgreement";

import { ErrorCode, ErrorJSON } from "../../imports/helpers/ErrorJson";

import Logger from "../../imports/helpers/Logger";

/**
 * 生成单据
 */
new ValidatedMethod({
    name: "saleAgreement.new",
    mixins: [RestMethodMixin],
    validate: validator(new SimpleSchema({
        session: {
            type: Object,
            blackbox: true,
        },
        saleAgreement: {
            label: "单据",
            type: SaleAgreementSchema,
        },
        signpassword: {
            label: "签署密码",
            type: String,
        },
    })),
    run({ session, saleAgreement, signpassword }) {
        /** 发起人检查 是否实名认证 **/
        if (session.identityState !== ConstantCode.IDENTITY_STATUS.SUCCESS) {
            return ErrorJSON(ErrorCode.PERSON.UNEXISTED);
        }

        /** 签署密码 **/
        if (signpassword !== session.signpassword) {
            return ErrorJSON(ErrorCode.PERSON.SIGN_PASSWORD);
        }

        return { success: true };
    },
    restOptions: {
        url: "/saleAgreement.new",
        getArgsFromRequest(req) {
            const obj = req.body;
            obj.session = req.session;
            try {
                obj.saleAgreement = JSON.parse(obj.saleAgreement);
            } catch (e) {
                const err = new Meteor.Error("Invalid json string", "Invalid json string");
                err.statusCode = 400;
                throw err;
            }
            return [obj];
        },
    },
});
