import { Order } from "./Order";

/** 模板相关Dao */
class OrderDao {
    static find(selector, options) {
        return Order.find(selector, options)
            .fetch();
    }

    static findOne(selector, options) {
        return Order.findOne(selector, options);
    }

    static insert(obj) {
        return Order.insert(obj);
    }

    /** 根据订单号 更新指定字段 */
    static updateSpecifiedFieldByCode(code, obj) {
        return Order.update({ code }, { $set: obj });
    }
}

export default OrderDao;
