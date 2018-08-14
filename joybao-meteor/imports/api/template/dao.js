import { Template } from "./Template";

/** 模板相关Dao */
class TemplateDao {
    static find(selector, options) {
        return Template.find(selector, options)
            .fetch();
    }

    static findOne(selector, options) {
        return Template.findOne(selector, options);
    }

    static insert(obj) {
        return Template.insert(obj);
    }

    /** 根据ID 更新指定字段 */
    static updateSpecifiedFieldById(id, obj) {
        return Template.update({ _id: id }, { $set: obj });
    }
}

export default TemplateDao;
