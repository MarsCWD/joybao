import { RestMethodMixin } from "meteor/simple:rest-method-mixin";
import ValidatedMethod from "../../imports/helpers/CustomValidatedMethod";

import common from "../../imports/helpers/Common";
import CompanyDao from "../../imports/api/company/dao";

import ConstantCode from "../../imports/helpers/ConstantCode";
import MongoDBHelper from "../../imports/helpers/MongoDBHelper";

import { ErrorCode, ErrorJSON } from "../../imports/helpers/ErrorJson";

/**
 * 查找公司
 */
new ValidatedMethod({
    name: "company.find",
    mixins: [RestMethodMixin],
    validate: null,
    run({ key }) {
        if (common.isBlank(key)) {
            return ErrorJSON(ErrorCode.COMPANY.EMPTY_NAME);
        }
        const company = CompanyDao.findCompanyWithName(key);
        if (!company) {
            return ErrorJSON(ErrorCode.COMPANY.NOT_EXIST);
        }
        return { success: true, data: { company } };
    },
    restOptions: {
        url: "/company.find",
        httpMethod: "get",
        getArgsFromRequest(req) {
            const obj = {};
            obj.key = req.query.key;
            return [obj];
        },
    },
});

/**
 * 获得来自优运推送的公司列表
 * TODO Bug
 */
new ValidatedMethod({
    name: "company.list.logistics",
    mixins: [RestMethodMixin],
    validate: null,
    run({ name }) {
        const query = {
            isActive: true,
            source: ConstantCode.COMPANY.SOURCE.YOU_YUN,
            identityState: ConstantCode.IDENTITY_STATUS.SUCCESS,
        };
        if (name) {
            query.name = name;
        }
        return CompanyDao.find(query, {
            fields: MongoDBHelper.fields(["name", "license", "codeORG", "codeUSC", "legalName", "phone"])
        });
    },
    restOptions: {
        url: "/company.list.logistics",
        httpMethod: "get",
        getArgsFromRequest(req) {
            const obj = {};
            obj.name = req.query.name;
            obj.session = req.session;
            return [obj];
        }
    }
});
