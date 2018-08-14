const common = {};

const fs = require("fs");

/** 判断字符串是否为空 */
common.isBlank = str => !str || !(str.trim());

/**
 * 验证是否是手机号码
 * @param  {[type]}  phone [description]
 * @return {Boolean}       [description]
 */
common.isPhone = phone => {
    if (!phone) {
        return false;
    }
    return /^1[345789]\d{9}$/.test(phone);
};

/**
 * 验证是否邮箱
 * @param  {[type]}  email [description]
 * @return {Boolean}       [description]
 */
common.isEmail = email => {
    if (!email) {
        return false;
    }
    return /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/.test(email);
};

/**
 * 验证是否身份证
 * @param  {[type]}  idCard [description]
 * @return {Boolean}        [description]
 */
common.isIDCard = idCard => {
    if (!idCard) {
        return false;
    }
    return /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/.test(idCard);
};

/**
 * 验证银行卡
 * @param  {[type]}  bankCard [description]
 * @return {Boolean}          [description]
 */
common.isBankCard = bankCard => {
    if (!bankCard) {
        return false;
    }
    return /^\d{16}|\d{19}$/.test(bankCard);
};
/**
 * 字符串加*
 * @param str
 * @returns {*}
 */
common.confidential = str => {
    let res = "";
    if (typeof res === "string") {
        // for (let i = res.length - 2; i >= 0; i -= 1) {
        //     res = res.substr(0, i);  // 取左边到指定位置的字符串
        //     res +='*'+ res.substring(i+1);   // 取指定位置到右边的字符串
        // }
        for (let i = 0; i < str.length; i++) {
            if (i < str.length - 2) {
                res += "*";
            } else {
                res += str[i];
            }
        }
        return res;
    }
    return "";
};

/**
 *
 * @param  {[type]} req [description]
 * @return {[type]}     [description]
 */
common.getFile = (req, cb) => {
    const fileInfo = []; // 文件信息
    const fileBuffer = []; // 文件内容

    let fileName = ""; // 文件名
    let fileSize = 0; // 文件大小
    let fileType = ""; // 文件类型
    let num = 0; // 经历了几个 \r\n
    let isStart = false; // 是否是文件内容

    // 获得字符串的分割线
    const contentTypeStr = req.headers["content-type"];
    const index = contentTypeStr.indexOf("boundary=");
    const boundary = contentTypeStr.substring(index).replace("boundary=", "");

    req.on("data", chunk => {
        // 处理文件流
        for (let i = 0, len = chunk.length; i < len; i += 1) {
            // 若为 \r\n
            if (chunk[i] === 13 && chunk[i + 1] === 10) {
                num += 1;
                if (num === 4) {
                    // 遇到 文件信息和 文件内容分割线
                    // 解析文件信息, 开始记录文件内容
                    i += 2; // 文件内容起始位置
                    isStart = true;

                    const infos = (new Buffer(fileInfo)).toString();
                    /*
                        infos
                        ------WebKitFormBoundaryh56Xo5sBiDOOabV0
                        Content-Disposition: form-data; name=""; filename="1.jfif"
                        Content-Type: image/jpeg
                     */
                    fileName = infos.match(/filename=".*"/g)[0].split("\"")[1]; // 获取文件名
                    fileType = infos.match(/Content-Type: image\/.*/g)[0].split(":")[1].substring(1); // 获取文件类型
                    console.log(`fileName: ${fileName}\nfileType: ${fileType}`);
                } else if (num === 5) {
                    // 遇到结束分割符
                    console.log("file is over");
                    break;
                }
            }

            if (isStart) {
                fileBuffer.push(chunk[i]); // 存储文件内容
                fileSize += 1;
            } else {
                fileInfo.push(chunk[i]); // 存储文件信息
            }
        }
    }).on("end", () => {

        // const binary = new Buffer(fileBuffer);
        // fs.writeFile(`/home/sherry/${fileName}`, binary, "binary", err => {
        //     if (err) {
        //         console.error("save error", err);
        //         cb(err);
        //     } else {
        //         console.log("save success");
        //         cb(null);
        //     }
        // });
    });
};

common.formatDate = (fmt, date = new Date()) => {
    date = new Date(date);
    var o = {
        "M+": date.getMonth() + 1, //月份
        "d+": date.getDate(), //日
        "h+": date.getHours(), //小时
        "m+": date.getMinutes(), //分
        "s+": date.getSeconds(), //秒
        "q+": Math.floor((date.getMonth() + 3) / 3), //季度
        "S": date.getMilliseconds() //毫秒
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}

export default common;
