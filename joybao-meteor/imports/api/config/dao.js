import { ServerConfig } from "./ServerConfig";

class ServerConfigDao {
    static find(selector, options) {
        return ServerConfig.find(selector, options).fetch();
    }

    static findMany(names) {
        const obj = {};
        const res = ServerConfig.find({ name: { $in: names } }, {}).fetch();
        for (let i = 0, len = res.length; i < len; i += 1) {
            const item = res[i];
            obj[item.name] = item.value;
        }
        return obj;
    }

    static findOne(name) {
        return ServerConfig.findOne({ name }, {});
    }

    // static insert(obj) {
    //     return ServerConfig.insert(obj);
    // }
    //
    // static insertMany(objs) {
    //     for (let i = 0, len = objs.length; i < len; i += 1) {
    //         const obj = objs[i];
    //         const flag = ServerConfig.upsert({ name: obj.name }, { $set: obj });
    //         if (!flag) {
    //             return false;
    //         }
    //     }
    //     return true;
    // }

    /** 根据ID 更新指定字段 */
    static updateSpecifiedFieldById(name, obj) {
        return ServerConfig.update({ name }, { $set: obj });
    }
}

export default ServerConfigDao;
