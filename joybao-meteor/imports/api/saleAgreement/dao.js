import { SaleAgreement } from "./SaleAgreement";

class SaleAgreementDao {
    static insert(obj) {
        return SaleAgreement.insert(obj);
    }

    static update(selector, options) {
        return SaleAgreement.update(selector, { $set: options });
    }

    static find(selector, options) {
        return SaleAgreement.find(selector, options).fetch();
    }
}

export default SaleAgreementDao;
