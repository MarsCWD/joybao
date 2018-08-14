import Logger from "../../imports/helpers/Logger";
import ServerConfigDao from "../../imports/api/config/dao";
import request from "request";

const AipOcrObj = ServerConfigDao.findOne("AipOcr").value;
const AipOcr = require("../../imports/third/baiduAip");

const client = new AipOcr(AipOcrObj.AppId, AipOcrObj.ApiKey, AipOcrObj.SecretKey);

/**
 * 解析结果
 * @param data
 */
const parseIdCard = function(data){
    try{
        const parsedData = {};
        parsedData.image_status = data.image_status;
        parsedData.realName = data.words_result['姓名'].words;
        parsedData.IDCard = data.words_result['公民身份号码'].words;
        return parsedData;
    }
    catch (err){
        return null;
    }
}

class AipOcrHelper {
    /**
     * 识别身份证
     * @param  {[type]} base64  [图片base64]
     * @param  {[type]} isFront [身份证是否正面朝上]
     * @return {[type]}
     */
	static recognitionIdCard(url,isFront,cb){
        var options = {
            url: url,
            encoding: null
        };
        request(options, function(error, response, buffer) {
            if (error) {
            }
            const base64Img = buffer.toString('base64');　　//将Buffer对象转换为字符串并以base64编码格式显示
            client.idcard(base64Img, isFront,(err,result)=>{
                if(err || result.error_code){
                    return cb(err,null)
                }
                const data = parseIdCard(result);
                if(!data){
                    return cb(null,null);
                }
                cb(null,data)
            });
        });
	}


}

Logger.debug("AipOcrHelper 执行一次");

export default AipOcrHelper;
