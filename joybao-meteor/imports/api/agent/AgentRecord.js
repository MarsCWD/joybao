/** 个人信息表 */
import { Mongo } from "meteor/mongo";
import { SimpleSchema } from "meteor/aldeed:simple-schema";
import { BasicSchemaObj } from "../common/schema";

import Logger from "../../helpers/Logger";

const AgentRecord = new Mongo.Collection("AgentRecord");

const AgentRecordSchemaObj = {
    userId: {
        label: "认证用户ID",
        type: String,
        denyUpdate: true,
    },
    userName: {
        label: "个人姓名",
        type: String,
        optional: true,
    },
    companyId: {
        label: "认证企业ID",
        type: String,
        denyUpdate: true,
    },
    companyName: {
        label: "认证企业名称",
        type: String,
        denyUpdate: true,
    },
    isMaster: {
        label: "是否是公司主体账号",
        type: Boolean,
    },
    identityId: {
        label: "认证信息ID",
        type: String,
        optional: true,
    },
    certificateId: {
        label: "代理人证书文件ID",
        type: String,
        optional: true,
    },
    status: {
        label: "认证状态",
        type: String,
    },
    createdAt: {
        type: Date,
        autoValue() {
            if (this.isInsert) {
                return new Date();
            } else if (this.isUpsert) {
                return { $setOnInsert: new Date() };
            }
            this.unset();
            return undefined;
        },
        denyUpdate: true,
    },
    updatedAt: {
        type: Date,
        autoValue() {
            return new Date();
        },
        optional: true,
    },
};

Logger.info("Agent init once");
Object.assign(AgentRecordSchemaObj, BasicSchemaObj);
const AgentRecordSchema = new SimpleSchema(AgentRecordSchemaObj);
AgentRecord.attachSchema(AgentRecordSchema);
export { AgentRecord, AgentRecordSchema };
