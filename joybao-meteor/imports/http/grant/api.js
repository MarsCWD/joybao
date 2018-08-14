import ServerConfigDao from "../../api/config/dao";
import Logger from "../../helpers/Logger";

const superagent = require("superagent");

const GrantObj = ServerConfigDao.findOne("Grant").value;

Logger.log("初始化一次 grant api");

/**
 * 获得授权服务器的授权结果
 * @param  {[type]} clientID     [客户端ID]
 * @param  {[type]} clientSecret [客户端Key]
 * @return {[type]}              [description]
 */
function getAccessToken(clientID, clientSecret, cb) {
    const authorization = new Buffer(`${clientID}:${clientSecret}`).toString("base64");
    superagent
        .post(GrantObj.url)
        .set("Authorization", `Basic ${authorization}`)
        .set("Content-Type", "application/x-www-form-urlencoded")
        .send({ grant_type: "client_credentials" })
        .end((err, res) => {
            if (err) {
                cb(null, { success: false });
            } else if (res.statusCode === 200) {
                cb(null, { success: true, data: JSON.parse(res.text) });
            } else {
                cb(null, { success: false });
            }
        });
}

export default { getAccessToken };
