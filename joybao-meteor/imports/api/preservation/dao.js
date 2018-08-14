import { Preservation } from "./Preservation";

import ConstantCode from "../../helpers/ConstantCode";

class PreservationDao {
    static insert(preservation) {
        return Preservation.insert(preservation);
    }

    static find() {
        return Preservation.find({ state: { $ne: ConstantCode.JOB.STATE.FINISH } }).fetch();
    }

    static update(id, obj) {
        return Preservation.update({ _id: id }, { $set: obj });
    }
}

export default PreservationDao;
