import wepy from "wepy";
import Config from "../config/Config";
import pagesMapping from "../config/pagesMapping";
import ConstantCode from "./ConstantCode";

let firstGetUser = true;// 判断是否进入注册页面
let isLogin = false;
/** 结果解析 **/
const parseResult = result => {
    if (result.requestErr) {
        return "系统发生异常，请稍后再试";
    }
    if (result.data) {
        if (result.data.success) {
            return "操作成功";
        }
        if (result.data.message) {
            return result.data.message;
        }
        if (result.data.msg) {
            return result.data.msg;
        }
        if (result.data.reason) {
            return result.data.reason;
        }
        return result.data;
    }
    if (result.reason) {
        return result.reason;
    }
};

const _request = async(request) => {
    console.log("开始发送请求,下面是请求的参数");
    console.log(request);
    wx.showNavigationBarLoading();
    let token = await wepy.getStorageSync("token");
    if (request.method === "get" && token) {
        request.data.access_token = token.access_token;
    }
    return new Promise((resolve, reject) => {
        wx.request({
            url: request.url,
            method: request.method || "post",
            data: request.data,
            header: {
                "content-type": "application/x-www-form-urlencoded",
                "authorization": `Bearer ${token ? token.access_token : ""}`
            },
            success: async function (res) {
                if (!res.data.success) {
                    console.log("_request捕获请求异常"+parseResult(res));
                    reject({statusCode: res.statusCode, message: parseResult(res)});
                } else {
                    resolve(res);
                }
            },
            fail: (err) => {
                reject("请求发生异常");
            },
            complete: () => {
                wx.hideNavigationBarLoading();
            }
        });
    });
};

const sleep = async(timeout) => {
    return new Promise((resolve, reject) => {
        setTimeout(function () {
            resolve();
        }, timeout);
    });
};
// 不停重试方法(暴力请求并阻塞，直到login逻辑执行完)
// 该方法的基于是 后台应该永远不会返回token无效，过期。即前端的token过期判断是准确的。
// TODO 优化阻塞方式，延迟100ms再发起一次请求
// TODO login逻辑中出现问题的话，会一直循环login逻辑。
const request = async(url, data, method = "post") => {
    try {
        await wepy.checkSession();
        let token = await wepy.getStorageSync("token");
        if (!token) { // token 不存在
            await Promise.reject(new Error("TokenMissing"));
        }
        if (token.expiratime < (new Date())
            .getTime()) { // token 过期
            await Promise.reject(new Error("TokenExpire"));
        }
        // login 整个流程没走完。 如果没有该条件，那么当user.login 带着token回来的时候，后边被阻塞的请求就会过去
        // （导致的原因可能有：一个全新的用户首次进入系统，数据库里并没有他的数据。
        // 调用user.wechat之前就会有获取用户数据等请求过去，此时数据库里并没有数据）。
        if (isLogin) {
            await Promise.reject(new Error("isInLogin"));
        }
        console.log("token没毛病,准备直接发起请求");
        // 对_request 错误处理(403 刷新页面)
        try {
            const res = await _request({ url, data, method });
            return res;
        } catch (err) {
            console.log(err);
            if (err.statusCode == "403") {
                console.log("request捕获403");
                if (wx.getStorageSync("token")) {
                    wx.removeStorageSync("token");
                }
                wx.reLaunch({url: "/pages/index"});
            } else {
                return Promise.reject(err.message);
            }
        }
    } catch (err) { // session过期 或者 token不存在
        console.log("请求前的检验发现问题:" + err);
        if (isLogin) { // 正在login。一直请求
            console.log("token有问题，正在login");
            // 递归
            try {
                await sleep(200);
                let result = await request(url, data, method);
                return Promise.resolve(result);
            } catch (err) {
                return Promise.reject(err);
            }
        } else { // 不在login
            console.log("token有问题，不在login，进入login状态");
            isLogin = true;
            try {
                let loginRes = await wepy.login();
                let tokenRes = await _request({ url: Config.host + "user.login", data: loginRes });
                wx.setStorageSync("token", tokenRes.data.data);
            } catch (err) {
                // isLogin = false;
                return Promise.reject({ error: "token", message: "微信登录/获取token 失败" });
            }
            try {
                let userInfoRes = await wepy.getUserInfo();
                wx.setStorageSync("userInfo", userInfoRes.userInfo);
                await _request({ url: Config.host + "user.wechat", data: userInfoRes });
            } catch (err) {
                // isLogin = false;
                // wx.openSetting({
                //     success: function (res) {
                //         console.log(res);
                //         if (res.authSetting["scope.userInfo"]) {
                //             //这里是授权成功之后 填写你重新获取数据的js
                //             wx.setStorageSync("userInfo", userInfoRes.userInfo);
                //             isLogin = false;
                //         }
                //     },
                //     fail:function(){
                //         return Promise.reject({ error: "auth", message: "微信用户信息登录/信息入库 失败" });
                //     }
                // })
                return Promise.reject({ error: "auth", message: "微信用户信息登录/信息入库 失败" });
            }
            isLogin = false;
            console.log("新的token到了，取消login状态");
            return _request({ url, data, method });
        }
    }
};

