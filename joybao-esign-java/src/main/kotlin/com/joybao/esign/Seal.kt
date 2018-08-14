package com.joybao.esign

import DDP.DDPListener
import com.joybao.constants.ProjectConstants
import com.joybao.util.TaskCallBack
import com.timevale.esign.sdk.tech.bean.result.AddSealResult
import com.timevale.esign.sdk.tech.service.factory.SealServiceFactory
import org.slf4j.LoggerFactory
import com.timevale.esign.sdk.tech.bean.seal.SealColor
import com.timevale.esign.sdk.tech.bean.seal.PersonTemplateType
import com.timevale.esign.sdk.tech.bean.seal.OrganizeTemplateType
import esign.utils.constant.type.Color


/**
 * Created by MyShe on 2017/5/14.
 */
object Seal {

    private val Logger = LoggerFactory.getLogger(Seal::class.java)
    private val SEAL = SealServiceFactory.instance()

    /**
     * 创建公司签章
     */
    fun newCompanySeal(data: Map<String, Any>, cb: TaskCallBack) {
        val userId = data["mainAccountId"] as String
        val accountId = data["accountId"] as String
        val type = OrganizeTemplateType.STAR
        val color = SealColor.RED

        cb.result(SEAL.addTemplateSeal(accountId, type, color, "", ""), userId, accountId)
    }

    /**
     * 添加公司模板签章OK
     */
    fun newCompanySealOK(companyId: String, userId: String, accountId: String, res: AddSealResult) {
        val params = HashMap<String, String>()
        params.put("userId", userId)
        params.put("accountId", accountId)
        params.put("companyId", companyId)
        params.put("sealData", res.sealData)

        val methodArgs = arrayOfNulls<Any>(1)
        methodArgs[0] = params

        ProjectConstants.ddp?.call("esign.company.seal.ok", methodArgs, object : DDPListener() {
            override fun onResult(resultFields: MutableMap<String, Any>?) {
                super.onResult(resultFields)
                Logger.info(resultFields.toString())
            }
        })
    }

    /**
     * 添加公司模板签章失败
     */
    fun newCompanySealNo(userId: String, companyId: String, accountId: String, res: AddSealResult) {
        val params = HashMap<String, String>()
        params.put("userId", userId)
        params.put("accountId", accountId)
        params.put("companyId", companyId)
        params.put("errCode", res.errCode.toString())
        params.put("errMsg", res.msg.toString())

        val methodArgs = arrayOfNulls<Any>(1)
        methodArgs[0] = params

        Logger.info("生成第三方公司签章失败")
        ProjectConstants.ddp?.call("esign.company.seal.no", methodArgs, object : DDPListener() {
            override fun onResult(resultFields: MutableMap<String, Any>?) {
                super.onResult(resultFields)
                Logger.info(resultFields.toString())
            }
        })
    }

    /**
     * 创建签名
     */
    fun newSeal(data: Map<String, Any>, cb: TaskCallBack) {
        val auditId = data["auditId"] as String
        val accountId = data["accountId"] as String
        val type = data["templateType"] as String
        val color = if (data.containsKey("color")) data["color"] as String else ""
        val imgB64 = if (data.containsKey("imgB64")) data["imgB64"] as String else ""
        val hText = if (data.containsKey("hText")) data["hText"] as String else ""
        val qText = if (data.containsKey("qText")) data["qText"] as String else ""

        when (type) {
            "CompanySeal" -> signModel(accountId, true, color, hText, qText, auditId, cb)
            "PersonSeal" -> signModel(accountId, false, color, hText, qText, auditId, cb)
            else -> {
                // TODO 获取网络图片并转换成 Base64编码
//                val data = Util.getURLImage("http://joybao.oss-cn-hangzhou.aliyuncs.com/wximages/$imgB64")
//                Logger.info("获取网络图片的Base64编码Ko")
//                createSeal(accountId, data)
            }
        }
    }

    /**
     * 根据Base64生成个人签名
     */
    fun createSeal(devId: String, accountId: String, sealData: String, color: String, auditId: String, cb: TaskCallBack): AddSealResult? {
        // 签署文档使用的印章数据,若存在
        val data = sealData.substring(sealData.indexOf(',') + 1)
        Logger.debug("sign seal data: ${data}")

        var sColor: SealColor? = null
        for (sealColor in SealColor.values()) {
            if (color.equals(sealColor.color().color, ignoreCase = true)) {
                sColor = sealColor
                break
            }
        }

        return SEAL.addFileSeal(devId, accountId, sealData, sColor);
    }

    /**
     * 创建模板印章
     */
    fun signModel(accountId: String, isCompany: Boolean, color: String, hText: String, qText: String, auditId: String, cb: TaskCallBack) {
        if (isCompany) {
            this.createSealOrganize(accountId, OrganizeTemplateType.STAR, color, hText, qText, auditId, cb)
        } else {
            this.createSealPersonal(accountId, PersonTemplateType.SQUARE, color, auditId, cb)
        }
    }

    /**
     * 创建个人签章
     */
    fun createSealPersonal(accountId: String, template: PersonTemplateType, color: String, auditId: String, cb: TaskCallBack) {
        var sColor: SealColor? = null
        for (sealColor in SealColor.values()) {
            if (color.equals(sealColor.color().color, ignoreCase = true)) {
                sColor = sealColor
                break
            }
        }

        cb.result(SEAL.addTemplateSeal(accountId, template, sColor), auditId)
    }

    /**
     * 创建公司签章
     */
    fun createSealOrganize(accountId: String, template: OrganizeTemplateType, color: String, hText: String, qText: String, auditId: String, cb: TaskCallBack) {
        var sColor: SealColor? = null
        for (sealColor in SealColor.values()) {
            if (color.equals(sealColor.color().color, ignoreCase = true)) {
                sColor = sealColor
                break
            }
        }
        cb.result(SEAL.addTemplateSeal(accountId, template, sColor, hText, qText), auditId)
    }

    fun newSealOK(sealId: String, auditId: String, res: AddSealResult) {
        val params = HashMap<String, String>()
        params.put("sealId", sealId)
        params.put("auditId", auditId)
        params.put("sealData", res.sealData)

        Logger.info("签章生成成功 $sealId")

        val methodArgs = arrayOfNulls<Any>(1)
        methodArgs[0] = params

        ProjectConstants.ddp?.call("esign.seal.ok", methodArgs, object : DDPListener() {
            override fun onResult(resultFields: MutableMap<String, Any>?) {
                super.onResult(resultFields)
                Logger.info(resultFields.toString())
            }
        })
    }

    fun newSealNo(sealId: String, auditId: String, res: AddSealResult) {
        val params = HashMap<String, String>()
        params.put("sealId", sealId)
        params.put("errCode", res.errCode.toString())
        params.put("errMsg", res.msg.toString())

        Logger.info("签章生成失败 $sealId")

        val methodArgs = arrayOfNulls<Any>(1)
        methodArgs[0] = params

        ProjectConstants.ddp?.call("esign.seal.no", methodArgs, object : DDPListener() {
            override fun onResult(resultFields: MutableMap<String, Any>?) {
                super.onResult(resultFields)
                Logger.info(resultFields.toString())
            }
        })
    }
}