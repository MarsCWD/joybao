import { Mongo } from "meteor/mongo";
import { SimpleSchema } from "meteor/aldeed:simple-schema";
import { BasicSchemaObj } from "../common/schema";

import Logger from "../../helpers/Logger";
import ConstantCode from "../../helpers/ConstantCode";

const Preservation = new Mongo.Collection("Preservation");

const PreservationSchemaObj = {
    contractName: {
        label: "对应的合约名",
        type: String,
    },
    contractId: {
        label: "对应的合约Id",
        type: String,
    },
    serviceId: {
        label: "对应的签署文件Id",
        type: String,
    },
    docUrl: {
        label: "文档保全url",
        type: String,
        optional: true,
    },
    eid: {
        label: "存档记录标记",
        type: String,
        optional: true,
    },
    state: {
        label: "",
        type: String,
        autoValue() {
            if (this.isInsert) {
                return ConstantCode.JOB.STATE.WAIT;
            } else if (this.isUpsert) {
                return ConstantCode.JOB.STATE.WAIT;
            }
            return undefined;
        },
    },
    errorCode: {
        type: String,
        label: "错误状态码",
        optional: true,
    },
    erorrMsg: {
        type: String,
        label: "错误信息",
        optional: true,
    },
};

Logger.info("Preservation init once");
Object.assign(PreservationSchemaObj, BasicSchemaObj);
const PreservationSchema = new SimpleSchema(PreservationSchemaObj);
Preservation.attachSchema(PreservationSchema);
export { Preservation, PreservationSchema };
