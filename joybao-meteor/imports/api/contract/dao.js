import { Contract } from "./Contract";
import { ContractTemplate } from "./ContractTemplate";
import { ContractSignature } from "./ContractSignature";

import MongoDBHelper from "../../helpers/MongoDBHelper";
import Logger from "../../helpers/Logger";

import ConstantCode from "../../helpers/ConstantCode";

class ContractDao {
    static insert(obj) {
        return Contract.insert(obj);
    }

    static find(selector, options) {
        const selectorObj = selector;
        selectorObj.isActive = true;
        return Contract.find(selectorObj, options).fetch();
    }

    static findOneById(contractId, options) {
        return Contract.findOne({ _id: contractId, isActive: true }, options);
    }

    static update(selector, options) {
        return Contract.update(selector, options);
    }

    static updateSpecifiedFieldById(contractId, obj) {
        return Contract.update({ _id: contractId }, { $set: obj });
    }

    static remove(contractId) {
        return Contract.update({ _id: contractId }, { $set: { isActive: false } });
    }

    static finishContract(contractId) {
        return Contract.update({
            _id: contractId,
            isActive: true,
        }, { $set: { status: ConstantCode.CONTRACT.CONTRACT_STATUS.FINISH } });
    }

    static getAnnex(contractId) {
        return Contract.findOne({ _id: contractId, isActive: true }, {
            fields: MongoDBHelper.fields(["annex"]),
        }).annex;
    }
}

class ContractTemplateDao {
    static find(selector, options) {
        return ContractTemplate.find(selector, options).fetch();
    }

    static exist(id) {
        return ContractTemplate.find({ _id: id }).count() !== 0;
    }
}

// TODO 添加总签署次数和当月签署次数的查询
class ContractSignatureDao {
    static insert(obj) {
        return ContractSignature.insert(obj);
    }

    static find(selector, options) {
        return ContractSignature.find(selector, options).fetch();
    }

    static finishContract(contractId) {
        return ContractSignature.update({ contractId }, { $set: { contractState: ConstantCode.CONTRACT.CONTRACT_STATUS.FINISH } }, { multi: true });
    }

    /**
     * 根据合约Id查看当前合约下的签约情况
     * @param  {[type]} contractId [description]
     * @param  {[type]} options    [description]
     * @return {[type]}            [description]
     */
    static list(contractId, options) {
        return ContractSignature.find({
            contractId,
            contractState: ConstantCode.CONTRACT.CONTRACT_STATUS.WAIT,
        }, options).fetch();
    }

    static findOneById(id) {
        return ContractSignature.findOne({ _id: id });
    }

    /** 根据第三方资料查询 **/
    static findOneThird(userId, companyId, contractId, options) {
        const query = { userId, companyId, contractId };
        return ContractSignature.find(query, options);
    }

    /** 查找单一记录 **/
    static findOne(userPhone, contractId) {
        return ContractSignature.findOne({ userPhone, contractId });
    }

    /** 判断在该合约中此公司是否已经有人进行签署 **/
    static hasSign(contractId, companyId) {
        return ContractSignature.find({ contractId, companyId }).count() !== 0;
    }

    /** 获取已确认的数量 **/
    static confirmCount(contractId) {
        return ContractSignature.find({
            contractId,
            confirmState: ConstantCode.CONTRACT.CONFIRMED_STATE.CONFIRMED,
        }).count();
    }

    /** 获取已签署的数量 **/
    static signCount(contractId) {
        return ContractSignature.find({
            contractId,
            confirmState: ConstantCode.CONTRACT.CONFIRMED_STATE.CONFIRMED,
            signState: { $in: [ConstantCode.CONTRACT.SIGNATURE_STATE.SIGNED, ConstantCode.CONTRACT.SIGNATURE_STATE.NEED_ESIGN] },
        }).count();
    }

    /** 查询当前用户的签约次数 **/
    static personSignNumber(userId) {
        return ContractSignature.find({
            userId,
            signState: ConstantCode.CONTRACT.SIGNATURE_STATE.SIGNED,
            companyId: { $exists: false },
        }).count();
    }

    /** 查询当前公司的签约次数 **/
    static companySignNumber(companyId) {
        return ContractSignature.find({
            companyId,
            signState: ConstantCode.CONTRACT.SIGNATURE_STATE.SIGNED,
        }).count();
    }

    /**
     * 合约个人确认
     * @param  {String} recordId     签署记录Id
     * @param  {String} userId       签署者Id
     * @param  {String} userName     签署者姓名
     * @param  {String} userAvatar   签署者头像
     * @param  {String} companyId    签署者当前公司
     * @param  {String} receiverName 签署者当前身份名
     * @return {[type]}              [description]
     */
    static confirm(recordId, userId, userName, userAvatar, companyId, receiverName) {
        return ContractSignature.update({ _id: recordId }, {
            $set: {
                userId,
                userName,
                userAvatar,
                companyId,
                receiverName,
                confirmState: ConstantCode.CONTRACT.CONFIRMED_STATE.CONFIRMED,
            },
        });
    }

