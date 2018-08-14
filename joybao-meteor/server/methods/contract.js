import { RestMethodMixin } from "meteor/simple:rest-method-mixin";
import { SimpleSchema } from "meteor/aldeed:simple-schema";

import ValidatedMethod from "../../imports/helpers/CustomValidatedMethod";
import validator from "../../imports/helpers/simple-schema-validator";

import PersonDao from "../../imports/api/person/dao";
import CompanyDao from "../../imports/api/company/dao";

import { ContractSchema } from "../../imports/api/contract/Contract";
import { ContractSignaturePositionSchema } from "../../imports/api/contract/ContractSignature";
import { ContractDao, ContractSignatureDao } from "../../imports/api/contract/dao";

import SessionHelper from "../collections/session";
import Role from "../../imports/helpers/Role";
import Logger from "../../imports/helpers/Logger";
import ConstantCode from "../../imports/helpers/ConstantCode";
import MongoDBHelper from "../../imports/helpers/MongoDBHelper";
import ContractHelper from "../../imports/helpers/ContractHelper";
import { ErrorCode, ErrorJSON } from "../../imports/helpers/ErrorJson";

/**
 * 生成新的合约
 * TODO 限制分辨率过小的图片
 */
new ValidatedMethod({
    name: "contract.new",
    mixins: [RestMethodMixin],
    validate: validator(new SimpleSchema({
        session: {
            type: Object,
            blackbox: true,
        },
        contract: {
            label: "合约内容",
            type: ContractSchema,
        },
        signpassword: {
            label: "签署密码",
            type: String,
        },
    })),
    run({ session, contract, signpassword }) {
        /** 发起人检查 是否实名认证 **/
        if (session.identityState !== ConstantCode.IDENTITY_STATUS.SUCCESS) {
            return ErrorJSON(ErrorCode.PERSON.UNEXISTED);
        }

        /** 签署密码 **/
        if (signpassword !== session.signpassword) {
            return ErrorJSON(ErrorCode.PERSON.SIGN_PASSWORD);
        }

        let person;
        let company;

        /** 拼接组装发起人对象 */
        const senderObj = {};
        senderObj.userId = session.userId;
        senderObj.userName = session.realName;
        senderObj.property = 0;
        senderObj.userPhone = session.phone;
        senderObj.avatar = session.avatar;
        senderObj.type = Role.PERSON;

        /** 判断是否是公司身份 **/
        if (session.currentCompanyId) {
            company = CompanyDao.findOne({ _id: session.currentCompanyId });
            if (!company) {
                return ErrorJSON(ErrorCode.SERVER);
            }

            senderObj.companyId = company._id;
            senderObj.companyName = company.name;
            senderObj.isMaster = session.isMaster;
            senderObj.type = Role.COMPANY;
        }

        // 添加合约发件人
        const contractObj = contract;
        contractObj.sender = senderObj;

        /** 签约人人数判断 **/
        const receiverSet = new Set(contractObj.receivers.map(item => item.userPhone));
        if (receiverSet.size !== contractObj.receivers.length) {
            Logger.info(`收件人 receiverSet:${receiverSet.size} receivers:${contractObj.receivers.length}`);
            return ErrorJSON(ErrorCode.CONTRATCT.REPEAT_RECEIVER);
        }
        const receiverLen = contractObj.receivers.length;
        if (receiverLen < 2) {
            return ErrorJSON(ErrorCode.CONTRATCT.NO_RECEIVER);
        }

        /** 判断附件数目 **/
        const annexLen = contractObj.annex.length;
        if (annexLen === 0) {
            return ErrorJSON(ErrorCode.CONTRATCT.NO_ANNEX);
        }

        /** 若发起人承担 判断签署次数 */
        const signPayment = contract.signPayment;
        if (signPayment === ConstantCode.CONTRACT.SIGN_PAYMENT.SENDER) {
            if (senderObj.type === Role.COMPANY) {
                /** 判断签署次数是否充足 */
                const remain = company.signatureNumber - company.lockSignatureNumber;
                if (remain < receiverLen) {
                    return ErrorJSON(ErrorCode.CONTRATCT.NO_SIGN_NUMBER);
                }
            } else {
                person = PersonDao.findOneByUserId(session.userId, {
                    fields: MongoDBHelper.fields(["signatureNumber", "lockSignatureNumber"]),
                });
                /** 判断签署次数是否充足 */
                const remain = person.signatureNumber - person.lockSignatureNumber;
                if (remain < receiverLen) {
                    return ErrorJSON(ErrorCode.CONTRATCT.NO_SIGN_NUMBER);
                }
            }
        }

        /** 合同入库 **/
        const contractId = ContractDao.insert(contractObj);
        if (!contractId) {
            return ErrorJSON(ErrorCode.SERVER);
        }

        /** 合约pdf生成并发送短信 **/
        const res = ContractHelper.newContract(contractId, contractObj, session.userId, session.name);
        if (res) {
            return ErrorJSON(ErrorCode.SERVER);
        }

        /** 若发起人承担 冻结签署次数 */
        if (signPayment === ConstantCode.CONTRACT.SIGN_PAYMENT.SENDER) {
            if (senderObj.type === Role.COMPANY) {
                /** 冻结签署次数 */
                if (!CompanyDao.updateSignatureNumber(session.currentCompanyId, { $inc: { lockSignatureNumber: receiverLen } })) {
                    return ErrorJSON(ErrorCode.SERVER);
                }
            } else if (!PersonDao.updateSignatureNumber(session.userId, { $inc: { lockSignatureNumber: receiverLen } })) {
                /** 冻结签署次数 */
                return ErrorJSON(ErrorCode.SERVER);
            }
        }

        return { success: true, data: { contractId } };
    },
    restOptions: {
        url: "/contract.new",
        getArgsFromRequest(req) {
            const obj = {};
            obj.session = req.session;
            obj.signpassword = req.body.signpassword;
            try {
                obj.contract = JSON.parse(req.body.contract);
            } catch (e) {
                const err = new Meteor.Error("Invalid json string", "Invalid json string");
                err.statusCode = 400;
                throw err;
            }
            return [obj];
        },
    },
});

