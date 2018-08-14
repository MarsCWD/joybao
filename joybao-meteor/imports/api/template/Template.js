/** 模板表 */
import {
    Mongo
} from "meteor/mongo";
import {
    SimpleSchema
} from "meteor/aldeed:simple-schema";

const Template = new Mongo.Collection("Template");

/** 字段表 **/
const FieldSchema = new SimpleSchema({
    name: {
        label: "字段名称",
        type: String,
        optional: true,
    },
    placeholder: {
        label: "输入提示",
        type: String,
        optional: true,
    },
    btnName: {
        label: "按钮名称",
        type: String,
        optional: true,
    },
    showType: {
        label: "显示组件",
        type: String,
        optional: true,
    },
    dataType: {
        label: "数据类型",
        type: String,
        optional: true,
    },
    wight: {
        label: "权重",
        type: Number,
        optional: true,
    },
});

/** 步骤表 **/
const StepSchema = new SimpleSchema({
    stepName: {
        label: "步骤名称",
        type: String,
        optional: true,
    },
    fields: {
        label: "步骤字段",
        type: [FieldSchema],
        optional: true,
    }
});

/** 模板表 **/
const TemplateSchema = new SimpleSchema({
    code:{
        label: "模板编号",
        type: String,
        optional: true
    },
    templateName: {
        label: "模板名称",
        type: String,
    },
    templateKey: {
        label: "模板key",
        type: String,
    },
    branch: {
        label: "模板分支",
        type: [Number],
        optional: true,
    },
    branchIndex: {
        label: "当前模板分支",
        type: Number,
        optional: true,
    },
    stepSum: {
        label: "模板步骤数",
        type: Number,
        optional: true,
    },
    steps: {
        label: "模板步骤",
        type: [StepSchema],
        optional: true,
    },
    createAt: {
        type: Date,
        autoValue() {
            if (this.isUpsert) {
                return {
                    $setOnInsert: new Date()
                };
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
    }

});

Template.attachSchema(TemplateSchema);
export {
    Template,
    TemplateSchema
};
