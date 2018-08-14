package com.joybao

import com.joybao.constants.ProjectConstants
import com.joybao.constants.TaskType
import com.timevale.esign.sdk.tech.service.factory.EsignsdkServiceFactory
import com.timevale.tech.sdk.bean.HttpConnectionConfig
import com.timevale.tech.sdk.bean.ProjectConfig
import com.timevale.tech.sdk.bean.SignatureConfig
import com.timevale.tech.sdk.constants.AlgorithmType
import com.timevale.tech.sdk.constants.HttpType
import DDP.DDPClient
import DDP.DDPListener
import org.slf4j.LoggerFactory
import com.joybao.util.TaskQueue
import com.joybao.util.Util
import org.slf4j.Logger
import kotlin.system.exitProcess

var server = "localhost"
var port = 3000
val Logger: Logger = LoggerFactory.getLogger("Logger")

fun main(args: Array<String>) {
    var path = ""
    for (i in 0..args.size - 1) {
        when (args[i]) {
            "-h" -> server = args[i + 1]
            "-p" -> port = (args[i + 1]).toInt()
            "-conf" -> path = args[i + 1]
        }
    }

    path = path.trim()
    if (path == "") {
        Logger.info("请输入配置文件路径")
        exitProcess(0)
    }
    val jsonStr = Util.readConfig(path)
    if (!Util.parseConfig(jsonStr)) {
        Logger.info("解析配置文件出错")
        exitProcess(0)
    }

    ProjectConstants.server = "http://$server:$port"
    Logger.info("Server:${ProjectConstants.server}")

    initESign()
    connectDDP()
}

/** DDP 连接开始建立 **/
fun connectDDP(reConnect: Boolean = false) {
    ProjectConstants.ddp = DDPClient(server, port)

    while (ProjectConstants.ddp?.state != DDP.DDPClient.CONNSTATE.Connected) {
        Thread.sleep(500)
        ProjectConstants.ddp?.connect()
    }
    if (reConnect) Logger.info("与 $server:$port 重新建立连接成功") else Logger.info("与 $server:$port 建立连接成功")

    /** 事件 订阅 **/
    ProjectConstants.ddp?.errorListener = object : DDPListener() {
        override fun onResult(resultFields: MutableMap<String, Any>?) {
            super.onResult(resultFields)
            println("发生错误, 准备重新建立连接")
            connectDDP(true)
        }
    }
    ProjectConstants.ddp?.closeListener = object : DDPListener() {
        override fun onResult(resultFields: MutableMap<String, Any>?) {
            super.onResult(resultFields)
            println("服务器主动断开, 准备重新建立连接")
            connectDDP(true)
        }
    }

    ProjectConstants.ddp?.subscribe("esign.identity", "Person", null, object : DDPListener() {
        override fun onAdded(itemId: String?, obj: Any?) {
            super.onAdded(itemId, obj)
            Logger.info("Person id: $itemId 加入到队列")
            TaskQueue.push(TaskType.PersonNew, obj!!, itemId)
        }
    })

    ProjectConstants.ddp?.subscribe("esign.identity", "Company", null, object : DDPListener() {
        override fun onAdded(itemId: String?, obj: Any?) {
            super.onAdded(itemId, obj)
            Logger.info("Comapny id: $itemId 加入到队列")
            TaskQueue.push(TaskType.CompanyNew, obj!!, itemId)
        }
    })

    ProjectConstants.ddp?.subscribe("esign.identity", "Seal", null, object : DDPListener() {
        override fun onAdded(itemId: String?, obj: Any?) {
            super.onAdded(itemId, obj)
            Logger.info("签章生成 id: $itemId 加入到队列")
            TaskQueue.push(TaskType.SealNew, obj!!, itemId)
        }
    })

//    ProjectConstants.ddp?.subscribe("esign.company.seal", "company.seal", null, object : DDPListener() {
//        override fun onAdded(itemId: String?, obj: Any?) {
//            super.onAdded(itemId, obj)
//            Logger.info("企业签章生成 id: $itemId")
//            TaskQueue.push(TaskType.ThirdCompanySealNew, obj!!, itemId)
//        }
//    })

    /** 调用易签宝生成签章合约 **/
    ProjectConstants.ddp?.subscribe("esign.contract.sign", "contract.sign", null, object : DDPListener() {
        override fun onAdded(itemId: String?, obj: Any?) {
            super.onAdded(itemId, obj)
            Logger.info("签约记录生成 记录id: $itemId")
            TaskQueue.push(TaskType.ContractSignature, obj!!, itemId)
        }
    })
}

/** 易签宝服务初始化 **/
fun initESign() {
    Logger.info("初始化易签宝服务")

    val SDK = EsignsdkServiceFactory.instance()

    val projectConfig = ProjectConfig()
    projectConfig.itsmApiUrl = ProjectConstants.APIS_URL
    projectConfig.projectId = ProjectConstants.PROJECT_ID
    projectConfig.projectSecret = ProjectConstants.PROJECT_SECRET

    val httpConfig = HttpConnectionConfig()
    if (ProjectConstants.HTTP_TYPE.equals(HttpType.HTTP.type(), ignoreCase = true)) {
        httpConfig.setHttpType(HttpType.HTTP)
    }
    httpConfig.proxyIp = ProjectConstants.PROXY_IP
    httpConfig.proxyPort = ProjectConstants.PROXY_PORT
    httpConfig.retry = ProjectConstants.RETRY

    val signConfig = SignatureConfig()
    if (ProjectConstants.ALGORITHM.equals(AlgorithmType.RSA.type(), ignoreCase = true)) {
        signConfig.algorithm = AlgorithmType.RSA
        signConfig.privateKey = ProjectConstants.PRIVATE_KEY
        signConfig.esignPublicKey = ProjectConstants.ESIGN_PUBLIC_KEY
    }

    val result = SDK.init(projectConfig, httpConfig, signConfig)
    Logger.info("初始化易签宝服务${result.msg}")
}