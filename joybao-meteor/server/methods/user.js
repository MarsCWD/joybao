import { RestMethodMixin } from "meteor/simple:rest-method-mixin";
import { SimpleSchema } from "meteor/aldeed:simple-schema";

import { ContractSignatureDao } from "../../imports/api/contract/dao";
import PersonDao from "../../imports/api/person/dao";
import CompanyDao from "../../imports/api/company/dao";
import AgentRecordDao from "../../imports/api/agent/dao";

import API from "../../imports/http/wechat/api";
import Role from "../../imports/helpers/Role";
import common from "../../imports/helpers/Common";

import Logger from "../../imports/helpers/Logger";
import GrantAPI from "../../imports/http/grant/api";
import UserHelper from "../../imports/helpers/UserHelper";
import SessionHelper from "../collections/session";
import SMSHelper from "../../imports/helpers/SMSHelper";
import WXBizDataCryptHelper from "../../imports/helpers/WechatHelper";
import MongoDBHelper from "../../imports/helpers/MongoDBHelper";
import ValidatedMethod from "../../imports/helpers/CustomValidatedMethod";
import validator from "../../imports/helpers/simple-schema-validator";
import ConstantCode from "../../imports/helpers/ConstantCode";
import { ErrorCode, ErrorJSON } from "../../imports/helpers/ErrorJson";

import ServerConfigDao from "../../imports/api/config/dao";

const Config = ServerConfigDao.findMany(["WeChat", "Token"]);

/**
 * TODO 添加查找关联用户表
 * 手机号查找用户
 * 步骤:
 * 1. 根据手机号码获取用户
 *    判断 若用户不存在
 *    判断 用户是否实名
 * 2. 真实姓名加 *
 */
new ValidatedMethod({
    name: "user.getByPhone",
    mixins: [RestMethodMixin],
    validate: validator(new SimpleSchema({
        phone: {
            label: "查询的手机号码",
            type: String,
            regEx: SimpleSchema.RegEx.ChinaPhone,
        }
    })),
    run({ phone }) {
        const person = PersonDao.findOne({ phone }, {
            fields: MongoDBHelper.fields([
                "phone",
                "avatarUrl",
                "realName",
                "nickName",
            ])
        });

        // 用户不存在
        if (!person) {
            return ErrorJSON(ErrorCode.PERSON.NOBODY);
        }
        person.realName = person.realName ? common.confidential(person.realName) : person.nickName;
        return { success: true, data: person };
    },
    restOptions: {
        url: "/user.getByPhone",
        httpMethod: "get",
        getArgsFromRequest(req) {
            const phone = req.query.phone;
            return [{ phone }];
        },
    },
});

/**
 * 第三方客户端调用,获取可用的Token
 */
new ValidatedMethod({
    name: "user.oauth.token",
    mixins: [RestMethodMixin],
    validate: validator(new SimpleSchema({
        appID: {
            label: "appID", // 其实就是clientID
            type: String,
        },
        appSecret: {
            label: "appSecret", // 其实就是clientSecret
            type: String,
        },
    })),
    run({ appID, appSecret }) {
        const getToken = Meteor.wrapAsync(GrantAPI.getAccessToken);
        const tokenObj = getToken(appID, appSecret);
        if (!tokenObj.success) {
            Logger.error("获取结果出错");
            return ErrorJSON(ErrorCode.THIRD.ADMIN_SECRET_ERROR);
        }
        const res = tokenObj.data;

        const sessionObj = {
            userId: res.user._id, // 客户端的用户ID
            clientName: res.user.name, // 客户端名字

            user: res.user,
            client: res.client,
            token: res.access_token,
            expiratime: res.accessTokenExpiresAt,
            isThirdParty: true,
        };

        const result = SessionHelper.sessionUpsert({ clientID: appID }, sessionObj);
        if (!result) {
            Logger.error("更新Session出错");
            return ErrorJSON(ErrorCode.SERVER);
        }

        return {
            success: true,
            data: {
                access_token: res.access_token,
                expiratime: res.accessTokenExpiresAt,
            }
        };
    },
    restOptions: {
        url: "/user.oauth.token",
        getArgsFromRequest(req) {
            return [req.body];
        },
    },
});

/**
 * 微信授权登录, 获得SessionKey 返回Token
 * 1. 根据登录Code向微信服务器获取SessionKey 和 openId
 *    判断是否有OpenId 无 则为无效的Code
 * 2. 生成Token, 根据OpenId进行更新或插入Session记录
 */
