import { Meteor } from "meteor/meteor";
import { Accounts } from "meteor/accounts-base";

import Logger from "../../imports/helpers/Logger";

const sessionCollection = new Meteor.Collection("sessionCollection");

class SessionHelper {
    static generateToken() {
        const token = Accounts._generateStampedLoginToken();
        return token;
    }

    static sessionUpsert(selector, value) {
        return sessionCollection.upsert(selector, { $set: value });
    }

    static sessionGet(token) {
        if (!token) {
            // throw new Error("Please provide a key!");
            Logger.error("Please provide a token!");
            return null;
        }

        const res = sessionCollection.findOne({ token });
        return res;
    }

    static sessionUpdateByUserId(userId, obj) {
        return sessionCollection.update({ userId }, { $set: obj });
    }

    static sessionUpdate(token, obj) {
        if (!token) {
            // throw new Error("Please provide a key!");
            Logger.error("Please provide a token!");
            return null;
        }

        return sessionCollection.update({ token }, { $set: obj });
    }

    static sessionOperate(token, options) {
        return sessionCollection.update({ token }, options);
    }

    static sessionOperateSelector(selector, options) {
        return sessionCollection.update(selector, options);
    }

    /**
     * 认证失败后,更新为当前个人认证状态
     * @param  {[type]} userId [description]
     * @return {[type]}        [description]
     */
    static updateSessionStateWithPerson(userId) {
        const session = sessionCollection.findOne({ userId });
        return sessionCollection.update({ userId }, { $set: { identityState: session.state } });
    }
}

export default SessionHelper;