/**
 * 合约签署
 */
new ValidatedMethod({
    name: "contract.sign",
    mixins: [RestMethodMixin],
    validate: validator(new SimpleSchema({
        session: {
            type: Object,
            blackbox: true,
        },
        contractId: {
            label: "合约ID",
            type: String,
        },
        code: {
            label: "签署随机码",
            type: String,
            optional: true,
        },
        signPosition: {
            label: "签署位置",
            type: ContractSignaturePositionSchema,
            optional: true,
        },
    })),
    run({ session, contractId, code, signPosition }) {
        let person;
        let company;
        let accountId;
        let hasSign = false;
        let updateObj = null;

        /** 判断当前用户是否完成实名认证 **/
        if (session.identityState !== ConstantCode.IDENTITY_STATUS.SUCCESS) {
            return ErrorJSON(ErrorCode.PERSON.UNEXISTED);
        }

        /** 确认 签署人 属于该合约 **/
        const contractSignatureRecord = ContractSignatureDao.findOne(session.phone, contractId);
        if (!contractSignatureRecord) {
            return ErrorJSON(ErrorCode.CONTRATCT.NOT_SIGNATURE_RECORD);
        }

        /** 从冗余字段判断 获取到合约, 并对合约状态进行判断 **/
        if (contractSignatureRecord.contractState !== ConstantCode.CONTRACT.CONTRACT_STATUS.WAIT) {
            return ErrorJSON(ErrorCode.CONTRATCT.HAS_FINISHED);
        }

        /** 若为公司 */
        if (session.currentCompanyId) {
            company = CompanyDao.findOneByCompanyId(session.currentCompanyId);
            if (!company) {
                return ErrorJSON(ErrorCode.SERVER);
            }
        }

        if (signPosition) {
            // 签署
            /** 当前用户处于需要签署状态且为签署 **/
            if (contractSignatureRecord.signState !== ConstantCode.CONTRACT.SIGNATURE_STATE.NEED_SIGNED) {
                return ErrorJSON(ErrorCode.CONTRATCT.HAS_SIGN);
            }

            /** 签署验证码认证 **/
            if (contractSignatureRecord.signCode !== code) {
                return ErrorJSON(ErrorCode.CONTRATCT.SIGN_CODE);
            }

            /** 判断签章是否是默认签章 **/
            const signPositionObj = signPosition;
            signPositionObj.sealId = session.defaultSealId;

            /** 判断是由发起人承担还是接收人承担 */
            const isSenderPaySignNumber = contractSignatureRecord.signPayment === ConstantCode.CONTRACT.SIGN_PAYMENT.SENDER;
            Logger.info(`isSenderPaySignNumber: ${isSenderPaySignNumber} hasSign:${hasSign}`);

            if (company) {
                /** 若为公司 */
                /** TODO 判断在此合约中, 该公司是否已经签署过 **/
                hasSign = ContractSignatureDao.hasSign(contractId, session.currentCompanyId);

                if (!isSenderPaySignNumber) {
                    /** 公司签署次数是否充足 */
                    if (company.signatureNumber - company.lockSignatureNumber < 1) {
                        return ErrorJSON(ErrorCode.CONTRATCT.NO_SIGN_NUMBER);
                    }

                    /** 公司签署次数加锁 */
                    if (!CompanyDao.updateSignatureNumber(session.currentCompanyId, { $inc: { lockSignatureNumber: 1 } })) {
                        return ErrorJSON(ErrorCode.SERVER);
                    }
                }
            } else if (!isSenderPaySignNumber) {
                person = PersonDao.findOneByUserId(session.userId, {
                    fields: MongoDBHelper.fields(["signatureNumber", "lockSignatureNumber", "accountId"]),
                });
                /** 个人签署次数是否充足 */
                if (person.signatureNumber - person.lockSignatureNumber < 1) {
                    return ErrorJSON(ErrorCode.CONTRATCT.NO_SIGN_NUMBER);
                }

                /** 个人签署次数加锁 */
                if (!PersonDao.updateSignatureNumber(session.userId, { $inc: { lockSignatureNumber: 1 } })) {
                    return ErrorJSON(ErrorCode.SERVER);
                }
            } else {
                person = PersonDao.findOneByUserId(session.userId, {
                    fields: MongoDBHelper.fields(["accountId"]),
                });
            }

            /** 获取accountId **/
            accountId = company ? company.accountId : person.accountId;

            /** 签章宽度最小为160 保证清晰度 **/
            if (signPositionObj.width < 160) {
                signPositionObj.width = 160;
            }

            /** 合约签署 */
            const res = ContractSignatureDao.sign(
                contractSignatureRecord._id,
                session.userId,
                session.realName,
                session.avatar,
                session.currentCompanyId,
                session.name,
                accountId,
                signPositionObj,
                hasSign,
            );
            if (!res) {
                return ErrorJSON(ErrorCode.SERVER);
            }

            /** 获取已签约的数量 **/
            const signCount = ContractSignatureDao.signCount(contractId);
            updateObj = {
                $set: {
                    signCount,
                    "receivers.$.userId": session.userId,
                    "receivers.$.userName": session.realName,
                    "receivers.$.avatar": session.avatar,
                    "receivers.$.type": company ? Role.COMPANY : Role.PERSON, // TODO type字段需不需要存储在或者更改
                    "receivers.$.companyId": company ? company._id : undefined,
                    "receivers.$.companyName": company ? company.name : undefined,
                    "receivers.$.signState": ConstantCode.CONTRACT.SIGNATURE_STATE.SIGNED,
                    "receivers.$.confirmState": ConstantCode.CONTRACT.CONFIRMED_STATE.CONFIRMED,
                    "receivers.$.updatedAt": new Date(),
                },
            };
        } else {
            // 确认
            /** 当前用户处于需要确认状态且为确认 **/
            if (contractSignatureRecord.confirmState !== ConstantCode.CONTRACT.CONFIRMED_STATE.NEED_CONFIRMED) {
                return ErrorJSON(ErrorCode.CONTRATCT.HAS_CONFIRMED);
            }

            /** 合约确认 */
            const res = ContractSignatureDao.confirm(
                contractSignatureRecord._id,
                session.userId,
                session.realName,
                session.avatar,
                session.currentCompanyId,
                session.name,
            );
            if (!res) {
                return ErrorJSON(ErrorCode.SERVER);
            }

            /** 获取已确认数量 */
            const confirmCount = ContractSignatureDao.confirmCount(contractId);
            updateObj = {
                $set: {
                    confirmCount,
                    "receivers.$.userId": session.userId,
                    "receivers.$.userName": session.realName,
                    "receivers.$.avatar": session.avatar,
                    "receivers.$.type": company ? Role.COMPANY : Role.PERSON, // TODO type字段需不需要存储在或者更改
                    "receivers.$.companyId": company ? company._id : undefined,
                    "receivers.$.companyName": company ? company.name : undefined,
                    "receivers.$.confirmState": ConstantCode.CONTRACT.CONFIRMED_STATE.CONFIRMED,
                    "receivers.$.updatedAt": new Date(),
                },
            };
        }

        /** 更新合约信息 */
        const res = ContractDao.update({
            _id: contractId,
            "receivers.userPhone": session.phone,
        }, updateObj);
        if (!res) {
            return ErrorJSON(ErrorCode.SERVER);
        }

        /** 判断合约是否生效 */
        if (signPosition && ContractHelper.isEffective(contractId)) {
            ContractHelper.effective(contractId);
        }

        return { success: true };
    },
    restOptions: {
        url: "/contract.sign",
        getArgsFromRequest(req) {
            const obj = {};
            obj.session = req.session;
            obj.contractId = req.body.contractId;
            obj.code = req.body.code;
            try {
                obj.signPosition = req.body.signPosition ? JSON.parse(req.body.signPosition) : null;
            } catch (e) {
                const err = new Meteor.Error("Invalid json string", "Invalid json string");
                err.statusCode = 400;
                throw err;
            }
            return [obj];
        },
    },
});

