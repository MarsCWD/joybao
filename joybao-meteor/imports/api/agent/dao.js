import { AgentRecord } from "./AgentRecord";

class AgentRecordDao {
    static find(selector, options) {
        return AgentRecord.find(selector, options).fetch();
    }

    static insert(obj) {
        return AgentRecord.insert(obj);
    }

    static findOne(id, options) {
        return AgentRecord.findOne({ _id: id }, options);
    }

    /** 显示当前用户下的所有代理公司 **/
    static listCompany(userId, options) {
        return AgentRecord.find({ userId }, options).fetch();
    }

    /** 显示公司下的所有代理人 **/
    static listUser(companyId, options) {
        return AgentRecord.find({ companyId }, options).fetch();
    }

    /** 该用户是否属于该公司代理人员 **/
    static isMatch(userId, companyId) {
        return AgentRecord.find({ userId, companyId }).count() !== 0;
    }

    /**
     * 当前用户是否为公司主体账户
     * @param  {[type]}  userId    [description]
     * @param  {[type]}  companyId [description]
     * @return {Boolean}           [description]
     */
    static isMaster(userId, companyId) {
        return AgentRecord.find({ userId, companyId, isMaster: true }).count() !== 0;
    }

    static findAgent(userId, companyId, options) {
        return AgentRecord.findOne({ userId, companyId }, options);
    }

    /**
     * 查询当前用户为主账户的公司
     * @param  {[type]} userId  [description]
     * @param  {[type]} options [description]
     * @return {[type]}         [description]
     */
    static findUserCompany(userId, options) {
        return AgentRecord.find({ userId }, options).fetch();
    }

    static updateSpecifiedFieldById(recordId, options) {
        return AgentRecord.update({ _id: recordId }, { $set: options });
    }
}

export default AgentRecordDao;
