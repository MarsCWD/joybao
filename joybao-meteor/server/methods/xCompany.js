/**
 * Created by Yifeng.Shen on 2017/7/24.
 */
import { ValidatedMethod } from "meteor/mdg:validated-method";
import { SimpleSchema } from "meteor/aldeed:simple-schema";
import { RestMethodMixin } from "meteor/simple:rest-method-mixin";

import XCompanyDao from "../../imports/api/xCompany/dao";

import Logger from "../../imports/helpers/Logger";
import HuiYuHelper from "../init/HuiYuHelper";
import SessionHelper from "../collections/session";
import validator from "../../imports/helpers/simple-schema-validator";
import { ErrorCode, ErrorJSON } from "../../imports/helpers/ErrorJson";

/**
 * 企业信息获取
 */
new ValidatedMethod({
    name: "xCompany.info",
    mixins: [RestMethodMixin],
    validate: validator(new SimpleSchema({
        session: {
            type: Object,
            blackbox: true,
        },
        companyName: {
            label: "公司名称",
            type: String,
        }
    })),
    run({ session, companyName }) {
        const company = XCompanyDao.findCompanyWithName(companyName);
        if (!company) { // 本地数据库未找到
            const getCompanyInfo = Meteor.wrapAsync(HuiYuHelper.getCompanyInfo);
            const rawObj = getCompanyInfo(companyName);
            SessionHelper.sessionUpdate(session.token, { XCompanyId: undefined });
            if (!rawObj) { // 调惠誉接口未找到
                return ErrorJSON(ErrorCode.XCOMPANY.UNEXISTED);
            }
            const companyInfo = HuiYuHelper.parseCompanyInfo(rawObj);
            if (!companyInfo) { // 解析失败
                return ErrorJSON(ErrorCode.XCOMPANY.ERRPARSE);
            }
            const result = XCompanyDao.upsert(companyInfo.name, Object.assign({}, companyInfo, { rawData: rawObj }));
            if (companyName !== companyInfo.name) { // 校验是否一致
                return ErrorJSON(ErrorCode.XCOMPANY.UNEXISTED);
            }
            if (!result) { // 插入失败
                return ErrorJSON(ErrorCode.SERVER);
            }
            const xCompany = XCompanyDao.findCompanyWithName(companyInfo.name);
            if (!xCompany) {
                return ErrorJSON(ErrorCode.SERVER);
            }
            SessionHelper.sessionUpdate(session.token, { XCompanyId: xCompany._id });
            return { success: true, data: companyInfo };
        }
        SessionHelper.sessionUpdate(session.token, { XCompanyId: company._id });
        return { success: true, data: company };
    },
    restOptions: {
        url: "/xCompany.info",
        getArgsFromRequest(req) {
            const obj = req.body;
            obj.session = req.session;
            obj.companyName = req.body.companyName;
            return [obj];
        },
    },
});