new ValidatedMethod({
    name: "user.login",
    mixins: [RestMethodMixin],
    validate: validator(new SimpleSchema({
        code: {
            label: "登录获得的JSCode",
            type: String
        }
    })),
    run({ code }) {
        const requestSync = Meteor.wrapAsync((jsCode, cb) => {
            API.getSessionKey(jsCode, { dataType: "json" }, cb);
        });

        const res = requestSync(code);
        if (res) {
            if (res.openid) {
                const token = SessionHelper.generateToken();
                const expiratime = new Date()
                    .getTime() + Config.Token.expiratime;
                const sessionObj = { token: token.token, openid: res.openid, sessionKey: res.session_key, expiratime };
                const result = SessionHelper.sessionUpsert({ openid: res.openid }, sessionObj);
                if (!result) {
                    return ErrorJSON(ErrorCode.SERVER);
                }
                return { success: true, data: { access_token: token.token, expiratime } };
            }
            return ErrorJSON(ErrorCode.WECHAT_INVALID);
        }
        return ErrorJSON(ErrorCode.WECHAT_CODE);
    },
    restOptions: {
        url: "/user.login",
        getArgsFromRequest(req) {
            return [req.body];
        },
    },
});

/**
 * 微信授权登录, 获得SessionKey 返回Token
 * 1. 根据登录Code向微信服务器获取SessionKey 和 openId
 *    判断是否有OpenId 无 则为无效的Code
 * 2. 生成Token, 根据OpenId进行更新或插入Session记录
 */
new ValidatedMethod({
    name: "app.accessToken",
    mixins: [RestMethodMixin],
    validate: validator(new SimpleSchema({
        code: {
            label: "登录获得的JSCode",
            type: String
        }
    })),
    run({ code }) {
        const requestSync = Meteor.wrapAsync((jsCode, cb) => {
                API.getSessionKey(jsCode, { dataType: "json" }, cb);
    });

        const res = requestSync(code);
        if (res) {
            if (res.openid) {
                const token = SessionHelper.generateToken();
                const expiratime = new Date()
                        .getTime() + Config.Token.expiratime;
                const sessionObj = { token: token.token, openid: res.openid, sessionKey: res.session_key, expiratime };
                const result = SessionHelper.sessionUpsert({ openid: res.openid }, sessionObj);
                if (!result) {
                    return ErrorJSON(ErrorCode.SERVER);
                }
                return { success: true, data: { access_token: token.token, expiratime } };
            }
            return ErrorJSON(ErrorCode.WECHAT_INVALID);
        }
        return ErrorJSON(ErrorCode.WECHAT_CODE);
    },
    restOptions: {
        url: "/app.accessToken",
        getArgsFromRequest(req) {
            return [req.body];
        },
    },
});

/**
 * 解密UserInfo
 * 1. TODO 暂时不用 核对当前数据的完整性
 * 2. 根据当前数据解析得到微信信息
 * 3. 根据用户的unionId 更新个人资料
 * 4. 根据unionId获得用户的UserId
 * 5. 更新Session对象
 */
new ValidatedMethod({
    name: "user.wechat",
    mixins: [RestMethodMixin],
    validate: validator(new SimpleSchema({
        rawData: {
            label: "原始数据字符串",
            type: String,
        },
        signature: {
            label: "签名",
            type: String,
        },
        encryptedData: {
            label: "加密数据",
            type: String,
        },
        iv: {
            label: "加密算法的初始向量",
            type: String,
        },
        session: {
            type: Object,
            blackbox: true,
        }
    })),
    // run({ rawData, signature, encryptedData, iv, session }) {
    run({ encryptedData, iv, session }) {
        // const temp = JSON.stringify(rawData);
        // let res = WXBizDataCryptHelper.checkSignature(`${temp}${sessionKey}`, signature);
        // if (!res) {
        //     return ErrorJSON(ErrorCode.WECHAT_INVALID);
        // }

        /** 解密获得敏感信息 **/
        const helper = new WXBizDataCryptHelper(Config.WeChat.appID, session.sessionKey);
        const data = helper.decryptData(encryptedData, iv);

        /** 更新用户信息表 **/
        let res = PersonDao.upsertWechat(data);
        if (!res) {
            return ErrorJSON(ErrorCode.SERVER);
        }

        const person = PersonDao.findOne({ unionId: data.unionId });
        if (!person) {
            return ErrorJSON(ErrorCode.SERVER);
        }
        const sessionObj = {};
        sessionObj.userId = person._id;

        /** 更新Session对象 加入userId **/
        res = SessionHelper.sessionUpdate(session.token, {
            userId: person._id,
            avatar: person.avatarUrl,
            realName: session.realName || person.nickName,
        });
        if (!res) {
            return ErrorJSON(ErrorCode.SERVER);
        }

        return { success: true };
    },
    restOptions: {
        url: "/user.wechat",
        getArgsFromRequest(req) {
            const obj = req.body;
            obj.session = req.session;
            return [obj];
        },
    },
});

