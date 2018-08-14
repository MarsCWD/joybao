import { JsonRoutes } from "meteor/simple:json-routes";

import Logger from "../../imports/helpers/Logger";
import SessionHelper from "../collections/session";

const Fiber = Npm.require("fibers");
const ignoreURL = ["/user.login", "/user.oauth.token", "/order.callback", "/seal.view.joybao"];

JsonRoutes.Middleware.authenticateMeteorUserByToken =
    (req, res, next) => {
        // 本地测试免除TOKEN验证
        // return next();
        Fiber(() => {
            if (req.originalUrl && !ignoreURL.includes(req.originalUrl.split("?")[0])) {
                const token = req.authToken;
                if (!token) {
                    let body = {
                        success: false,
                        message: "Invalide Token"
                    };
                    body = JSON.stringify(body, null, 2);
                    res.statusCode = 403;
                    res.setHeader("Content-Type", "application/json");
                    res.write(body);
                    res.end();
                    return res;
                }

                const obj = SessionHelper.sessionGet(token);
                if (obj) {
                    if (new Date().getTime() > obj.expiratime) {
                        let body = {
                            success: false,
                            message: "Token Expiratime"
                        };
                        body = JSON.stringify(body, null, 2);
                        res.statusCode = 403;
                        res.setHeader("Content-Type", "application/json");
                        res.write(body);
                        res.end();
                        return res;
                    }
                    req.session = obj;
                } else {
                    let body = {
                        success: false,
                        message: "Invalide Token"
                    };
                    body = JSON.stringify(body, null, 2);
                    res.statusCode = 403;
                    res.setHeader("Content-Type", "application/json");
                    res.write(body);
                    res.end();
                    return res;
                }
            }
            return next();
        }).run();
    };
