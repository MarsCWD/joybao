import { Relation } from "./Relation";

class RelationDao {
    static insert(relation) {
        return Relation.insert(relation);
    }

    static insertMany(relationArr) {
        let flag;
        for (let i = 0, len = relationArr.length; i < len; i += 1) {
            const relation = relationArr[i];
            flag = Relation.insert(relation);
            if (!flag) {
                return false;
            }
        }
        return true;
    }

    static find(userId, companyId) {
        const markId = userId + companyId;
        return Relation.find({
            $or: [{
                partyAId: markId
            }, {
                partyBId: markId
            }]
        }).fetch();
    }
}

export default RelationDao;