/**
 * 获取UserInfo
 */
new ValidatedMethod({
    name: "user.info",
    mixins: [RestMethodMixin],
    validate: null,
    run({ session }) {
        const data = {};
        data.phone = session.phone;
        data.state = session.state; // 当前个人状态
        data.avatarUrl = session.avatar;
        data.name = session.name || session.realName; // 显示身份名字
        data.defaultSealId = session.defaultSealId; // 默认签章Id
        data.identityStatus = session.identityState; // 当前身份认证状态

        if (session.currentCompanyId) {
            data.defaultCompanyId = session.currentCompanyId; // 当前公司Id
            data.userRole = Role.COMPANY;
            if (session.isMaster !== undefined) {
                data.isMaster = session.isMaster; // 是否主体账户
            }
        } else {
            data.userRole = Role.PERSON;
        }

        if (session.identityState === ConstantCode.IDENTITY_STATUS.SUCCESS) {
            if (session.currentCompanyId) {
                const company = CompanyDao.findOneByCompanyId(session.currentCompanyId);
                if (!company) {
                    return ErrorJSON(ErrorCode.SERVER);
                }
                data.signatureNumber = company.signatureNumber - company.lockSignatureNumber;
            } else {
                const user = PersonDao.findOneByUserId(session.userId);
                if (!user) {
                    return ErrorJSON(ErrorCode.SERVER);
                }
                data.signatureNumber = user.signatureNumber - user.lockSignatureNumber;
            }
        }

        data.hasSignPassword = !!session.signpassword; // 是否有签署密码
        data.isAdmin = session.isAdmin === "true"; // 是否是管理员

        return { success: true, data };
    },
    restOptions: {
        url: "/user.info",
        httpMethod: "get",
        getArgsFromRequest(req) {
            return [{ session: req.session }];
        },
    },
});

/**
 * 获取用户当前查看数量
 */
new ValidatedMethod({
    name: "user.counts",
    mixins: [RestMethodMixin],
    validate: null,
    run({ session }) {
        /** 获取当前用户合约状态 **/
        let contractCounts = null;
        if (session.phone) {
            contractCounts = ContractSignatureDao.userCount(session.phone, session.lastQueryDate)[0];
        }
        return { success: true, data: { contractCounts } };
    },
    restOptions: {
        url: "/user.counts",
        httpMethod: "get",
        getArgsFromRequest(req) {
            const obj = req.body;
            obj.session = req.session;
            return [obj];
        },
    },
});

/**
 * 修改用户身份
 */
new ValidatedMethod({
    name: "user.change",
    mixins: [RestMethodMixin],
    validate: validator(new SimpleSchema({
        session: {
            type: Object,
            blackbox: true,
        },
        companyId: {
            type: String,
            optional: true,
        },
    })),
    run({ session, companyId }) {
        if (companyId) {
            if (session.userRole === Role.COMPANY && session.currentCompanyId === companyId) {
                return ErrorJSON(ErrorCode.USER_ROLE);
            }

            const obj = session.companyList.find(item => item.companyId === companyId);
            if (!obj) {
                return ErrorJSON(ErrorCode.COMPANY.UNEXISTED);
            }
        }

        const resArr = UserHelper.getCurrentRoleInfo(session.userId, companyId);
        if (resArr[0] !== ErrorCode.SUCCESS) {
            return ErrorJSON(resArr[0]);
        }
        const sessionObj = resArr[1];
        const signatureNumber = resArr[2];

        /** 更新Session对象**/
        const res = SessionHelper.sessionUpdate(session.token, sessionObj);
        if (!res) {
            return ErrorJSON(ErrorCode.SERVER);
        }
        return {
            success: true,
            data: {
                signatureNumber,
                name: sessionObj.name,
                state: sessionObj.state, // 用户状态
                phone: sessionObj.phone,
                userRole: sessionObj.userRole,
                isMaster: sessionObj.isMaster,
                companyList: sessionObj.companyList,
                defaultSealId: sessionObj.defaultSealId,
                identityStatus: sessionObj.identityState, // 当前身份状态
                defaultCompanyId: sessionObj.currentCompanyId,
            }
        };
    },
    restOptions: {
        url: "/user.change",
        httpMethod: "post",
        getArgsFromRequest(req) {
            const obj = req.body;
            obj.session = req.session;
            return [obj];
        },
    },
});

