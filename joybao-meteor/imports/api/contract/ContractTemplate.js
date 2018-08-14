/** 合约模板 **/
import { Mongo } from "meteor/mongo";
import { SimpleSchema } from "meteor/aldeed:simple-schema";

const ContractTemplate = new Mongo.Collection("ContractTemplate");

const ContractTemplateFiled = new SimpleSchema({
    filedName: {
        label: "字段名",
        type: String,
    },
    filedPlaceholder: {
        label: "字段占位符",
        type: String,
    },
    required: {
        label: "必填",
        type: Boolean,
    }
});

const ContractTemplateSchema = new SimpleSchema({
    name: {
        label: "合约模板名",
        type: String,
    },
    filePath: {
        label: "合约模板文件路径",
        type: String,
    },
    fileds: {
        label: "合约字段",
        type: [ContractTemplateFiled],
    },

    createAt: {
        type: Date,
        autoValue() {
            return new Date();
        },
        optional: true,
    },
    updatedAt: {
        type: Date,
        autoValue() {
            if (this.isInsert) {
                return new Date();
            } else if (this.isUpsert) {
                return new Date();
            } else if (this.isUpdate) {
                return new Date();
            }
            return undefined;
        },
        optional: true,
    },
    isActive: {
        type: Boolean,
        autoValue() {
            if (this.isInsert) {
                return true;
            } else if (this.isUpsert) {
                return true;
            }
            return undefined;
        },
        optional: true,
    },
});

ContractTemplate.attachSchema(ContractTemplateSchema);
export { ContractTemplate, ContractTemplateSchema };
