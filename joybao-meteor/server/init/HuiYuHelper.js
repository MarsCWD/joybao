import Logger from "../../imports/helpers/Logger";
import ServerConfigDao from "../../imports/api/config/dao";
import request from "request";
import common from "../../imports/helpers/Common";
import crypto from "crypto";
import { ErrorCode, ErrorJSON } from "../../imports/helpers/ErrorJson";
const HuiYuObj = ServerConfigDao.findOne("HuiYu").value;

const {
    user_name,
    password,
    url,
    api_version,
    product_set
} = {
    user_name: HuiYuObj.user_name,
    password: HuiYuObj.password,
    url: HuiYuObj.url,
    api_version: HuiYuObj.api_version,
    product_set: HuiYuObj.product_set
};

const encryption = (time_stamp) => {
    let MD5 = crypto.createHash('md5');
    const md5pw = MD5.update(password).digest("hex").toUpperCase();
    MD5 = crypto.createHash('md5');
    return MD5.update(user_name + time_stamp + md5pw).digest("hex").toUpperCase();
}
class HuiYuHelper {
    /**
     * 获取企业信息
     * @param  {[type]}	companyName  [企业名称]
     * @return {[type]}
     */
    static getCompanyInfo(companyName, cb) {
        const op = {
            user_name,
            api_version,
            product_set,
            time_stamp: common.formatDate("yyyyMMddhhmmss"),
            query_condition: {
                company_name: companyName
            }
        }
        op.verify_key = encryption(op.time_stamp);
        // 加密
        request({
            url: url,
            method: "POST",
            json: true,
            headers: {
                "content-type": "application/json",
            },
            body: op
        }, function(err, response, body) {
            const result = response.body;
            if (result.result_code != 200) {
                return cb(result.result_desc);
            }
            try {
                return cb(null, result.result.query_reports[0].product_res_detail);
            } catch (err) {
                return cb(err);
            }
        });
    }
    /**
     * 解析出关键字段
     * @param  {[type]}	obj  [惠誉返回的数据]
     * @return {[type]}
     */
    static parseCompanyInfo(obj) {
        try {
            const basicInfo = obj.filter(value => value.name === "corporation_basic_info");
            const baseDetail = basicInfo[0].detail[0];
            const companyInfo = {
                name:baseDetail.ent_name,
                codeNO:baseDetail.reg_no,// 注册号
                codeUSC:baseDetail.credit_code,// 社会统一信用代码
                OrgCode:baseDetail.credit_code?baseDetail.credit_code:baseDetail.reg_no,// 社会统一信用代码 或 注册号
                address:baseDetail.address, // 所在地
                startTime:baseDetail.term_start, // 成立时间
                status:baseDetail.status,// 公司状况
                legalName:baseDetail.oper_name, // 法人姓名
            }
            if (!companyInfo.name) {
                return null;
            }
            return companyInfo;
        } catch (err) {
            return null;
        }
    }

}

Logger.debug("HuiYuHelper 执行一次");
// HuiYuHelper.getCompanyInfo("绍兴嗖迹网络技术有限公司");
export default HuiYuHelper;
