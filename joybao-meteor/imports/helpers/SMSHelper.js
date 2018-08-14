import SMSDao from "../api/sms/dao";
import ValidateCodeDao from "../api/validateCode/dao";

import common from "./Common";
import Logger from "./Logger";
import MongoDBHelper from "./MongoDBHelper";
import ConstantCode from "./ConstantCode";

import { AliYunSMSHelper, ALiDaYu } from "../../server/init/AliYunSMSHelper";

class SMSHelper {
    /**
     * Prepare to send SMS with validateCode
     * @param {[type]} userId [user unique Id]
     * @param {[type]} phone  [user phone the recivers phone]
     * @param {[type]} code   [the validateCode]
     * @param {[type]} scene  [the sms scene  e.g SIGN_CODE]
     */
    static addValidateCode(userId, phone, code, scene) {
        // Join in validateCode Collection
        const res = ValidateCodeDao.insert({
            userId,
            phone,
            validateCode: code,
            scene,
        });
        if (!res) {
            return res;
        }

        return SMSHelper.addSMS(userId, phone, scene, { VerifyCode: code });
    }

    /**
     * Add SMS Into SMSQueue
     * @param {[type]} userId [sender userId]
     * @param {[type]} phone  [reciver phone]
     * @param {[type]} scene  [sms scene]
     * @param {[type]} params [sms arguments]
     */
    static addSMS(userId, phone, scene, params) {
        let templateId;
        switch (scene) {
            case ConstantCode.SMS.SCENE.VALIDATE_CODE:
                // Binding user phone
                templateId = ALiDaYu.SMSType.PHONE_CODE.value;
                break;
            case ConstantCode.SMS.SCENE.RESET_SIGN_PASSWORD:
                // Rester user signpassword
                templateId = ALiDaYu.SMSType.RESET_SIGN_PASSWORD_CODE.value;
                break;
            case ConstantCode.SMS.SCENE.SIGN_CODE:
                // Sender signatureNumber
                templateId = ALiDaYu.SMSType.SIGN_CODE.value;
                break;
            default:
                templateId = undefined;
        }

        if (!templateId) {
            return null;
        }

        // Join SMS wait queue
        return SMSDao.insert({
            userId,
            phone,
            scene,
            params: JSON.stringify(params),
            templateId,
        });
    }

    /**
     * 验证手机验证码
     * @param  {[type]} phone        [手机号码]
     * @param  {[type]} validateCode [短信验证码]
     * @param  {[type]} expiredTime  [过期时间]
     * @param  {[type]} scene        [应用场景]
     * @return {[Number]}            [0 验证通过 1 手机格式不正确 2 未发送验证码]
     */
    static checkValidateCode(phone, validateCode, expiredTime, scene) {
        if (!common.isPhone(phone)) {
            return 1;
        }

        const beginFindTime = new Date(new Date().getTime() - expiredTime);

        const codes = ValidateCodeDao.find({
            phone,
            scene,
            createdAt: { $gte: beginFindTime }
        }, { fields: MongoDBHelper.fields(["_id", "createdAt", "validateCode"]), sort: { createdAt: -1 } });
        if (!codes || codes.length === 0) {
            return 2;
        }

        for (let i = 0; i < codes.length; i += 1) {
            if (codes[i].validateCode === validateCode) {
                // 更新验证码状态
                ValidateCodeDao.update(codes[i]._id, { $set: { status: ConstantCode.MOBILE_VALIDATE_CODE.STATUS.VALIDATE_SUCCESS } });
                return 0;
            }
        }
        return 2;
    }

    /**
     * 检查发送频率
     * @param  {[type]} phone  [手机号码]
     * @param  {[type]} scene  [应用场景]
     * @return {[type]}        [是否有重复发送]
     */
    static checkRepeatSend(userId, scene) {
        const beginFindTime = new Date(new Date()
            .getTime() - ConstantCode.MOBILE_VALIDATE_CODE.SEND_INTERVAL);

        const codes = ValidateCodeDao.find({ userId, scene, createdAt: { $gte: beginFindTime } }, {
            fields: MongoDBHelper.fields(["createdAt"]),
            sort: { createdAt: -1 },
        });

        if (!codes || codes.length === 0) {
            return 0;
        }
        return 2;
    }

    /**
     * 生成随机验证码
     * @param  {[type]}  number            [位数]
     * @param  {Boolean} [onlyNumber=true] [是否纯数字]
     * @return {[type]}                    [随机字符串]
     */
    static random(number, onlyNumber = true) {
        if (onlyNumber) {
            return Math.random().toString().slice(-1 * number);
        }
        const randomArr = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9,
            "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"
        ];

        let res = "";
        for (let i = 0; i < number; i += 1) {
            res += randomArr[Math.floor(Math.random() * 36)];
        }
        return res;
    }

    /**
     * 扫描短信发送表
     * @TODO 错误处理
     * @return {[type]} [description]
     */
    static scanSMS() {
        const beginDate = new Date();
        const list = SMSDao.find({ state: ConstantCode.SMS.STATE.WAIT, sendDate: { $lte: beginDate } });
        if (list.length !== 0) {
            Logger.info(`send sms count: ${list.length}`);
        }
        list.forEach(item => {
            AliYunSMSHelper.sendSMS(item.params, item.phone, item.templateId).then(
                () => {
                    const res = SMSDao.update({ _id: item._id }, { state: ConstantCode.SMS.STATE.FINISH });
                    if (!res) {
                        Logger.error(`update sms error id: ${item._id}`);
                    }
                },
                err => {
                    const res = SMSDao.update({ _id: item._id }, {
                        state: ConstantCode.SMS.STATE.ERROR,
                        errorCode: err.code,
                        erorrMsg: err.data,
                    });
                    if (!res) {
                        Logger.error(`update sms error id: ${item._id}`);
                    }
                }
            );
        });
    }
}

export default SMSHelper;
