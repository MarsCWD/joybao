import Logger from "../../imports/helpers/Logger";
import ServerConfigDao from "../../imports/api/config/dao";

const co = require("co");
const path = require("path");
const OSS = require("ali-oss");

const ALiYunObj = ServerConfigDao.findOne("ALiYun").value;

const client = new OSS({
    region: "oss-cn-hangzhou",
    accessKeyId: ALiYunObj.AccessKeyId,
    accessKeySecret: ALiYunObj.AccessKeySecret,
    bucket: ALiYunObj.bucket,
});

class ALiYunOSSHelper {

    /**
     * 上传到阿里云服务器
     * @description 17-06-09 Promise化 56
     * @param  {[type]}   imageNames [存储在阿里云的图片名]
     * @param  {[type]}   imagePath  [本地路径]
     * @return {[type]}             [description]
     */
    static upload(imageNames, imagePaths) {
        // return new Promise((resolve, reject) => {
        //     co(function*() {
        //         yield client.put(`wximages/${imageName}`, imagePath);
        //         resolve();
        //     }).catch(reject);
        // });
        return new Promise((resolve, reject) => {
            co(function * () {
                for (let i = 0, len = imageNames.length; i < len; i += 1) {
                    const imageName = imageNames[i];
                    const imagePath = imagePaths[i];
                    yield client.put(`wximages/${imageName}`, imagePath);
                }
                resolve();
            }).catch(reject);
        });
    }

    /**
     * 从阿里云服务器获取图片
     * @description 17-06-09 Promise化 56
     * @param  {[type]}   imageName [存储在阿里云的图片名]
     * @param  {[type]}   distPath  [本地路径]
     * @return {[type]}             [description]
     */
    static download(imageNames, distPath) {
        return new Promise((resolve, reject) => {
            co(function * () {
                for (let i = 0, len = imageNames.length; i < len; i += 1) {
                    const imageName = imageNames[i];
                    Logger.log(`download ${imageName}`);
                    yield client.get(`wximages/${imageName}`, `${distPath}${path.sep}${imageName}`);
                }
                resolve();
            }).catch(reject);
        });
    }
}

Logger.debug("ALiYunOSSHelper 执行一次");

export default ALiYunOSSHelper;