/**
 * Group LookUp user's contract
 */
new ValidatedMethod({
    name: "contract.list",
    mixins: [RestMethodMixin],
    validate: null,
    run({ session }) {
        if (!session.phone) {
            return ErrorJSON(ErrorCode.PERSON.NO_PHONE);
        }

        const data = ContractSignatureDao.contractGroupList(session.phone);
        return { success: true, data };
    },
    restOptions: {
        url: "/contract.list",
        getArgsFromRequest(req) {
            const obj = req.body;
            obj.session = req.session;
            return [obj];
        },
    },
});

/**
 * LookUp All user's contract
 */
new ValidatedMethod({
    name: "contract.list.all",
    mixins: [RestMethodMixin],
    validate: null,
    run({ session, contractName, latest, contractState, waitMe }) {
        if (!session.phone) {
            return ErrorJSON(ErrorCode.PERSON.NO_PHONE);
        }

        const userPhone = session.phone;
        const beginDate = latest ? new Date(parseInt(latest, 10)) : new Date();
        const query = { updatedAt: { $lt: beginDate } };

        // 上次查询时间
        if (contractState && contractState === ConstantCode.CONTRACT.CONTRACT_STATUS.FINISH) {
            const res = SessionHelper.sessionUpdate(session.token, {
                lastQueryDate: new Date(),
            });
            if (!res) {
                return ErrorJSON(ErrorCode.SERVER);
            }
        }

        // 是否传来了合约名
        if (contractName) {
            query.contractName = new RegExp(contractName);
        }

        let data = null;
        if (contractState === ConstantCode.CONTRACT.CONTRACT_STATUS.FINISH) {
            Logger.info("查询已完成");
            query.userPhone = { $ne: userPhone };
            data = ContractSignatureDao.contractList(userPhone, query, contractState);
            if (!data) {
                return ErrorJSON(ErrorCode.SERVER);
            }
        } else if (contractState === ConstantCode.CONTRACT.CONTRACT_STATUS.WAIT) {
            Logger.info("查询我的相关");
            query.userPhone = userPhone;
            data = ContractSignatureDao.contractList1(query, waitMe === "true");
            if (!data) {
                return ErrorJSON(ErrorCode.SERVER);
            }
        } else {
            Logger.info("查询我的全部");
            query.userPhone = userPhone;
            data = ContractSignatureDao.contractList2(query);
            if (!data) {
                return ErrorJSON(ErrorCode.SERVER);
            }
        }

        return { success: true, data };
    },
    restOptions: {
        url: "/contract.list.all",
        getArgsFromRequest(req) {
            const obj = req.body;
            obj.session = req.session;
            return [obj];
        },
    },
});