    /**
     * 合约个人签署
     * @param  {String}  recordId        签署记录Id
     * @param  {String}  userId          签署者Id
     * @param  {String}  userName        签署者姓名
     * @param  {String}  userAvatar      签署者头像
     * @param  {String}  companyId       签署者当前公司
     * @param  {String}  receiverName    签署者当前身份名
     * @param  {String}  accountId       签署者当前的ESignId
     * @param  {Object}  signPosition    签署位置
     * @param  {Boolean} [hasSign=false] 是否已经完成签署
     * @return {[type]}                  [description]
     */
    static sign(recordId, userId, userName, userAvatar, companyId, receiverName, accountId, signPosition, hasSign = false) {
        return ContractSignature.update({ _id: recordId }, {
            $set: {
                userId,
                userName,
                userAvatar,
                companyId,
                receiverName,
                accountId,
                signPosition,
                confirmState: ConstantCode.CONTRACT.CONFIRMED_STATE.CONFIRMED,
                signState: hasSign ? ConstantCode.CONTRACT.SIGNATURE_STATE.SIGNED : ConstantCode.CONTRACT.SIGNATURE_STATE.NEED_ESIGN,
            },
        });
    }

    /**
     * 第三方合约签署
     * @param  {[type]} contractId   合约Id
     * @param  {[type]} userPhone    公司联系方式
     * @param  {[type]} accountId    当前的ESignId
     * @param  {[type]} signPosition 签署位置
     * @return {[type]}              [description]
     */
    static signCompany(contractId, userPhone, accountId, signPosition) {
        return ContractSignature.update({ contractId, userPhone }, {
            $set: {
                accountId,
                signPosition,
                confirmState: ConstantCode.CONTRACT.CONFIRMED_STATE.CONFIRMED,
                signState: ConstantCode.CONTRACT.SIGNATURE_STATE.NEED_ESIGN,
            },
        });
    }

    /**
     * 合约查询, 只查询和我有关的合约
     * @param userPhone
     * @param query
     * @param contractState
     * @returns {null|AggregationCursor|*}
     */
    static contractList(userPhone, query, contractState) {
        const queryObj = {
            $or: [
                { userPhone },
                { "sender.senderPhone": userPhone },
            ],
            isActive: true,
        };
        if (contractState) {
            queryObj.contractState = contractState;
        }
        Logger.info("查询条件");
        Logger.info(JSON.stringify(queryObj));
        return ContractSignature.aggregate([{
            $match: queryObj,
        }, {
            $project: {
                userName: {
                    $cond: [{
                        $eq: ["$sender.senderPhone", userPhone],
                    }, "$userName", "$sender.userName"],
                },
                userPhone: {
                    $cond: [{
                        $eq: ["$sender.senderPhone", userPhone],
                    }, "$userPhone", "$sender.senderPhone"],
                },
                userAvatar: {
                    $cond: [{
                        $eq: ["$sender.senderPhone", userPhone],
                    }, "$userAvatar", "$sender.senderAvatar"],
                },
                name: {
                    $cond: [{
                        $eq: ["$sender.senderPhone", userPhone],
                    }, "$receiverName", "$sender.senderName"],
                },

                contractId: 1,
                contractName: 1,
                contractState: 1,

                signState: 1,
                isActive: 1,

                updatedAt: 1,
            }
        }, {
            $match: query,
        }, {
            $sort: { updatedAt: -1 },
        }, {
            $limit: 10,
        }]);
    }

    /**
     * 未完成合约查询
     * @param query
     * @param waitMe    是否待我签署
     */
    static contractList1(query, waitMe) {
        query.contractState = ConstantCode.CONTRACT.CONTRACT_STATUS.WAIT;
        query.signState = waitMe ? ConstantCode.CONTRACT.SIGNATURE_STATE.NEED_SIGNED : ConstantCode.CONTRACT.SIGNATURE_STATE.SIGNED;

        Logger.info("查询条件");
        Logger.info(JSON.stringify(query));
        return ContractSignature.aggregate([{ $match: query },
            { $sort: { updatedAt: -1 } },
            { $limit: 10 },
            {
                $project: {
                    _id: 1,
                    userName: "$sender.userName",
                    userPhone: "$sender.senderPhone",
                    userAvatar: "$sender.senderAvatar",
                    name: "$sender.senderName",

                    contractId: 1,
                    contractName: 1,
                    contractState: 1,

                    updatedAt: 1,
                },
            }
        ]);
    }

