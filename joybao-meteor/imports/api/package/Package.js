/** 模板表 */
import {
    Mongo
} from "meteor/mongo";
import {
    SimpleSchema
} from "meteor/aldeed:simple-schema";

const Package = new Mongo.Collection("Package");

const PackageSchema = new SimpleSchema({
    name: {
        label: "套餐名称",
        type: String,
    },
    price: {
        label: "套餐价格(元)",
        type: Number,
    },
    increment: {
        label: "包含的签署次数",
        type: Number,
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

Package.attachSchema(PackageSchema);
export {
    Package,
    PackageSchema
};
