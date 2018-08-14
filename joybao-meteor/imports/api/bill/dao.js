import { Bill } from "./Bill";
import { Debit } from "./Debit";

class BillDao {
    static find(selector, options) {
        return Bill.find(selector, options).fetch();
    }

    static findOne(biilId, options) {
        return Bill.findOne({ _id: biilId, isActive: true }, options);
    }

    static insert(obj) {
        return Bill.insert(obj);
    }

    static update(billId, obj) {
        return Bill.update({ _id: billId }, { $set: obj });
    }

    static hasBill(userId, billId) {
        return Bill.find({ _id: billId, userId }).count() !== 0;
    }

    /**
     * 根据记账Id返回对应的账目
     * @param  {String} debitId 对账Id
     * @param  {Object} options 显示选项
     * @return {[type]}         [description]
     */
    static list(debitId, options) {
        return Bill.find({ debitId, isActive: true }, options).fetch();
    }

    static remove(billId) {
        return Bill.update({ _id: billId }, { $set: { isActive: false } });
    }
}

class DebitDao {
    static find(selector, options) {
        return Debit.find(selector, options).fetch();
    }

    /**
     * 根据 用户Id 年月日 来插入或更新对应的对账记录
     * @param  {String} userId 用户Id
     * @param  {Number} year   年
     * @param  {Number} month  月
     * @param  {Object} obj    存储对象
     * @return {[type]}        [description]
     */
    static upsert(userId, year, month, obj) {
        return Debit.upsert({
            userId,
            year,
            month,
        }, obj);
    }

    /**
     * 是否拥有当前对账
     * @param  {String} userId   用户Id
     * @param  {Number} year     年
     * @param  {Number} month    月
     * @param  {String} debitId  对账Id
     * @return {Boolean}         是否拥有当前对账
     */
    static hasDebit(userId, debitId) {
        const query = { _id: debitId, userId, isActive: true };
        return Debit.find(query).count() === 1;
    }
}

export { BillDao, DebitDao };
