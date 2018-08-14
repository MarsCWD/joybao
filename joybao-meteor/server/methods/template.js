import { RestMethodMixin } from "meteor/simple:rest-method-mixin";
import ValidatedMethod from "../../imports/helpers/CustomValidatedMethod";

import TemplateDao from "../../imports/api/template/dao";

import MongoDBHelper from "../../imports/helpers/MongoDBHelper";
import { ErrorCode, ErrorJSON } from "../../imports/helpers/ErrorJson";

/**
 * TODO 转publish
 * 根据模板名获取模板
 */
new ValidatedMethod({
    name: "template.getTemplate",
    mixins: [RestMethodMixin],
    validate: null,
    run(key) {
        const template = TemplateDao.findOne({ templateKey: key }, {
            fields: MongoDBHelper.fields([
                "templateName",
                "steps",
                "stepSum",
                "branch",
                "branchIndex",
                "code"
            ])
        });
        if (!template) {
            return ErrorJSON(ErrorCode.TEMPLATE.NOT_FOUND);
        }
        return { success: true, data: template };
    },
    restOptions: {
        url: "/template.getTemplate",
        httpMethod: "get",
        getArgsFromRequest(req) {
            const key = req.query.templateKey;
            return [key];
        },
    },
});
