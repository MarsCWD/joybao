/**
 * MongoDB工具类
 */
class MongoDBHelper {

    /**
     * 将数组转换成需要返回的fields。
     * 例如
     * 传入：[_id, name, nickname]  [ 'properties', 'price', 'name', 'quantity', 'image' ]
     * 返回：{fields: { _id: 1, name: 1, nickname: 1 }}  { fields: { properties: 1, price: 1, name: 1, quantity: 1, image: 1 } }
     * @param  {Array}   array       [要做操作的数组]
     * @param  {Boolean} [show=true] [是否选择]
     * @return {{}}                  [description]
     */
    static fields(array, show = true) {
        const flag = show ? 1 : 0;
        const fields = {};
        array.forEach(key => {
            fields[key] = flag;
        });
        return fields;
    }
}

export default MongoDBHelper;
