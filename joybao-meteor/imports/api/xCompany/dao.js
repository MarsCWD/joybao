/**
 * Created by Yifeng.Shen on 2017/7/24.
 */
import { XCompany } from "./XCompany";
import Logger from "../../helpers/Logger";
import MongoDBHelper from "../../helpers/MongoDBHelper";

/** 企业信息 */
class XCompanyDao {
    static upsert(name, obj) {
        // return XCompany.insert(obj);
        try {
            return XCompany.upsert({ name }, { $set: obj });
        } catch (err) {
            return Logger.log(err);
        }
    }

    static findCompanyWithName(name) {
        return XCompany.findOne({ name }, { fields: { rawData: 0, isActive: 0, createdAt: 0, updatedAt: 0 } });
    }

    static findOneWithId(_id) {
        return XCompany.findOne({ _id });
    }
}

export default XCompanyDao;
