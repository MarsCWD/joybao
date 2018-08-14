import { Company } from "./Company";
import ConstantCode from "../../helpers/ConstantCode";
import MongoDBHelper from "../../helpers/MongoDBHelper";

/** 企业信息Dao */
class CompanyDao {

    static insert(obj) {
        return Company.insert(obj);
    }

    static find(selector, options) {
        return Company.find(selector, options).fetch();
    }

    static findOne(selector, options) {
        return Company.findOne(selector, options);
    }

    static findOneByCompanyId(companyId, options) {
        return Company.findOne({ _id: companyId }, options);
    }

    static listCompany(userId, options) {
        return Company.find({
            mainAccountId: userId,
            isActive: true,
        }, options);
    }

    /** 根据ID 更新指定字段 */
    static updateSpecifiedFieldById(id, obj) {
        return Company.update({ _id: id }, { $set: obj });
    }

    static updateSignatureNumber(id, options) {
        return Company.update({ _id: id }, options);
    }

    /**
     * 根据统一信用代码来判断公司是否已经注册
     * @param  {[type]} codeUSC [社会统一信用代码]
     * @return {[type]}         [description]
     */
    static isExisted(codeUSC) {
        return Company.find({ codeUSC }).count() !== 0;
    }

    static findCompanyWithName(name) {
        return Company.findOne({ name }, {
            fields: MongoDBHelper.fields([
                "identityState", "name", "license", "codeORG", "OrgCode", "codeUSC", "legalName"
            ])
        });
    }

    /** 根据关键字返回模糊查询到的基本信息 */
    static findByNameWithKeywords(key, limit = 10) {
        const pattern = new RegExp(`${key}`);
        return Company.find({
            name: pattern,
            identityState: {
                $in: [ConstantCode.IDENTITY_STATUS.IN_PROCESSING,
                    ConstantCode.IDENTITY_STATUS.SUCCESS
                ]
            }
        }, {
            limit,
            fields: MongoDBHelper.fields(["_id", "name", "legalName"])
        });
    }
}

export default CompanyDao;
