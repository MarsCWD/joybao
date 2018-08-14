import SealDao from "../api/seal/dao";
import PersonDao from "../api/person/dao";
import CompanyDao from "../api/company/dao";
import AgentRecordDao from "../api/agent/dao";

import MongoDBHelper from "./MongoDBHelper";

import { ErrorCode } from "./ErrorJson";
import Role from "./Role";
import ConstantCode from "./ConstantCode";

const getCurrentRoleInfo = (userId, companyId) => {
    let company = null;
    let sealIds = null;
    let signatureNumber = 0;

    const sessionObj = {};

    /** 获取用户资料 **/
    const user = PersonDao.findOneByUserId(userId);
    if (!user) {
        return [ErrorCode.SERVER];
    }

    sessionObj.phone = user.phone;
    sessionObj.unionId = user.unionId;
    sessionObj.avatar = user.avatarUrl;
    sessionObj.state = user.identityState;
    sessionObj.realName = user.realName ? user.realName : user.nickName;

    const companyList = AgentRecordDao.listCompany(userId, {
        fields: MongoDBHelper.fields(["companyId", "companyName", "isMaster", "status"])
    });
    if (companyList.length !== 0) {
        /** 查询代理的公司 */
        sessionObj.companyList = companyList
            .filter(item => item.status === ConstantCode.AGENT_STATUS.SUCCESS)
            .map(item => ({
                companyId: item.companyId,
                companyName: item.companyName,
            }));

        if (companyId) {
            const obj = companyList.find(item => item.companyId === companyId);
            sessionObj.defaultCompanyId = companyId;
            sessionObj.isMaster = obj.isMaster;
        } else {
            sessionObj.defaultCompanyId = sessionObj.companyList[0].companyId;
            sessionObj.isMaster = sessionObj.companyList[0].isMaster;
        }

        /** 若公司用户 */
        company = CompanyDao.findOneByCompanyId(sessionObj.currentCompanyId, {
            fields: MongoDBHelper.fields(["name", "accountId", "identityState", "signatureNumber", "lockSignatureNumber"])
        });

        if (!company) {
            return [ErrorCode.SERVER];
        }
        sessionObj.name = company.name;
        sessionObj.userRole = Role.COMPANY;
        sessionObj.accountId = company.accountId;
        sessionObj.identityState = company.identityState;

        /** 查询签章列表 */
        sealIds = SealDao.list(userId, sessionObj.currentCompanyId, { fields: MongoDBHelper.fields(["_id", "status", "default"]) });
        signatureNumber = company.signatureNumber - company.lockSignatureNumber;
    } else {
        /** 若个人用户 */
        sessionObj.companyList = [];
        sessionObj.userRole = Role.PERSON;
        sessionObj.name = sessionObj.realName;
        sessionObj.accountId = user.accountId;
        sessionObj.identityState = user.identityState;
        sealIds = SealDao.list(userId, null, { fields: MongoDBHelper.fields(["_id", "status", "default"]) });
        signatureNumber = user.signatureNumber - user.lockSignatureNumber;
    }

    /** 修改默认签章 */
    let defaultSealId = "";
    let firstFinishSealId = ""; // 解决历史遗留问题
    for (let i = 0, len = sealIds.length; i < len; i += 1) {
        if (sealIds[i].default) {
            defaultSealId = sealIds[i]._id;
            break;
        }
        // 解决历史遗留问题
        if (!firstFinishSealId && sealIds[i].status === ConstantCode.AUDIT_STATUS.FINISH) {
            firstFinishSealId = sealIds[i]._id;
        }
    }
    sessionObj.sealIds = sealIds;
    sessionObj.defaultSealId = defaultSealId || firstFinishSealId;
    return [ErrorCode.SUCCESS, sessionObj, signatureNumber];
};

const UserHelper = { getCurrentRoleInfo };
export default UserHelper;
