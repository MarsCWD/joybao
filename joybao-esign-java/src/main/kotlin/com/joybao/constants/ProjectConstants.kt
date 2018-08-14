package com.joybao.constants

import DDP.DDPClient

/**
 * 易签宝项目配置
 */
object ProjectConstants {
    var ddp: DDPClient? = null
    /** Meteor 服务器地址 **/
    var server = ""
    /** 阿里云图片地址 **/
    var ImageURL = ""
    /** 項目ID  */
    var PROJECT_ID = ""
    /** 项目密钥  */
    var PROJECT_SECRET = ""
    /** 开放平台地址 **/
    var APIS_URL = ""
    /** 合约文件地址 **/
    var PATH = ""

    /** 协议类型 **/
    val HTTP_TYPE = "https"
    /** 代理服务器IP **/
    val PROXY_IP = ""
    /** 代理服务器端口 **/
    val PROXY_PORT = 0
    /** 请求失败重试次数 **/
    val RETRY = 5

    /** 算法类型 **/
    val ALGORITHM = "HMAC-SHA256"
    /** RSA公钥 **/
    val ESIGN_PUBLIC_KEY = ""
    /** RSA私钥 **/
    val PRIVATE_KEY = ""

    /** 错误任务重新执行次数 **/
    val TASK_RETRY = 3
}
