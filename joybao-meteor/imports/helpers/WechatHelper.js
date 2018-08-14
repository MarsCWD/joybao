const crypto = require("crypto");

class WXBizDataCryptHelper {

    constructor(appId, sessionKey) {
        this.appId = appId;
        this.sessionKey = sessionKey;
    }

    decryptData(encryptedDataOrign, ivOrgin) {
        // base64 decode
        const sessionKey = new Buffer(this.sessionKey, "base64"),
            encryptedData = new Buffer(encryptedDataOrign, "base64"),
            iv = new Buffer(ivOrgin, "base64");

        let decoded;
        try {
            // 解密
            const decipher = crypto.createDecipheriv("aes-128-cbc", sessionKey, iv);
            // 设置自动 padding 为 true，删除填充补位
            decipher.setAutoPadding(true);
            decoded = decipher.update(encryptedData, "binary", "utf8");
            decoded += decipher.final("utf8");

            decoded = JSON.parse(decoded);
        } catch (err) {
            throw new Error("Illegal Buffer");
        }

        if (decoded.watermark.appid !== this.appId) {
            throw new Error("Illegal Buffer");
        }

        return decoded;
    }

    /**
     * 检查签名是否有效
     * @param  {[type]} orign     [加密对象]
     * @param  {[type]} signature [校验签名]
     * @return {[type]}           [description]
     */
    static checkSignature(rawData, signature) {
        const shaSum = crypto.createHash("sha1");
        shaSum.update(rawData);
        const res = shaSum.digest("hex");
        return res === signature;
    }
}

export default WXBizDataCryptHelper;