// 队列(不能解决问题，外层await这个request，必须return promise)
// const request = async(url, data, method = "post") => {
//     try {
//         await wepy.checkSession();
//         let token = await wepy.getStorageSync("token");
//         if (!token || token.expiratime < (new Date())
//             .getTime()) {
//             await Promise.reject("TokenMissing");
//         }
//         console.log("token没毛病,准备直接发起请求");
//         return _request({ url, data, method });
//     } catch (err) { // session过期 或者 token不存在
//         return new Promise(async(resolve, reject) => {
//             console.log("token有问题:" + err);
//             if (isLogin) {
//                 console.log("token有问题，正在login");
//                 requestQueue.push({ url, data, method });
//                 console.log(requestQueue);
//             } else {
//                 console.log("token有问题，不在login");
//                 requestQueue.push({ url, data, method });
//                 console.log(requestQueue);
//                 isLogin = true;
//                 try {
//                     let loginRes = await wepy.login();
//                     let tokenRes = await _request({ url: Config.host + "user.login", data: loginRes });
//                     wx.setStorageSync("token", tokenRes.data.data);
//                     let userInfoRes = await wepy.getUserInfo();
//                     wx.setStorageSync("userInfo", userInfoRes.userInfo);
//                     await _request({ url: Config.host + "user.wechat", data: userInfoRes });
//                 } catch (err) {
//                     reject("token失效，获取新的token失败");
//                 }
//                 isLogin = false;
//                 const promiseArray = [];
//                 for(let request in requestQueue){
//                     promiseArray.push(_request(requestQueue.shift()));
//                 }
//                 return Promise.all(promiseArray).then(function(result){
//                     resolve("所有请求完成");
//                 })
//
//                 // let roll = () => {
//                 //     if (requestQueue.length > 0) {
//                 //         promiseArray.push(_request(requestQueue.shift()));
//                 //         console.log(promiseArray);
//                 //         roll();
//                 //     }
//                 // };
//                 // roll();
//             }
//         })
//     }
// };
/**
 * 缓存中获取数据库中用户的各种状态
 */
const getUserStatus = async() => {
    console.log("开始获取用户状态");
    try {
        let userStatus = await wepy.getStorage({
            key: "userStatus"
        });
        console.log("获取用户状态");
        console.log(userStatus.data);
        return Promise.resolve(userStatus.data);
    } catch (err) {
        return Promise.resolve("获取用户状态出错");
        console.log("获取用户状态出错");
    }
};

/**
 * 发起请求获取数据库中用户的各种状态
 */
const requestUserStatus = async() => {
    let res;
    try {
        res = await request(Config.host + "user.info", {}, "get");
    } catch (err) {
        return null;
    }
    let user = res.data.data;
    // 填装identity 对象，供前端使用
    // 用户身份状态
    let identity = {};
    if (user.companyList && user.companyList.length > 0) { // 存在公司
        const company = user.companyList[0];
        identity.role = company.isMaster ? "企业" : "代理人";
    }
    identity.role = user.userRole;
    switch (identity.role) {
    case "Company":
        if (user.isMaster) {
            identity.showRole = "企业"
        } else {
            identity.showRole = "代理人"
        }
        break;
    case "Person":
        identity.showRole = "个人"
        break;
    }
    identity.identityStatus = user.identityStatus;
    identity.name = user.name;
    // 当前状态名称
    identity.identityName = identity.identityStatus === ConstantCode.IDENTITY_STATUS.SUCCESS ? "已实名认证" : ((identity.identityStatus === ConstantCode.IDENTITY_STATUS.IN_PROCESSING || identity.identityStatus === ConstantCode.IDENTITY_STATUS.PASS) ? "实名认证中" : "未实名认证");
    // 当前状态编码
    identity.identityStatusCode = identity.identityStatus === ConstantCode.IDENTITY_STATUS.SUCCESS ? 2 : ((identity.identityStatus === ConstantCode.IDENTITY_STATUS.IN_PROCESSING || identity.identityStatus === ConstantCode.IDENTITY_STATUS.PASS) ? 1 : 0);
    // 是否绑定手机号且签署密码
    identity.isPhoneAndPwd = user.phone && user.hasSignPassword;
    // 是否完成了个人签署
    identity.isPersonIdentity = user.state === ConstantCode.IDENTITY_STATUS.SUCCESS;

    user.identity = identity;
    wx.setStorageSync("userStatus", user);
    console.log("存储用户状态");
    console.log(res.data.data);
    if(firstGetUser&&!identity.isPhoneAndPwd){
        setTimeout(()=>{
            wx.navigateTo({
                url: pagesMapping.phoneRegister
            });
        },1000);
        firstGetUser = false;
    }

    return res.data.data;
};

