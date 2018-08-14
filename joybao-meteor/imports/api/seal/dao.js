import { Seal } from "./Seal";
import ConstantCode from "../../helpers/ConstantCode";

class SealDao {
    static find(selector, options) {
        return Seal.find(selector, options).fetch();
    }
    static findOne(id, options) {
        return Seal.findOne({ _id: id }, options);
    }
    static findNewDefalut(userId) {
        return Seal.findOne({
            userId,
            status: ConstantCode.AUDIT_STATUS.PASS,
            isActive: true,
        }, {
            sort: { updatedAt: -1 }
        });
    }
    static insert(obj) {
        return Seal.insert(obj);
    }

    static findUserSealId(userId, companyId, sealId, options) {
        const query = { userId, _id: sealId, isActive: true };
        if (companyId) {
            query.companyId = companyId;
        }
        return Seal.findOne(query, options);
    }

    static remove(sealId) {
        return Seal.update({ _id: sealId }, { $set: { isActive: false } });
    }
    /** 根据ID 更新指定字段 */
    static updateSpecifiedFieldById(id, obj) {
        return Seal.update({ _id: id }, { $set: obj });
    }

    static list(userId, companyId, options) {
        const query = { userId, isActive: true };
        if (companyId) {
            query.companyId = companyId;
        }
        return Seal.find(query, options).fetch();
    }

    static hasDefault(userId, companyId) {
        const query = { userId, default: true, isActive: true };
        if (companyId) {
            query.companyId = companyId;
        }
        return Seal.find(query).count !== 0;
    }

    static count(userId, companyId) {
        const query = { userId, isActive: true };
        if (companyId) {
            query.companyId = companyId;
        }
        return Seal.find(query).count();
    }
}

export default SealDao;
