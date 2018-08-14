import { SimpleSchema } from "meteor/aldeed:simple-schema";

const BasicSchemaObj = {
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
                return { $setOnInsert: true };
            }
            return undefined;
        },
        optional: true,
    },
};

class Basic {
    constructor(isUpsert) {
        this.createdAt = {
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
            denyUpdate: !isUpsert,
        };
        this.updatedAt = {
            type: Date,
            autoValue() {
                return new Date();
            },
            optional: true,
        };
        this.isActive = {
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
        };
    }
}

/**
 * 关系人的Schema
 * @type {SimpleSchema}
 */
const RelationSchema = new SimpleSchema({
    userName: {
        label: "客户名称",
        type: String,
    },
    userAvatar: {
        label: "客户头像",
        type: String,
    },
    userPhone: {
        label: "客户联系方式",
        type: String,
        regEx: SimpleSchema.RegEx.ChinaPhone,
    },
});

/**
 * 简单的合约Schema
 * @type {SimpleSchema}
 */
const ContractSchema = new SimpleSchema({
    contractId: {
        label: "合约Id",
        type: String,
    },
    contractName: {
        label: "合约名",
        type: String,
    },
});

export { Basic, BasicSchemaObj, RelationSchema, ContractSchema };
