import { ValidateCode } from "./ValidateCode";

/** 验证码Dao */
class ValidateCodeDao {
    static insert(obj) {
        return ValidateCode.insert(obj);
    }
    static findOne(id) {
        return ValidateCode.findOne({ _id: id });
    }
    static update(selector, options) {
        return ValidateCode.update(selector, options);
    }
    static findOneByMobile(phone) {
        return ValidateCode.findOne({ phone });
    }
    static find(selector, options) {
        return ValidateCode.find(selector, options)
            .fetch();
    }
    static count(selector) {
        return ValidateCode.find(selector)
            .count();
    }
}

export default ValidateCodeDao;
