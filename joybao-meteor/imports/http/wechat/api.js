import API from "./active";
import ServerConfigDao from "../../api/config/dao";

const WeChat = ServerConfigDao.findOne("WeChat").value;

const api = new API(WeChat.appID, WeChat.appSecret);
API.mixin(require('./wepay'));
API.mixin(require('./red'));
module.exports = api;
