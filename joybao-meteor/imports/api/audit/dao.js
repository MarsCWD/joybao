import { AuditRecord } from "./AuditRecord";

class AuditRecordDao {
    static find(selector, options) {
        return AuditRecord.find(selector, options).fetch();
    }
    static findOne(id, options) {
        return AuditRecord.findOne({ _id: id }, options);
    }

    static insert(obj) {
        return AuditRecord.insert(obj);
    }

    static list(selector, options) {
        return AuditRecord.find(selector, options).fetch();
    }

    /** 根据ID 更新指定字段 */
    static updateSpecifiedFieldById(id, obj) {
        return AuditRecord.update({ _id: id }, { $set: obj });
    }
}

export default AuditRecordDao;
