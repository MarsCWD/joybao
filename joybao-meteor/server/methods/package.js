/**
 * Created by Yifeng.Shen on 2017/6/28.
 */
import { RestMethodMixin } from "meteor/simple:rest-method-mixin";
import PackageDao from "../../imports/api/package/dao";
import ValidatedMethod from "../../imports/helpers/CustomValidatedMethod";
import MongoDBHelper from "../../imports/helpers/MongoDBHelper";
import { ErrorCode, ErrorJSON } from "../../imports/helpers/ErrorJson";

/**
 * TODO 转publish
 * 根据模板名获取模板
 */
new ValidatedMethod({
    name: "package.list",
    mixins: [RestMethodMixin],
    validate: null,
    run() {
        const packages = PackageDao.find({ }, {
            fields: MongoDBHelper.fields([
                "_id",
                "name",
                "price",
                "increment",
            ]),
            sort: { price: 1 }
        })
        if (!packages) {
            return ErrorJSON(ErrorCode.PACKAGE.NOT_FOUND);
        }
        return { success: true, data: packages };
    },
    restOptions: {
        url: "/package.list",
        httpMethod: "get"
    },
});
