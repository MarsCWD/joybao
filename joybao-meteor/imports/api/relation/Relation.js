/** User relationship Collection */
import { Mongo } from "meteor/mongo";
import { SimpleSchema } from "meteor/aldeed:simple-schema";

import { BasicSchemaObj } from "../common/schema";
import Logger from "../../helpers/Logger";
import ConstantCode from "../../helpers/ConstantCode";

const Relation = new Mongo.Collection("Relation");

const PartySchema = new SimpleSchema({
    userId: {
        label: "UserId",
        type: String,
    },
    companyId: {
        label: "companyId",
        type: String,
        optional: true,
    },
    userName: {
        label: "user name",
        type: String,
    },
    companyName: {
        label: "company name",
        type: String,
    },

    confirmState: {
        label: "确认状态",
        type: String,
        allowedValues: Object.values(ConstantCode.CONTRACT.CONFIRMED_STATE),
    },
    signState: {
        label: "签署状态",
        type: String,
        allowedValues: Object.values(ConstantCode.CONTRACT.SIGNATURE_STATE),
    },
});

const RelationSchemaObj = {
    contractId: {
        label: "合约Id",
        type: String,
    },
    partyAId: {
        label: "签署方甲Id",
        type: String,
    },
    partyA: {
        label: "签署方甲",
        type: PartySchema,
    },
    partyBId: {
        label: "签署方乙Id",
        type: String,
    },
    partyB: {
        label: "签署方乙",
        type: PartySchema,
    },
};

Logger.info("Relation init once");
Object.assign(RelationSchemaObj, BasicSchemaObj);
const RelationSchema = new SimpleSchema(RelationSchemaObj);
Relation.attachSchema(RelationSchema);
export { Relation, RelationSchema };