    static contractList2(query) {
        Logger.info("查询条件");
        Logger.info(JSON.stringify(query));
        return ContractSignature.aggregate([{ $match: query },
            { $sort: { updatedAt: -1 } },
            { $limit: 10 },
            {
                $project: {
                    _id: 1,
                    userName: "$sender.userName",
                    userPhone: "$sender.senderPhone",
                    userAvatar: "$sender.senderAvatar",
                    name: "$sender.senderName",

                    contractId: 1,
                    contractName: 1,
                    contractState: 1,

                    updatedAt: 1,
                },
            }
        ]);
    }

    /**
     * Group the contract base on senderName with userPhone
     * @param  {[type]} userPhone [user phone]
     * @return {[type]}           [description]
     * unFinish finshi record
     */
    static contractGroupList(userPhone) {
        return ContractSignature.aggregate([{
            $match: {
                $or: [
                    { userPhone },
                    { "sender.senderPhone": userPhone },
                ],
                isActive: true,
            },
        }, {
            $sort: { updatedAt: -1 },
        }, {
            $project: {
                userName: {
                    $cond: [{
                        $eq: ["$sender.senderPhone", userPhone],
                    }, "$userName", "$sender.userName"],
                },
                userPhone: {
                    $cond: [{
                        $eq: ["$sender.senderPhone", userPhone],
                    }, "$userPhone", "$sender.senderPhone"],
                },
                userAvatar: {
                    $cond: [{
                        $eq: ["$sender.senderPhone", userPhone],
                    }, "$userAvatar", "$sender.senderAvatar"],
                },
                name: {
                    $cond: [{
                        $eq: ["$sender.senderPhone", userPhone],
                    }, "$receiverName", "$sender.senderName"],

                },

                contractId: 1,
                contractName: 1,
                contractState: 1,

                updatedAt: 1,
            },
        }, {
            $group: {
                _id: "$name",
                res: {
                    $push: {
                        userName: "$userName",
                        userPhone: "$userPhone",
                        userAvatar: "$userAvatar",

                        contractId: "$contractId",
                        contractName: "$contractName",
                        contractState: "$contractState",

                        updatedAt: "$updatedAt",
                    },
                },
                date: { $first: "$updatedAt" },
            },
        }, {
            $project: {
                res: {
                    $slice: ["$res", 0, 3],
                },
                date: "$date",
            },
        }, {
            $project: {
                res: {
                    $filter: {
                        input: "$res",
                        as: "item",
                        cond: { $ne: ["$$item.userPhone", userPhone] },
                    },
                },
                date: "$date",
            },
        }, {
            $sort: { date: -1 },
        }]);
    }

    /** 根据用户手机号码获取合约 **/
    static userCount(userPhone, date = new Date(0)) {
        return ContractSignature.aggregate({
            $project: {
                _id: 0,
                waitMe: {
                    $cond: [{
                        $and: [
                            { $eq: ["$userPhone", userPhone] },
                            { $eq: ["$signState", ConstantCode.CONTRACT.SIGNATURE_STATE.NEED_SIGNED] },
                        ],
                    }, 1, 0],
                },
                waitOther: {
                    $cond: [{
                        $and: [
                            { $eq: ["$userPhone", userPhone] },
                            { $eq: ["$signState", ConstantCode.CONTRACT.SIGNATURE_STATE.SIGNED] },
                            { $eq: ["$contractState", ConstantCode.CONTRACT.CONTRACT_STATUS.WAIT] },
                        ],
                    }, 1, 0],
                },
                unread: {
                    $cond: [{
                        $and: [
                            { $gte: ["$updatedAt", date] },
                            { $eq: ["$userPhone", userPhone] },
                            { $eq: ["$contractState", ConstantCode.CONTRACT.CONTRACT_STATUS.FINISH] },
                        ],
                    }, 1, 0],
                },
                finish: {
                    $cond: [{
                        $and: [
                            { $eq: ["$userPhone", userPhone] },
                            { $eq: ["$contractState", ConstantCode.CONTRACT.CONTRACT_STATUS.FINISH] },
                        ],
                    }, 1, 0],
                },
            },
        }, {
            $group: {
                _id: "userCount",
                unreadCount: { $sum: "$unread" },
                finishCount: { $sum: "$finish" },
                waitMeCount: { $sum: "$waitMe" },
                waitOtherCount: { $sum: "$waitOther" },
            },
        });
    }

    static updateSpecifiedFieldById(id, obj) {
        return ContractSignature.update({ _id: id }, { $set: obj });
    }

    /** 获取最新的签约情况 **/
    static findLastVersion(contractId) {
        return ContractSignature.findOne({ contractId }, { sort: { updatedAt: -1 } });
    }
}

export { ContractDao, ContractTemplateDao, ContractSignatureDao };
