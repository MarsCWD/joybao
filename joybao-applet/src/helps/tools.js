import Config from "../config/Config";
import help from "./help";
import md5 from "../utils/md5.js";

/** 选择图片 **/
const chooseImage = (count = 1) => {
    return new Promise((resolve, reject) => {
        wx.showActionSheet({
            itemList: ["相机", "相册"],
            success: function(e) {
                if (e.cancel) {
                    return reject("用户取消了");
                }
                let sourceType = [];
                // 相机
                if (e.tapIndex === 0) {
                    sourceType.push("camera");
                } else if (e.tapIndex === 1) { // 相册
                    sourceType.push("album");
                }
                wx.chooseImage({
                    count: count, // 默认9
                    sizeType: ["original", "compressed"], // 可以指定是原图还是压缩图，默认二者都有
                    sourceType: sourceType, // 可以指定来源是相册还是相机，默认二者都有
                    success(res) {
                        if (count > 1) {
                            resolve(res.tempFilePaths);
                        } else {
                            resolve(res.tempFilePaths[0]);
                        }
                    },
                    fail(err) {
                        reject(err);
                    }
                });
            }
        });
    });
};

/** 向后台发起请求 **/
const getALiYunSign = () => {
    return new Promise((resolve, reject) => {
        help.request(`${Config.host}file.upload`, {})
            .then(resolve, reject);
    });
};

/** 上传文件 **/
const uploadALiYunSign = (filePath, policy, signature, salt, ext) => {
    return new Promise((resolve, reject) => {
        const name = `${new Date().getTime()}${salt}.${ext}`;
        // resolve("more.png");
        wx.uploadFile({
            url: Config.ALiYun.address,
            filePath,
            name: "file",
            formData: {
                policy,
                signature,
                OSSAccessKeyId: Config.ALiYun.AccessKeyId,
                key: `wximages/${name}`,
                success_action_status: "200",
            },
            success(res) {
                console.log(res);
                console.log("上传成功啦", name);
                resolve(name);
            },
            fail(err) {
                console.log(err);
                console.error("上传失败啦");
                reject(err);
            }
        });
    });
};

/**
 * 1. 选择照片(或从相机拍照)
 * 2. 向后台发起请求获取签名值
 * 3. 上传文件至文件服务器
 * 4. 返回文件结果
 * @type {[type]}
 */
const uploadImage = async(paths) => {
    const res = await getALiYunSign();
    const salt = res.data.data.salt;
    const policy = res.data.data.policy;
    const signature = res.data.data.signature;

    paths = paths || await chooseImage();
    if (!(paths instanceof Array)) { // 单个图片上传
        const arr = paths.split(".");
        const ext = arr[arr.length - 1];
        return  uploadALiYunSign(paths, policy, signature, salt, ext);
    }
    else{
      const promiseArray = paths.map(async (path) => {
          const filePah = path;
          const arr = filePah.split(".");
          const ext = arr[arr.length - 1];
          return  uploadALiYunSign(filePah, policy, signature, salt, ext);
      });
      return Promise.all(promiseArray);
    }
};

const checkType = (value,type) => {
    try{
        var patt=new RegExp(regular[type]);
        if (!(patt.test(value))) {
            return false;
        } else {
            return true;
        }
    }
    catch(err){
        return false;
    }
};

const checkValue = (value,regular) => {
    try{
        var patt=new RegExp(regular);
        if (!(patt.test(value))) {
            return false;
        } else {
            return true;
        }
    }
    catch(err){
        return false;
    }
};
const checkPhone = (str) => {
    if (!(/^(13[0-9]|14[579]|15[0-3,5-9]|17[0135678]|18[0-9])\d{8}$/.test(str))) {
        return false;
    } else {
        return true;
    }
};

const md5Encryption = (str) => {
    return md5.hexMD5(str);
};

const regular = {
    phone:"/^(13[0-9]|14[579]|15[0-3,5-9]|17[0135678]|18[0-9])\d{8}$/",
    company:"^[\(\)\（\）\u4E00-\u9FA5]+$"
}

export default {
    uploadImage,
    checkPhone,
    checkValue,
    checkType,
    md5Encryption,
    chooseImage
};