/**
 * TODO 转publish
 * 用户发送短信绑定手机号码
 * 1. 判断当前用户是否已经绑定手机号码
 * 2. 判断该号码是否已被其他用户绑定
 * 3. 判断是否为重复发送
 * 4. 生成随机验证码
 * 5. 短信入库, 并进行发送
 */
new ValidatedMethod({
    name: "user.sendValidateCode",
    mixins: [RestMethodMixin],
    validate: validator(new SimpleSchema({
        session: {
            type: Object,
            blackbox: true,
        },
        phone: {
            label: "电话号码",
            type: String,
            regEx: SimpleSchema.RegEx.ChinaPhone,
        },
    })),
    run({ session, phone }) {
        /** 若当前用户已经绑定手机号码 **/
        if (session.phone) {
            return ErrorJSON(ErrorCode.PERSON.HAS_PHONE);
        }

        /** 若已经有账户绑定该手机号码 **/
        if (PersonDao.hasPhone(phone)) {
            return ErrorJSON(ErrorCode.PERSON.HAS_PERSON_PHONE);
        }

        /** 检查是否重复发送 **/
        let res = SMSHelper.checkRepeatSend(session.userId, ConstantCode.SMS.SCENE.VALIDATE_CODE);
        if (res) {
            return ErrorJSON(ErrorCode.SMS.REPEAT);
        }

        /** 生成随机验证码 **/
        const code = SMSHelper.random(6);

        /** 发送短信并进行数据入库 **/
        res = SMSHelper.addValidateCode(session.userId, phone, code, ConstantCode.SMS.SCENE.VALIDATE_CODE);
        if (!res) {
            return ErrorJSON(ErrorCode.SERVER);
        }

        return { success: true };
    },
    restOptions: {
        url: "/user.sendValidateCode",
        getArgsFromRequest(req) {
            const obj = req.body;
            obj.session = req.session;
            return [obj];
        },
    },
});

/**
 * 手机验证
 * 1. 判断当前用户是否已经绑定手机号码
 * 2. 判断该号码是否已被其他用户绑定
 * 3. 检查验证码是否匹配
 * 4. 更新当前用户绑定手机号码
 */
new ValidatedMethod({
    name: "user.phone",
    mixins: [RestMethodMixin],
    validate: validator(new SimpleSchema({
        session: {
            type: Object,
            blackbox: true,
        },
        phone: {
            label: "电话号码",
            type: String,
            regEx: SimpleSchema.RegEx.ChinaPhone,
        },
        code: {
            label: "验证码",
            type: String,
        }
    })),
    run({ session, phone, code }) {
        /** 若当前用户已经绑定手机号码 **/
        if (session.phone) {
            return ErrorJSON(ErrorCode.PERSON.HAS_PHONE);
        }

        /** 若已经有账户绑定该手机号码 **/
        if (PersonDao.hasPhone(phone)) {
            return ErrorJSON(ErrorCode.PERSON.HAS_PERSON_PHONE);
        }

        /** 检查是否与验证码匹配 **/
        let res = SMSHelper.checkValidateCode(
            phone,
            code,
            ConstantCode.MOBILE_VALIDATE_CODE.EXPIRED_TIME_LIMIT,
            ConstantCode.SMS.SCENE.VALIDATE_CODE);
        if (res) {
            return ErrorJSON(ErrorCode.PERSON.VALIDATOR_PHONE_ERROR);
        }

        /** 更新用户手机号码 **/
        res = PersonDao.updateSpecifiedFieldById(session.userId, { phone });
        if (!res) {
            return ErrorJSON(ErrorCode.SERVER);
        }

        res = SessionHelper.sessionUpdate(session.token, { phone });
        if (!res) {
            return ErrorJSON(ErrorCode.SERVER);
        }

        return { success: true };
    },
    restOptions: {
        url: "/user.phone",
        getArgsFromRequest(req) {
            const obj = req.body;
            obj.session = req.session;
            return [obj];
        },
    },
});

/**
 * 签署密码重置
 * @type {String}
 */
