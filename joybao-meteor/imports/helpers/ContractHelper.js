import Role from "./Role";
import ConstantCode from "./ConstantCode";
import ImageHelper from "../helpers/ImageHelper";
import Logger from "../../imports/helpers/Logger";
import SMSHelper from "../../imports/helpers/SMSHelper";
import MongoDBHelper from "../../imports/helpers/MongoDBHelper";
import ALiYunOSSHelper from "../../server/init/ALiYunOSSHelper";

import PersonDao from "../api/person/dao";
import CompanyDao from "../api/company/dao";
import PreservationDao from "../api/preservation/dao";
import { ContractDao, ContractSignatureDao } from "../api/contract/dao";

const fs = require("fs");
const path = require("path");

class ContractHelper {
    /**
     * 生成合约PDF, 并发送短信
     * @param  {[type]} contractId [description]
     * @param  {[type]} contract   [description]
     * @param  {[type]} senderId   [description]
     * @param  {[type]} senderName [description]
     * @param  {[type]} senderNeed 发起人是否需要短信
     * @return {[type]}            [description]
     */
    static newContract(contractId, contract, senderId, senderName, senderNeed = true) {
        // TODO Rename anne -> attachment
        const data = contract.annex.map(item => item.path);

        // TODO 将合约生成pdf过程改写为异步
        const generateContract = Meteor.wrapAsync(ContractHelper.generateContract);
        const resut = generateContract(contractId, data);
        if (!resut || !resut.flag) {
            Logger.error("生成合约错误");
            return 1;
        }

        // 发送人对象
        const sender = {
            userName: contract.sender.userName,
            senderPhone: contract.sender.userPhone,
            senderAvatar: contract.sender.avatar,
            refId: contract.sender.type === Role.COMPANY ? contract.sender.companyId : contract.sender.userId,
            type: contract.sender.type,
            senderName,
        };

        // 接收人入库 并 发送对象
        for (let i = 0, receiverLen = contract.receivers.length; i < receiverLen; i += 1) {
            const receiver = contract.receivers[i];
            const signCode = SMSHelper.random(6);

            const obj = {
                sender,
                signCode,
                userName: receiver.userName,
                userPhone: receiver.userPhone,
                userAvatar: receiver.userAvatar,
                contractId,
                contractName: contract.name,
                signPayment: contract.signPayment,
                receiverName: receiver.userPhone,
                signState: ConstantCode.CONTRACT.SIGNATURE_STATE.NEED_SIGNED,
                confirmState: ConstantCode.CONTRACT.CONFIRMED_STATE.NEED_CONFIRMED,
            };
            if (!senderNeed && receiver.userPhone === sender.senderPhone) {
                obj.userId = receiver.userId;
                obj.companyId = receiver.companyId;
            }

            let res = ContractSignatureDao.insert(obj);
            if (!res) {
                Logger.error(`${receiver.userPhone} insert failure`);
                return 2;
            }

            /** If receiver is Sender, not need to send SMS */
            if (senderNeed || receiver.userPhone !== sender.senderPhone) {
                /** Add SMS into queue */
                res = SMSHelper.addSMS(senderId, receiver.userPhone, ConstantCode.SMS.SCENE.SIGN_CODE, {
                    ComanyName: sender.senderName,
                    SignCode: signCode,
                });
                if (!res) {
                    Logger.error(`${receiver.userPhone} insert failure`);
                    return 3;
                }
            }
        }

        return 0;
    }

    /**
     * 判断合约是否生效
     * @param  {[type]}  contractId [description]
     * @return {Boolean}            [description]
     */
    static isEffective(contractId) {
        const data = ContractSignatureDao.list(contractId, {
            fields: MongoDBHelper.fields(["userId", "companyId", "contractState", "signState", "confirmState"]),
        });
        const sides = new Set();
        for (let i = 0, len = data.length; i < len; i += 1) {
            const item = data[i];
            // 若无公司Id则为个人身份
            if (!item.companyId && item.signState === ConstantCode.CONTRACT.SIGNATURE_STATE.SIGNED) {
                sides.add(`p${item.userId}`);
            } else if (item.companyId && item.signState === ConstantCode.CONTRACT.SIGNATURE_STATE.SIGNED) {
                // 若有公司Id 则为公司身份
                sides.add(`c${item.companyId}`);
            }

            if (item.confirmState !== ConstantCode.CONTRACT.CONFIRMED_STATE.CONFIRMED &&
                item.signState !== ConstantCode.CONTRACT.SIGNATURE_STATE.SIGNED) {
                return false;
            }
        }

        // 公司 或 个人 达到两方 则合约成立
        return sides.size >= 2;
    }

    /**
     * 合同生效要做的事
     * @param  {[type]} contractId [合约Id]
     * @return {[type]}            [description]
     */
    static effective(contractId) {
        const where = "ContractHelper effective";
        // TODO 短信通知合同生效
        let res = ContractDao.finishContract(contractId);
        if (!res) {
            Logger.error("合约生效时更新合约状态失败", where);
        }
        res = ContractSignatureDao.finishContract(contractId);
        if (!res) {
            Logger.error("合约生效时更新签署状态失败", where);
        }

        // Recover Lock signatureNumber
        const contract = ContractDao.findOneById(contractId);
        if (!contract) {
            Logger.error("合约查找不到");
        }
        if (contract.signPayment === ConstantCode.CONTRACT.SIGN_PAYMENT.SENDER) {
            const remain = contract.receivers.length - contract.signCount;
            if (remain !== 0) {
                if (contract.sender.type === Role.PERSON) {
                    res = PersonDao.updateSignatureNumber(contract.sender.userId, {
                        $inc: {
                            lockSignatureNumber: -remain,
                        },
                    });
                } else if (contract.sender.type === Role.COMPANY) {
                    res = CompanyDao.updateSignatureNumber(contract.sender.companyId, {
                        $inc: {
                            lockSignatureNumber: -remain,
                        },
                    });
                }
            }
        }

        // Add Finish Conrtact into Job
        res = PreservationDao.insert({
            contractId,
            contractName: contract.name,
            serviceId: contract.contractServiceId,
        });
        if (!res) {
            Logger.error("合约加入队列失败", where);
        }
    }

