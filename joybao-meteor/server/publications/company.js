import { Meteor } from "meteor/meteor";

import CompanyDao from "../../imports/api/company/dao";
import AgentRecordDao from "../../imports/api/agent/dao";

import ConstantCode from "../../imports/helpers/ConstantCode";
import MongoDBHelper from "../../imports/helpers/MongoDBHelper";

/**
 * 获得来自优运推送的公司列表
 */
Meteor.publish("company.list.logistics", obj => {
    const query = {
        isActive: true,
        source: ConstantCode.COMPANY.SOURCE.YOU_YUN,
        identityState: ConstantCode.IDENTITY_STATUS.SUCCESS,
    };
    if (obj.name) {
        query.name = obj.name;
    }
    return CompanyDao.find(query, {
        fields: MongoDBHelper.fields(["name", "license", "codeORG", "codeUSC", "legalName", "phone"])
    });
}, {
    url: "/company.list.logistics",
    getArgsFromRequest(req) {
        const obj = {};
        obj.name = req.query.name;
        obj.session = req.session;
        return [obj];
    }
});
