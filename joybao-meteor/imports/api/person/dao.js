import { Person } from "./Person";

/** 个人资料Dao */
class PersonDao {
    static find(selector, options) {
        return Person.find(selector, options).fetch();
    }

    static findOne(selector, options) {
        return Person.findOne(selector, options);
    }

    static findOneByUserId(userId, options) {
        return Person.findOne({ _id: userId }, options);
    }

    static updateSignatureNumber(userId, options) {
        return Person.update({ _id: userId }, options);
    }

    /** 微信登录, 更新微信用户资料 **/
    static upsertWechat(obj) {
        return Person.upsert({ unionId: obj.unionId }, { $set: obj });
    }

    /** 更新认证资料 **/
    static upsertIdentity(id, realName, auditId, identityState) {
        return Person.update({ _id: id }, { $set: { realName, identityState, "identity.identityId": auditId } });
    }

    /** 根据ID 更新指定字段 */
    static updateSpecifiedFieldById(id, obj) {
        return Person.update({ _id: id }, { $set: obj });
    }

    /** 是否有用户绑定号码 **/
    static hasPhone(phone) {
        return Person.find({ phone }).count() !== 0;
    }

    /** 根据UserId 和当前用户是否有认证资料查询用户 **/
    static findHasIdentity(_id) {
        return Person.findOne({ _id, "identity.IDCard": { $exists: true } });
    }
}

export default PersonDao;