    /**
     * 合约生成
     * @description 调用Promise 来实现 异步转同步
     * @description async-awit 模式 在 Meteor.wrapAsync 下有问题 所以暂时不采用
     * @TODO async-awit 化
     * @param  {[type]}   contractId [合约Id]
     * @param  {[type]}   imageArray [合约附件Ids]
     * @param  {Function} cb         [回调结果 Meteor.wrapAsync用]
     * @return {[type]}              [description]
     */
    static generateContract(contractId, imageArray, cb) {
        const distPath = ContractHelper.getPath(contractId);

        fs.mkdirSync(distPath);
        ALiYunOSSHelper.download(imageArray, distPath)
        .then(() => ImageHelper.imgs2pdf(
            imageArray.map(item => `${distPath}${path.sep}${item}`),
            `${distPath}${path.sep}orign.pdf`,
        ))
        .then(() => {
            ContractHelper.overContract(`${distPath}${path.sep}orign.pdf`, `${distPath}${path.sep}current.pdf`);
            ContractHelper.splitContract(contractId, `${distPath}${path.sep}orign.pdf`, -1, imageArray);
        })
        .then(() => {
            ContractHelper.overContract(`${distPath}${path.sep}orign.pdf`, `${distPath}${path.sep}current.pdf`);
            ContractHelper.splitContract(contractId, `${distPath}${path.sep}orign.pdf`, -1, imageArray);
        })
        .then(() => {
            cb(null, {
                flag: true,
            });
        })
        .catch(e => {
            Logger.error(e, "generateContract");
            cb(null, {
                flag: false,
            });
        });
    }

    /**
     * 合约签署
     * @param  {[type]}   contractId [合约Id]
     * @param  {[type]}   fileName   [对应的文件名]
     * @param  {[type]}   page       [页数]
     * @param  {Function} cb         [description]
     * @return {[type]}              [description]
     */
    static signatureContract(contractId, fileName, page, cb) {
        const attachment = ContractDao.getAnnex(contractId).map(item => item.path);
        const distPath = ContractHelper.getPath(contractId);
        const flag = ContractHelper.overContract(fileName, `${distPath}${path.sep}current.pdf`);
        if (!flag) {
            Logger.error("overContract false");
            return cb && cb(null, { flag: false });
        }

        return ContractHelper.splitContract(contractId, fileName, page, attachment).then(
            () => cb && cb(null, {
                flag: true,
            }),
            err => {
                Logger.error(err, "signatureContract");
                return cb && cb(null, {
                    flag: false,
                });
            },
        );
    }

    /**
     * 分解合约PPT 并上传到阿里云替换对应的文件
     * 按照 pages 和 attachment Id 进行文件一一对应并覆盖阿里云的图片
     * @TODO 添加指定 两页或三页进行覆盖
     * @description Pages和attachment 应该一一对应
     * @param  {[type]}   contractId [合约Id]
     * @param  {[type]}   fileName   [对应的合约文件名]
     * @param  {[type]}   page       [页码数 -1: 代表全部 其余代表对应的页码]
     * @param  {[type]}   attachment [附件Id列表]
     * @return {Promise}             [description]
     */
    static splitContract(contractId, fileName, page, attachment) {
        return new Promise((resolve, reject) => {
            // 合约PDF复制
            const distPath = ContractHelper.getPath(contractId);
            ImageHelper.pdf2imgs(fileName, `${distPath}${path.sep}tmp.jpg`)
            .then(() => {
                if (attachment.length === 1) {
                    // 单页合约 单页签署
                    // 阿里云只需替换一张图片
                    return ALiYunOSSHelper.upload([attachment[0]], [`${distPath}${path.sep}tmp.jpg`]);
                } else if (page === -1) {
                    // 多页合约 全部签署
                    // 阿里云全部图片替换
                    const paths = [];
                    for (let i = 0, len = attachment.length; i < len; i += 1) {
                        paths.push(`${distPath}${path.sep}tmp-${i}.jpg`);
                    }
                    return ALiYunOSSHelper.upload(attachment, paths);
                }

                // 多页合约 单页签署
                // 阿里云单张图片替换
                const index = parseInt(page, 10) - 1;
                return ALiYunOSSHelper.upload([attachment[index]], [`${distPath}${path.sep}tmp-${index}.jpg`]);
            })
            .then(resolve).catch(reject);
        });
    }

    /**
     * 根据合约Id获得对应的合约版本文件夹路径
     * @param  {[type]} contractId [合约Id]
     * @param  {[type]} version    [传入的版本号]
     * @return {[type]}            [description]
     */
    static getPath(contractId) {
        return `${Meteor.settings.ESign.contractPath}/${contractId}`;
    }

    /**
     * 复制文件
     * @param  {[type]} sourcePath [源文件]
     * @param  {[type]} distPath   [复制的目录]
     * @return {[type]}            [description]
     */
    static overContract(sourcePath, distPath) {
        try {
            fs.writeFileSync(distPath, fs.readFileSync(sourcePath));
            return true;
        } catch (e) {
            return false;
        }
    }
}

export default ContractHelper;
