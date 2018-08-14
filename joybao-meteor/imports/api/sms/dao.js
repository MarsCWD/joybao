import { SMS } from "./SMS";

/** 短信Dao */
class SMSDao {
    static insert(obj) {
        return SMS.insert(obj);
    }
    static update(selector, options) {
        return SMS.update(selector, { $set: options });
    }
    static find(selector, options) {
        return SMS.find(selector, options).fetch();
    }
    static findOneByMobile(phone) {
        return SMS.find({ phone }).fetch();
    }
}

export default SMSDao;
