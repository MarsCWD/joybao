package com.joybao.esign

import DDP.DDPListener
import com.joybao.constants.ProjectConstants
import com.joybao.util.TaskCallBack
import com.joybao.util.Util
import com.timevale.esign.sdk.tech.bean.PosBean
import com.timevale.esign.sdk.tech.bean.SignPDFStreamBean
import com.timevale.esign.sdk.tech.bean.result.FileDigestSignResult
import com.timevale.esign.sdk.tech.bean.result.Result
import com.timevale.esign.sdk.tech.impl.constants.SignType
import com.timevale.esign.sdk.tech.service.factory.UserSignServiceFactory
import org.slf4j.LoggerFactory
import java.io.File
import java.io.FileOutputStream
import java.util.*

/**
 * Created by MyShe on 2017/5/18.
 */
object Contract {

    private val Logger = LoggerFactory.getLogger(Seal::class.java)
    private val userSign = UserSignServiceFactory.instance()

    fun startSign(data: Map<String, Any>, cb: TaskCallBack) {
        try {
            Logger.info("开始签署")
            val userId = data["userId"] as String
            val accountId = data["accountId"] as String
            val companyId = if (data.containsKey("companyId")) data["companyId"] as String else ""
            val contractId = data["contractId"] as String
            val signPosition = data["signPosition"] as Map<*, *>

            val signatureType = signPosition["signatureType"] as String
            val positionX = signPosition["positionX"] as Double
            val positionY = signPosition["positionY"] as Double
            val positionType = signPosition["positionType"]
            val width = if (signPosition.containsKey("width")) signPosition["width"] as Double else 159.toDouble()
            val sealId = signPosition["sealId"] as String
            Logger.info("获得签署位置信息")

            val pageIndex = if (signPosition.containsKey("pageIndex")) signPosition["pageIndex"] else "1"
            Logger.info("获得签署页码")

            Logger.info("签署时间date: ${Date().time} sealId:$sealId userId: $userId companyId: $companyId")
            val resData = Util.getSeal(sealId, userId, companyId)
            if (resData == null) {
                val res = Result()
                res.errCode = 56
                res.msg = "获取签章出错"
                return cb.result(res)
            }
            Logger.info("获得签章")

            val stream = SignPDFStreamBean()
            stream.stream = Util.readFileFromLocal("${Util.getContractPath(contractId)}current.pdf")
            Logger.info("获得当前签署的PDF流")

            val signPos = PosBean()
            signPos.posPage = pageIndex as String
            signPos.width = width.toFloat()
            signPos.posX = positionX.toFloat()
            signPos.posY = positionY.toFloat()

            val signType = when (signatureType) {
                "Single" -> SignType.Single
                "Multi" -> SignType.Multi
                "Edges" -> SignType.Edges
                "Key" -> SignType.Key
                else -> SignType.Single
            }
            Logger.info("调用易签宝签署")
            sign(accountId, resData, stream, signPos, signType, contractId, signatureType, pageIndex, cb)
        } catch (e: Exception) {
            Logger.error(e.message)

            val res = Result()
            res.errCode = 56
            res.msg = "客户端运行时错误"
            return cb.result(res)
        }
    }

    /**
     * 签署
     */
    private fun sign(accountId: String, sealData: String, stream: SignPDFStreamBean, signPos: PosBean, signType: SignType, contractId: String, signatureType: String, pageIndex: String, cb: TaskCallBack) {
        val res = userSign.localSignPDF(accountId, sealData, stream, signPos, signType)
        Logger.info("调用易签宝签署成功")
        cb.result(res, contractId, signatureType, pageIndex)
    }

    /**
     * 签署完成,存储在目标文件夹
     */
    fun signOK(itemId: String, contractId: String, signatureType: String, pageIndex: String, res: FileDigestSignResult) {
        val name = "${Date().time.toString()}.pdf"
        val path = Util.getContractPath(contractId)
        val fileName = "$path$name"

        val file = File(fileName)
        val outStream = FileOutputStream(file)
        outStream.write(res.stream)
        outStream.close()

        val serviceId = res.signServiceId
        val params = HashMap<String, String>()
        params.put("fileName", fileName)
        params.put("serviceId", serviceId)
        params.put("contractId", contractId)
        params.put("signatureType", signatureType)
        params.put("pageIndex", pageIndex)
        params.put("recordId", itemId)

        Logger.info("调用易签宝签署成功 serviceId:$serviceId")

        val methodArgs = arrayOfNulls<Any>(1)
        methodArgs[0] = params

        ProjectConstants.ddp?.call("esign.contract.sign.ok", methodArgs, object : DDPListener() {
            override fun onResult(resultFields: MutableMap<String, Any>?) {
                super.onResult(resultFields)
                Logger.info(resultFields.toString())
            }
        })
    }

    /**
     * 签署失败
     */
    fun signNo(itemId: String, contractId: String, signatureType: String, pageIndex: String, res: FileDigestSignResult) {
        val params = HashMap<String, String>()
        params.put("recordId", itemId)
        params.put("errCode", res.errCode.toString())
        params.put("errMsg", res.msg.toString())

        Logger.info("签署失败 $itemId")

        val methodArgs = arrayOfNulls<Any>(1)
        methodArgs[0] = params

        ProjectConstants.ddp?.call("esign.contract.sign.no", methodArgs, object : DDPListener() {
            override fun onResult(resultFields: MutableMap<String, Any>?) {
                super.onResult(resultFields)
                Logger.info(resultFields.toString())
            }
        })
    }
}