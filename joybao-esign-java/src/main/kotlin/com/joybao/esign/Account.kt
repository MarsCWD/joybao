package com.joybao.esign

import DDP.DDPListener
import com.joybao.constants.ProjectConstants
import com.joybao.util.TaskCallBack
import com.joybao.util.TaskObj
import com.timevale.esign.sdk.tech.bean.OrganizeBean
import com.timevale.esign.sdk.tech.bean.PersonBean
import com.timevale.esign.sdk.tech.bean.result.AddAccountResult
import com.timevale.esign.sdk.tech.bean.result.Result
import com.timevale.esign.sdk.tech.impl.constants.OrganRegType
import com.timevale.esign.sdk.tech.service.factory.AccountServiceFactory
import org.slf4j.LoggerFactory
import sun.rmi.runtime.Log


/**
 * ESign 添加账户
 */
object Account {

    private val Logger = LoggerFactory.getLogger(Account::class.java)
    private val SERVICE = AccountServiceFactory.instance()

    /**
     * 添加注册个人账户
     */
    fun addPerson(data: Map<String, Any>, cb: TaskCallBack) {
        Logger.info("添加个人账户")
        val identity: Map<*, *>
        val phone: String
        var identityId: String = ""
        var realName: String = ""
        val idCard: String

        val person = PersonBean()
        try {
            identity = data["identity"] as Map<*, *>

            phone = data["phone"] as String

            identityId = identity["identityId"] as String
            realName = identity["realName"] as String
            idCard = identity["IDCard"] as String

            person.mobile = phone
            person.email = ""
            person.name = realName
            person.idNo = idCard
            person.personArea = 0 // 默认为大陆
        } catch (e: Exception) {
            Logger.error(e.message)
            Logger.error(realName)

            val res = Result()
            res.errCode = 56
            res.msg = "客户端运行时错误"
            return cb.result(res, identityId)
        }

        Logger.info("添加个人账户$realName")
        cb.result(SERVICE.addAccount(person), identityId)
    }

    fun addOrganize(data: Map<String, Any>, cb: TaskCallBack) {
        Logger.info("添加企业账户")
        var name: String = ""
        var legalName: String = ""
        var legalIdNo: String = ""
        var agentName: String = ""
        var agentIdNo: String = ""
        var codeUSC: String = ""
        var codeORG: String = ""
        var codeNO: String = ""
        var userType: Int = 0

        var identityId: String = ""

        val org = OrganizeBean()
        try {
            identityId = data.get("identityId") as String

            name = data["name"] as String
            codeUSC = if (data.containsKey("codeUSC")) data["codeUSC"] as String else ""
            codeORG = if (data.containsKey("codeORG")) data["codeORG"] as String else ""
            codeNO = if (data.containsKey("codeNO")) data["codeNO"] as String else ""
            userType = (data["userType"] as String).toInt()
            val regTypeStr = data["regType"] as String

            org.name = name
            org.organType = 0

            // 注册方式
            when (regTypeStr) {
                "Normal" -> {
                    Logger.info("组织机构代码注册")
                    org.organCode = codeORG
                    org.regType = OrganRegType.NORMAL
                }
                "Merge" -> {
                    Logger.info("社会统一信用代码注册")
                    org.organCode = codeUSC
                    org.regType = OrganRegType.MERGE
                }
                "Regcode" -> {
                    Logger.info("注册号注册")
                    org.organCode = codeNO
                    org.regType = OrganRegType.REGCODE
                }
            }

            // 注册人
            if (userType == 1) {
                Logger.info("代理人注册")
                agentName = data["agentName"] as String
                agentIdNo = data["agentID"] as String
            } else if (userType == 2) {
                Logger.info("法人注册")
                legalName = data["legalName"] as String
                legalIdNo = data["legalID"] as String
            }
            org.userType = userType
            org.legalName = legalName
            org.legalIdNo = legalIdNo
            org.agentName = agentName
            org.agentIdNo = agentIdNo
            org.legalArea = 0
        } catch (e: Exception) {
            Logger.error(e.message)
            Logger.error(name)

            val res = Result()
            res.errCode = 56
            res.msg = "客户端运行时错误"
            return cb.result(res, identityId)
        }

        Logger.info("添加企业账户$name")
        cb.result(SERVICE.addAccount(org), identityId)
    }

    /**
     * 添加个人账户OK
     */
    fun addPersonOK(userId: String, recordId: String, res: AddAccountResult) {
        val params = HashMap<String, String>()
        params.put("userId", userId)
        params.put("recordId", recordId)
        params.put("accountId", res.accountId)

        val methodArgs = arrayOfNulls<Any>(1)
        methodArgs[0] = params

        Logger.info("添加个人账户成功 ${res.accountId}")

        ProjectConstants.ddp?.call("esign.person.ok", methodArgs, object : DDPListener() {
            override fun onResult(resultFields: MutableMap<String, Any>?) {
                super.onResult(resultFields)
                Logger.info(resultFields.toString())
            }
        })
    }

    /**
     * 添加个人账户失败OK
     * TODO 传输内容
     */
    fun addPersonNo(userId: String, recordId: String, res: Result) {
        val params = HashMap<String, String>()
        params.put("userId", userId)
        params.put("recordId", recordId)
        params.put("errCode", res.errCode.toString())
        params.put("errMsg", res.msg.toString())

        val methodArgs = arrayOfNulls<Any>(1)
        methodArgs[0] = params

        Logger.info("添加个人账户失败")

        ProjectConstants.ddp?.call("esign.person.no", methodArgs, object : DDPListener() {
            override fun onResult(resultFields: MutableMap<String, Any>?) {
                super.onResult(resultFields)
                Logger.info(resultFields.toString())
            }
        })
    }

    fun addCompanyOK(companyId: String, recordId: String, res: AddAccountResult) {
        val params = HashMap<String, String>()
        params.put("companyId", companyId)
        params.put("recordId", recordId)
        params.put("accountId", res.accountId)

        val methodArgs = arrayOfNulls<Any>(1)
        methodArgs[0] = params

        Logger.info("添加企业账户成功 ${res.accountId}")

        ProjectConstants.ddp?.call("esign.company.ok", methodArgs, object : DDPListener() {
            override fun onResult(resultFields: MutableMap<String, Any>?) {
                super.onResult(resultFields)
                Logger.info(resultFields.toString())
            }
        })
    }

    fun addCompanyNo(companyId: String, recordId: String, res: AddAccountResult) {
        val params = HashMap<String, String>()
        params.put("companyId", companyId)
        params.put("recordId", recordId)
        params.put("errCode", res.errCode.toString())
        params.put("errMsg", res.msg.toString())

        val methodArgs = arrayOfNulls<Any>(1)
        methodArgs[0] = params

        Logger.info("添加企业账户失败")

        ProjectConstants.ddp?.call("esign.company.no", methodArgs, object : DDPListener() {
            override fun onResult(resultFields: MutableMap<String, Any>?) {
                super.onResult(resultFields)
                Logger.info(resultFields.toString())
            }
        })
    }

    /**
     * 注销账户
     */
    fun deleteAccount(accountId: String) {
        SERVICE.deleteAccount(accountId)
    }
}