/** 弹出框封装 **/
const showModal = (title, content, showCancel, confirm, cancel) => {
    wx.showModal({
        title: title,
        content: content,
        showCancel: showCancel,
        success: function (res) {
            console.log(res);
            if (res.confirm) {
                if (confirm) {
                    confirm();
                }
            } else {
                if (cancel) {
                    cancel();
                }
            }
        }
    });
};

/** 提示封装 **/
const showToast = (title, image, successCb) => {
    // console.log(wx.canIUse('showToast.object.image'));
    if (typeof (title) != "string") {
        // title = title.toString();
        title = "未知错误";
    }
    let op = {
        title: title,
        mask: true,
        duration: 1500,
        success: function () {
            setTimeout(() => {
                wx.hideToast();
                if (successCb && typeof (successCb) === "function") {
                    successCb();
                }
            }, 1500);
        }
    };
    if (image === "error") {
        op.image = "/images/error.png";
    } else if (image === "success") {
        op.image = "/images/success.png";
    }
    wx.showToast(op);
};

const showLoading = (title = "加载中") => {
    if (wx.canIUse("showLoading")) {
        wx.showLoading({
            title: title,
            mask: true
        });
    }
};
const hideLoading = () => {
    if (wx.canIUse("hideLoading")) {
        wx.hideLoading();
    }
    else{
        wx.hideToast();
    }
    
};
const hideToast = () => {
    wx.hideToast();
};
/** refrece返回 **/
const goToReferer = (referer, delta = 1) => {
    if (!referer || referer === "") {
        wx.navigateBack({
            delta: delta
        });
        return;
    }
    wx.redirectTo({
        url: pagesMapping[referer]
    });
};

// 时间格式转换
const DateFormat = (date, fmt) => {
    // console.log(date);
    var o = {
        "M+": date.getMonth() + 1, // 月份
        "d+": date.getDate(), // 日
        "h+": date.getHours(), // 小时
        "m+": date.getMinutes(), // 分
        "s+": date.getSeconds(), // 秒
        "q+": Math.floor((date.getMonth() + 3) / 3), // 季度
        "S": date.getMilliseconds() // 毫秒
    };
    if (/(y+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "")
            .substr(4 - RegExp.$1.length));
    }
    for (var k in o) {
        if (new RegExp("(" + k + ")")
            .test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (("00" + o[k])
                .substr(("" + o[k])
                    .length)));
        }
    }
    return fmt;
    // console.log(fmt);
};

/**
 * 将日期转换为中文的星期
 * @param  {[type]} date [日期类]
 * @return {[type]}      [description]
 */
const getWeekDay = date => {
    const weekDay = ["日", "一", "二", "三", "四", "五", "六"];
    return `星期${weekDay[date.getDay()]}`;
};

const getHistoryUsers = () => {
    return wx.getStorageSync("historyUsers");
};
const pushHistoryUsers = (obj) => {
    let historyUsers = getHistoryUsers();
    if (!historyUsers) {
        historyUsers = [];
    }
    for (let index in historyUsers) {
        if (historyUsers[index].phone === obj.phone) {
            historyUsers.splice(index, 1);
            historyUsers.unshift(obj);
            wx.setStorageSync("historyUsers", historyUsers);
            return;
        }
    }
    if (historyUsers.length >= 5) {
        historyUsers.pop();
        historyUsers.unshift(obj);
    } else {
        historyUsers.unshift(obj);
    }
    wx.setStorageSync("historyUsers", historyUsers);
    return historyUsers;
};

export default {
    request,
    getUserStatus,
    requestUserStatus,
    // login,
    parseResult,
    showModal,
    showToast,
    DateFormat,
    goToReferer,
    showLoading,
    hideToast,
    hideLoading,
    getWeekDay,
    getHistoryUsers,
    pushHistoryUsers,
};
