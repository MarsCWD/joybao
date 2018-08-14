import Logger from "./Logger";
import ConstantCode from "./ConstantCode";
import ContractHelper from "./ContractHelper";

import PreservationDao from "../api/preservation/dao";
import PreservationApi from "../http/preservation/index";

const Promise = require("bluebird");

class Preservation {
    /**
     * 扫描列表
     * @return {[type]} [description]
     */
    static scan() {
        Logger.info("start scan contract for Preservation");
        const list = PreservationDao.find();
        Preservation.uploadLimit(list);
    }

    /**
     * 并发限制上传
     * @param  {[type]}  list    并发列表
     * @param  {Number}  [num=5] 并发限制数
     * @return {Promise}         [description]
     */
    static async uploadLimit(list, num = 5) {
        try {
            await Promise.map(list, Preservation.upload, { concurrency: num });
            return true;
        } catch (e) {
            Logger.error(e);
            return false;
        }
    }

    /**
     * 上传
     * @param  {[type]} item [description]
     * @return {[type]}      [description]
     */
    static upload(item) {
        return new Promise((resolve, reject) => {
            const _id = item._id;
            const filePath = `${ContractHelper.getPath(item.contractId)}/current.pdf`;
            let eid = null;
            let docUrl = "";
            Logger.info(`get preservation url ${item.contractName} filePath: ${filePath}`);
            return PreservationApi.getUrl(item.contractName, filePath, item.serviceId)
                .then(res => {
                    const data = res.data;
                    const md5 = res.md5;
                    eid = data.eid;
                    docUrl = data.url;
                    // return PreservationApi.putDoc(docUrl, filePath, md5);
                    return PreservationApi.putDoc(docUrl, filePath, md5);
                })
                .then(() => {
                    Logger.info(`233 ${_id} ${eid}`);
                    if (PreservationDao.update(_id, { eid, docUrl, state: ConstantCode.JOB.STATE.FINISH })) {
                        Logger.info("preservation finish");
                        return resolve();
                    }
                    return reject();
                })
                .catch(reject);
        });
    }
}

export default Preservation;
