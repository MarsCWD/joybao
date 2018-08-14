/** 全局配置表 **/
import { Mongo } from "meteor/mongo";
import { SimpleSchema } from "meteor/aldeed:simple-schema";

const ServerConfig = new Mongo.Collection("ServerConfig");

/** 字段表 **/
const ServerConfigSchema = new SimpleSchema({
    name: {
        label: "配置名",
        type: String,
        unique: true,
    },
    value: {
        label: "配置属性",
        type: Object,
        blackbox: true,
    },

    source: {
        label: "配置来源",
        type: String,
    },
    status: {
        label: "状态",
        type: Boolean,
        autoValue() {
            if (this.isInsert) {
                return true;
            } else if (this.isUpsert) {
                return { $setOnInsert: true };
            }
            return undefined;
        },
        optional: true,
    },
    createAt: {
        type: Date,
        autoValue() {
            if (this.isUpsert) {
                return { $setOnInsert: new Date() };
            }

            this.unset();
            return undefined;
        },
        optional: true,
    },
    updatedAt: {
        type: Date,
        autoValue() {
            return new Date();
        },
        optional: true,
    },
});

ServerConfig.attachSchema(ServerConfigSchema);
export { ServerConfig, ServerConfigSchema };
