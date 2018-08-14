package com.joybao.util

import com.alibaba.fastjson.JSON
import com.joybao.Logger
import com.joybao.constants.ProjectConstants
import net.sf.json.JSONObject
import sun.misc.BASE64Encoder
import java.io.*
import java.net.HttpURLConnection
import java.net.URL
import java.io.FileReader
import java.io.BufferedReader
import java.io.IOException


/**
 * Created by MyShe on 2017/5/18.
 */
object Util {

    fun parseConfig(jsonStr: String): Boolean {
        try {
            val obj = JSONObject.fromObject(jsonStr)
            println(obj)

            val ESign = obj.getJSONObject("ESign")

            println("环境: ${ESign.getString("name")}")

            ProjectConstants.ImageURL = obj.getString("imageURL")
            ProjectConstants.PROJECT_ID = ESign.getString("projectId")
            ProjectConstants.PROJECT_SECRET = ESign.getString("projectSecret")
            ProjectConstants.PATH = ESign.getString("contractPath")

            val java = ESign.getJSONObject("java")

            ProjectConstants.APIS_URL = java.getString("apis_url")
        } catch (e: Exception) {
            e.printStackTrace()
            return false
        }

        println(ProjectConstants)
        return true
    }

    fun readFileFromLocal(path: String): ByteArray? {
        var inStream: BufferedInputStream? = null
        var outStream: ByteArrayOutputStream? = null
        try {
            inStream = BufferedInputStream(FileInputStream(path))
            outStream = ByteArrayOutputStream()
            val buffer = ByteArray(1024)
            var len = inStream.read(buffer)
            while (len != -1) {
                outStream.write(buffer, 0, len)
                len = inStream.read(buffer)
            }
            inStream.close()
            outStream.close()
            return outStream.toByteArray()
        } catch (e: Exception) {
            e.printStackTrace()
        } finally {
            if (inStream != null) {
                try {
                    inStream.close()
                } catch (e1: Exception) {
                    e1.printStackTrace()
                }
            }
            if (outStream != null) {
                try {
                    outStream.close()
                } catch (e2: Exception) {
                    e2.printStackTrace()
                }
            }
        }
        return null
    }

    fun readConfig(path: String): String {
        val file = File(path)
        var reader: BufferedReader? = null
        val lastStr = StringBuilder()

        try {
            reader = BufferedReader(FileReader(file))

            var tempString: String? = reader.readLine()
            while (tempString != null) {
                lastStr.append(tempString)
                tempString = reader.readLine()
            }
            reader.close()
        } catch (e: IOException) {
            e.printStackTrace()
        } finally {
            if (reader != null) {
                try {
                    reader.close()
                } catch (e1: IOException) {
                }
            }
        }
        return lastStr.toString()
    }

    fun saveFile(): String {

        return ""
    }

    fun getContractPath(contractId: String): String {
        return "${ProjectConstants.PATH}/$contractId/"
    }

    fun getSeal(sealId: String, userId: String, companyId: String): String? {
        val url = URL("${ProjectConstants.server}/seal.view.joybao?sealId=$sealId&userId=$userId&companyId=$companyId")
        Logger.info("url: $url")
        val conn = url.openConnection() as HttpURLConnection
        conn.requestMethod = "GET"
        conn.connectTimeout = 5 * 1000

        val responseCode = conn.responseCode

        if (responseCode == 200) {
            val inReader = BufferedReader(InputStreamReader(conn.inputStream))

            val response = StringBuffer()
            var inputLine = inReader.readLine()
            while (inputLine != null) {
                response.append(inputLine)
                inputLine = inReader.readLine()
            }
            inReader.close()
            Logger.info("response: ${response.toString()}")

            val res = JSON.parseObject(response.toString())
            val success = res.getBoolean("success")
            if (success) {
                val data = res.getJSONObject("data")

                return if (data.containsKey("base64")) data.getString("base64") else Util.getURLImage(ProjectConstants.ImageURL + data.getString("sealData"))
            } else {
                val message = res.getString("message")
                Logger.error("$sealId 请求错误  Error: $message")
                return null
            }
        } else {
            Logger.error("$sealId 请求错误 responseCode:$responseCode")
            return null
        }
    }

    fun getURLImage(url: String): String {
        val url = URL(url)
        val conn = url.openConnection() as HttpURLConnection
        conn.requestMethod = "GET"
        conn.connectTimeout = 5 * 1000
        val inStream = conn.inputStream
        val data = readInputSteam(inStream)
        val res = BASE64Encoder().encode(data)
        return res
    }

    fun readInputSteam(inSteam: InputStream): ByteArray? {
        val outStream = ByteArrayOutputStream()
        val buffer = ByteArray(1024)

        var len = inSteam.read(buffer)
        while (len != -1) {
            outStream.write(buffer, 0, len)
            len = inSteam.read(buffer)
        }

        inSteam.close()
        return outStream.toByteArray()
    }

}