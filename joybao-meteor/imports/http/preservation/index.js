import Logger from "../../helpers/Logger";

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const request = require("request");
const superagent = require("superagent");

Logger.log("初始化一次 preservation api");

/**
 * 对传输内容进行签名加密
 * @param  {[type]} json   json字符串
 * @param  {[type]} secret 加密密钥
 * @return {[type]}        [description]
 */
function _getSignature(json, secret) {
    const hmac = crypto.createHmac("sha256", secret);
    hmac.update(json);
    return hmac.digest("hex");
}

/**
 * 获取文件的MD5值 并进行base64编码
 * @param       {[type]} filePath 文件地址
 * @return      {[type]}          [description]
 */
function _getFileBase64MD5(filePath) {
    const buffer1 = fs.readFileSync(filePath);
    const fsHash = crypto.createHash("md5");
    fsHash.update(buffer1);
    const md5 = fsHash.digest();
    const buffer2 = new Buffer(md5);
    return buffer2.toString("base64");
}

/**
 * 获取文件信息
 * @param       {[type]} filePath 文件路径
 * @return      {[type]}          [description]
 */
function _getContentInfo(filePath) {
    const content = {};
    const stats = fs.statSync(filePath);

    const md5 = _getFileBase64MD5(filePath);

    content.contentDescription = path.basename(filePath);
    content.contentLength = stats.size;
    content.contentBase64Md5 = md5;

    return { md5, content };
}

/**
 * 获取保全url
 * @param  {[type]} eviName  保全文件名
 * @param  {[type]} filePath 文档地址
 * @param  {[type]} eSignId  易签宝调用id
 * @return {[type]}          [description]
 */
function getUrl(eviName, filePath, eSignId) {
    return new Promise((resolve, reject) => {
        // ESign Settings
        const ESign = Meteor.settings.ESign;
        const projectId = ESign.projectId;
        const projectSecret = ESign.projectSecret;

        // ESign preservation settings
        const preservation = ESign.preservation;
        const eviUrl = preservation.url;
        const encoding = preservation.encoding;
        const algorithm = preservation.algorithm;

        // 请求内容
        const contentInfo = _getContentInfo(filePath);
        const md5 = contentInfo.md5;
        const content = contentInfo.content;

        const body = {
            eviName,
            content,
            eSignIds: [{
                type: 0,
                value: eSignId
            }]
        };

        // 对请求内容进行签名
        const signature = _getSignature(JSON.stringify(body), projectSecret);

        superagent
            .post(eviUrl)
            .set("Content-type", "application/json")
            .set("X-timevale-project-id", projectId)
            .set("X-timevale-signature", signature)
            .set("signature-algorithm", algorithm)
            .set("Content-Type", "application/json")
            .set("Charset", encoding)
            .send(body)
            .end((err, res) => {
                if (err) {
                    return reject(err);
                }
                return resolve({ data: res.body, md5 });
            });
    });
}

/**
 * put请求上传保全文档
 * @param  {[type]} url      保全文档地址
 * @param  {[type]} filePath 本地保全文档路径
 * @param  {[type]} md5      md5加密值
 * @return {[type]}          [description]
 */
function putDoc(url, filePath, md5) {
    return new Promise((resolve, reject) => {
        Logger.info(`put doc docUrl:${url}`);
        Logger.info(`put doc filePath:${filePath}`);
        Logger.info(`put doc md5:${md5}`);
        const stream = fs.createReadStream(filePath);
        const req = request({
            url,
            method: "put",
            headers: {
                Charset: "UTF-8",
                "Content-MD5": md5,
                "Content-Type": "application/octet-stream",
            }
        }, err => {
            if (err) {
                return reject(err);
            }
            return resolve();
        });

        stream.pipe(req);
        // const req = superagent.put(url)
        //     .set("Content-MD5", md5)
        //     .set("Content-Type", "application/octet-stream")
        //     .set("Charset", "UTF-8")
        //     .on("response", () => {
        //         Logger.info("finish");
        //         resolve();
        //     })
        //     .on("error", err => {
        //         Logger.error(err);
        //         reject();
        //     });
        //
        // stream.pipe(req);
    });
}

export default { getUrl, putDoc };