new ValidatedMethod({
    name: "user.signpassword.sendValidateCode",
    mixins: [RestMethodMixin],
    validate: validator(new SimpleSchema({
        session: {
            type: Object,
            blackbox: true,
        },
    })),
    run({ session }) {
        // 用户签署密码存在
        if (!session.signpassword) {
            return ErrorJSON(ErrorCode.PERSON.NO_SIGN_PASSWORD);
        }

        /** 检查是否重复发送 **/
        let res = SMSHelper.checkRepeatSend(session.userId, ConstantCode.SMS.SCENE.RESET_SIGN_PASSWORD);
        if (res) {
            return ErrorJSON(ErrorCode.SMS.REPEAT);
        }

        /** 生成随机验证码 **/
        const code = SMSHelper.random(6);

        /** 发送短信并进行数据入库 **/
        res = SMSHelper.addValidateCode(session.userId, session.phone, code, ConstantCode.SMS.SCENE.RESET_SIGN_PASSWORD);
        if (!res) {
            return ErrorJSON(ErrorCode.SERVER);
        }
        return { success: true };
    },
    restOptions: {
        url: "/user.signpassword.sendValidateCode",
        getArgsFromRequest(req) {
            const obj = req.body;
            obj.session = req.session;
            return [obj];
        },
    },
});

//  绑定签署密码
new ValidatedMethod({
    name: "user.signpassword.reset",
    mixins: [RestMethodMixin],
    validate: validator(new SimpleSchema({
        session: {
            type: Object,
            blackbox: true,
        },
        code: {
            label: "验证码",
            type: String,
        },
        signpassword: {
            label: "签署密码",
            type: String,
        }
    })),
    run({ session, code, signpassword }) {
        /** 检查是否与验证码匹配 **/
        let res = SMSHelper.checkValidateCode(
            session.phone,
            code,
            ConstantCode.MOBILE_VALIDATE_CODE.EXPIRED_TIME_LIMIT,
            ConstantCode.SMS.SCENE.RESET_SIGN_PASSWORD);
        if (res) {
            return ErrorJSON(ErrorCode.PERSON.VALIDATOR_SIGN_PASSWORD_RESET_ERROR);
        }

        /** 更新签署密码 **/
        res = SessionHelper.sessionUpdate(session.token, { signpassword });
        if (!res) {
            return ErrorJSON(ErrorCode.SERVER);
        }

        return { success: true };
    },
    restOptions: {
        url: "/user.signpassword.reset",
        getArgsFromRequest(req) {
            const obj = req.body;
            obj.session = req.session;
            return [obj];
        },
    },
});

//  绑定签署密码
new ValidatedMethod({
    name: "user.signpassword",
    mixins: [RestMethodMixin],
    validate: validator(new SimpleSchema({
        session: {
            type: Object,
            blackbox: true,
        },
        signpassword: {
            label: "签署密码",
            type: String,
        }
    })),
    run({ session, signpassword }) {
        // 用户签署密码存在
        if (session.signpassword) {
            return ErrorJSON(ErrorCode.PERSON.HAS_SIGN_PASSWORD);
        }

        const res = SessionHelper.sessionUpdate(session.token, { signpassword });
        if (!res) {
            return ErrorJSON(ErrorCode.SERVER);
        }

        return { success: true };
    },
    restOptions: {
        url: "/user.signpassword",
        getArgsFromRequest(req) {
            const obj = req.body;
            obj.session = req.session;
            return [obj];
        },
    },
});

// 代理人证书查看
new ValidatedMethod({
    name: "user.agent.view",
    mixins: [RestMethodMixin],
    validate: validator(new SimpleSchema({
        phone: {
            label: "手机号码",
            type: String,
            regEx: SimpleSchema.RegEx.ChinaPhone,
        },
        companyId: {
            label: "公司id",
            type: String,
        },
    })),
    run({ phone, companyId }) {
        const person = PersonDao.findOne({ phone });
        if (!person) {
            return ErrorJSON(ErrorCode.PERSON.NOT_FOUND_BY_PHONE);
        }

        const agentRecord = AgentRecordDao.findAgent(person._id, companyId);
        if (!agentRecord) {
            return ErrorJSON(ErrorCode.AGENT.NO_FOUND_AGENT);
        }

        return { success: true, data: { certificateId: agentRecord.certificateId } };
    },
    restOptions: {
        url: "/user.agent.view",
        getArgsFromRequest(req) {
            const obj = req.body;
            obj.session = req.session;
            return [obj];
        },
    },
});