/**
 * 查看指定合同详细信息
 */
new ValidatedMethod({
    name: "contract.view",
    mixins: [RestMethodMixin],
    validate: validator(new SimpleSchema({
        session: {
            type: Object,
            blackbox: true,
        },
        contractId: {
            label: "合约Id",
            type: String,
        },
        onlyReceivers: {
            label: "只返回接受者",
            type: Number,
            optional: true,
        },
    })),
    run({ session, contractId, onlyReceivers }) {
        if (!session.phone) {
            return ErrorJSON(ErrorCode.PERSON.NO_PHONE);
        }

        const signature = ContractSignatureDao.findOne(session.phone, contractId);
        if (!signature) {
            return ErrorJSON(ErrorCode.CONTRATCT.NOT_SIGNATURE_RECORD);
        }

        const contract = ContractDao.findOneById(contractId, {
            fields: onlyReceivers ? MongoDBHelper.fields(["receivers"], true) : MongoDBHelper.fields(["sender.userId", "receivers.userId"], false),
        });
        if (!contract) {
            return ErrorJSON(ErrorCode.CONTRATCT.NO_CONTRACT);
        }
        // 不允许 {receivers:1, receivers.userId:0} 这种查询好像
        if (onlyReceivers) {
            contract.receivers = contract.receivers.map(item => {
                const obj = item;
                delete obj.userId;
                return obj;
            });
        }
        return { success: true, data: contract };
    },
    restOptions: {
        url: "/contract.view",
        httpMethod: "get",
        getArgsFromRequest(req) {
            const obj = {};
            obj.session = req.session;
            obj.contractId = req.query.contractId;
            obj.onlyReceivers = parseInt(req.query.onlyReceivers, 10);
            if (isNaN(obj.onlyReceivers)) {
                obj.onlyReceivers = 0;
            }
            return [obj];
        },
    },
});
