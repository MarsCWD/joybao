import { Package } from "./Package";

/** 模板相关Dao */
class PackageDao {
    static find(selector, options) {
        return Package.find(selector, options)
            .fetch();
    }

    static findOne(selector, options) {
        return Package.findOne(selector, options);
    }

    static insert(obj) {
        return Package.insert(obj);
    }

    /** 根据ID 更新指定字段 */
    static updateSpecifiedFieldById(id, obj) {
        return Package.update({ _id: id }, { $set: obj });
    }
}

export default PackageDao;
