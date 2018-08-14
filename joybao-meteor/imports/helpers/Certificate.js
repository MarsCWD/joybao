import PersonDao from "../api/person/dao";
import CompanyDao from "../api/company/dao";
import AgentRecordDao from "../api/agent/dao";
import AuditRecordDao from "../api/audit/dao";

import Logger from "./Logger";
import ConstantCode from "./ConstantCode";
import { ErrorCode } from "../../imports/helpers/ErrorJson";

/**
 * 添加个人认证
 * @param {[type]} realName [显示姓名]
 * @param {[type]} userId   [用户Id]
 * @return 返回状态码
 */
const addPersonIdentity = (realName, userId) => {
    const where = "addPersonIdentity";

    /** 添加一条认证记录 */
    const audit = {
        refId: userId,
        title: realName,
        status: ConstantCode.AUDIT_STATUS.PASS,
        type: ConstantCode.AUDIT.TYPE.PERON_IDENTITY,
        subject: ConstantCode.AUDIT.SUBJECT.PERON_IDENTITY,
    };
    const auditId = AuditRecordDao.insert(audit);
    if (!auditId) {
        Logger.error("插入认证记录表失败", where);
        return ErrorCode.SERVER;
    }

    /** 更新个人认证资料 */
    const res = PersonDao.upsertIdentity(userId, realName, auditId, ConstantCode.IDENTITY_STATUS.IN_PROCESSING);
    if (!res) {
        Logger.error("更新个人认证资料", where);
        return ErrorCode.SERVER;
    }
    Logger.info(`新增个人认证: ${realName} userId:${userId}`, where);
    return ErrorCode.SUCCESS;
};

/**
 * 新增企业认证
 * @param {[type]} company [企业相关资料]
 * @return 返回状态码
 */
const addCompanyIdentity = (companyObj, source = ConstantCode.COMPANY.SOURCE.PLATFORM) => {
    const where = "addCompanyIdentity";
    const company = companyObj;
    company.source = source;

    /** 若第三方企业,则需填写对应的公司联系方式 **/
    if (source === ConstantCode.COMPANY.SOURCE.YOU_YUN && !company.phone) {
        return [ErrorCode.THIRD.NO_COMPANY_PHONE];
    }

    if (company.regType === ConstantCode.COMPANY.REG_TYPE.NORMAL) {
        /** 组织机构代码 注册 **/
        if (!company.codeORG) {
            return [ErrorCode.COMPANY.IDENTITY_ERROR];
        }
    } else if (company.regType === ConstantCode.COMPANY.REG_TYPE.MERGE) {
        /** 三证合一 注册 **/
        if (!company.codeUSC) {
            return [ErrorCode.COMPANY.IDENTITY_ERROR];
        }
    } else if (company.regType === ConstantCode.COMPANY.REG_TYPE.REGCODE) {
        /** 企业工商注册码 注册 **/
        if (!company.codeNO) {
            return [ErrorCode.COMPANY.IDENTITY_ERROR];
        }
    } else {
        Logger.info(`RegType: ${company.regType}`);
        Logger.info("Error RegType");
        return [ErrorCode.SERVER];
    }

    /** 若企业已存在 */
    if (CompanyDao.isExisted(company.codeUSC)) {
        return [ErrorCode.COMPANY.EXISTED];
    }

    /** 插入企业 */
    const companyId = CompanyDao.insert(company);
    if (!companyId) {
        Logger.error("插入企业失败", where);
        return [ErrorCode.SERVER];
    }

    let status = ConstantCode.AUDIT_STATUS.IN_PROCESSING;
    if (company.userType === "2" || source !== ConstantCode.COMPANY.SOURCE.PLATFORM) {
        status = ConstantCode.AUDIT_STATUS.PASS;
    }

    /** 公司加入审核表 */
    const audit = {
        title: company.name,
        subject: ConstantCode.AUDIT.SUBJECT.COMPANY_IDENTITY,
        refId: companyId,
        type: ConstantCode.AUDIT.TYPE.COMPANY_IDENTITY,
        status,
    };
    const auditId = AuditRecordDao.insert(audit);
    if (!auditId) {
        Logger.error("公司加入审核表失败", where);
        return [ErrorCode.SERVER];
    }

    const res = CompanyDao.updateSpecifiedFieldById(companyId, { identityId: auditId });
    if (!res) {
        Logger.error("公司更新认证记录失败", where);
        return [ErrorCode.SERVER];
    }

    Logger.info(`新增企业认证: ${company.name} userId:${company.mainAccountId}`, where);
    return [ErrorCode.SUCCESS, companyId, company.name];
};

/**
 * 添加代理人申请
 * @param {[type]}  companyId     [公司Id]
 * @param {[type]}  companyName   [公司名]
 * @param {[type]}  userId        [用户Id]
 * @param {[type]}  userName      [用户名]
 * @param {Boolean} isMaster      [是否是主题账户]
 * @param {[type]}  certificateId [代理人证书]
 */
const addAgentIdentity = (companyId, companyName, userId, userName, isMaster, certificateId) => {
    const where = "addAgentIdentity";

    if (AgentRecordDao.isMatch(userId, companyId)) {
        Logger.error(`${userName}已经是${companyName}代理人`, where);
        return ErrorCode.AGENT.HAS_BEEN_AGENTS;
    }

    /** 添加一条代理人记录 */
    const agent = {
        userId,
        userName,
        companyId,
        companyName,
        isMaster,
        certificateId,
        status: isMaster ? ConstantCode.AGENT_STATUS.SUCCESS : ConstantCode.AGENT_STATUS.IN_PROCESSING,
    };
    const agentId = AgentRecordDao.insert(agent);
    if (!agentId) {
        Logger.error("添加一条代理人记录失败", where);
        return ErrorCode.SERVER;
    }

    /** 代理人申请加入审核表 */
    if (!isMaster) {
        const audit = {
            title: `${companyName} ${userName}`,
            subject: ConstantCode.AUDIT.SUBJECT.AGENT_IDENTITY,
            refId: agentId,
            type: ConstantCode.AUDIT.TYPE.AGENT_IDENTITY,
            status: ConstantCode.AUDIT_STATUS.IN_PROCESSING
        };

        const auditId = AuditRecordDao.insert(audit);
        if (!audit) {
            Logger.error("代理人申请加入审核表失败", where);
            return ErrorCode.SERVER;
        }

        const res = AgentRecordDao.updateSpecifiedFieldById(agentId, { identityId: auditId });
        if (!res) {
            Logger.error("公司更新认证记录失败", where);
            return ErrorCode.SERVER;
        }
    }

    Logger.info(`新增代理人认证: ${companyName} userId:${userId} userName:${userName}`, "addAgentIdentity");
    return ErrorCode.SUCCESS;
};

export {
    addPersonIdentity,
    addCompanyIdentity,
    addAgentIdentity,
};
