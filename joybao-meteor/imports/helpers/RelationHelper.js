import { ContractDao } from "../api/contract/dao";
import ConstantCode from "./ConstantCode";

class RelationHelper {
    static scan() {
        const list = ContractDao.find({ status: ConstantCode.CONTRACT.CONTRACT_STATUS.FINISH }, { limit: 10 });

    }
}

export default RelationHelper;
