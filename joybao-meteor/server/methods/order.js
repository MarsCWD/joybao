import API from "../../imports/http/wechat/api";
import validator from "../../imports/helpers/simple-schema-validator";
import OrderDao from "../../imports/api/order/dao";
import CompanyDao from "../../imports/api/company/dao";
import PersonDao from "../../imports/api/person/dao";
import PackageDao from "../../imports/api/package/dao";
import common from "../../imports/helpers/Common";
import ConstantCode from "../../imports/helpers/ConstantCode";
import Role from "../../imports/helpers/Role";
import xml2js from "xml2js";

import { ErrorCode, ErrorJSON } from "../../imports/helpers/ErrorJson";
// import xml2js from "xml2js";

//  统一下单接口
new ValidatedMethod({
    name: "order.pay",
    mixins: [RestMethodMixin],
    validate: validator(new SimpleSchema({
        session: {
            type: Object,
            blackbox: true,
        },
        price: {
            label: "支付金额",
            type: Number,
        },
        increment: {
            label: "包含的签署次数",
            type: Number,
            decimal:true
        },
        packageId: {
            label: "套餐id",
            type: String
        },
        ip: {
            label: "用户ip",
            type: String,
            optional: true
        },
        companyId: {
            label: "公司id",
            type: String,
            optional: true
        }

    })),
    run({ session, price, increment, packageId, companyId, ip }) {

        // 测试红包
        // let redCode = API.randomString(28);
        // let redPa ={
        //     mch_billno:redCode,
        //     re_openid:session.openid,
        //     client_ip:"127.0.0.1"
        // }
        // const grantRed = Meteor.wrapAsync(API.grantRed);
        // let redData = grantRed(API, redPa);

        // 实名认证
        if (session.identityState !== ConstantCode.IDENTITY_STATUS.SUCCESS) {
            return ErrorJSON(ErrorCode.PERSON.UNEXISTED);
        }
        // 校检套餐数据
        let package = PackageDao.findOne({ _id: packageId });
        if (!package) {
            return ErrorJSON(ErrorCode.PACKAGE.NOT_FOUND);
        }
        if (package.price !== price || package.increment !== increment) {
            return ErrorJSON(ErrorCode.ORDER.INVALID_PACKAGE);
        }
        // 判断是否有相同的订单
        let code;
        const userRole = session.currentCompanyId ? Role.COMPANY : Role.PERSON;
        const orders = OrderDao.find({ userId: session.userId, packageId: packageId, status: ConstantCode.ORDER.STATUS.PADDING, time_expire: { $gt: new Date() } });
        if (orders && orders.length > 0) { // 存在符合条件的订单
            code = orders[0].code;
        } else { // 不存在
            // 生成订单表
            code = common.formatDate("yyyyMMddhhmmss") + API.randomString(6, "number");
            const targetId = userRole === Role.PERSON ? session.userId : companyId;
            const order = {
                price,
                increment,
                code,
                userType: userRole,
                packageId: packageId,
                userId: session.userId,
                status: ConstantCode.ORDER.STATUS.INIT,
                time_start: new Date(),
                time_expire: new Date(new Date().getTime() + 300000),
                targetId: targetId
            };
            let orderId = OrderDao.insert(order);
            if (!orderId) {
                return ErrorJSON(ErrorCode.SERVER);
            }
        }

        //调用统一下单接口
        let pa = {
            body: "白鲸宝签署次数购买", // 商品描述
            out_trade_no: code, // 商户订单号
            total_fee: price*100, // 总金额
            spbill_create_ip: "127.0.0.1", // 提交者ip
            trade_type: "JSAPI", // 交易类型
            openid: session.openid, // openid
        };
        const unifiedorder = Meteor.wrapAsync(API.unifiedorder);
        let data = unifiedorder(API, pa);
        // 调用统一下单接口失败
        if (!data || data.result_code === "FAIL" || data.return_code === "FAIL") {
            return ErrorJSON(ErrorCode.ORDER.UNIFIEDORDER_ERR);
        }
        // 修改订单状态
        OrderDao.updateSpecifiedFieldByCode(code, { status: ConstantCode.ORDER.STATUS.PADDING });
        let res = {};
        res.package = "prepay_id=" + data.prepay_id;
        res.nonceStr = API.randomString();
        res.timeStamp = (Date.parse(new Date()) / 1000).toString();
        res.signType = "MD5";
        res.appId = data.appid;
        res.paySign = API.generateSignature(res);
        return { success: true, data: res };
    },
    restOptions: {
        url: "/order.pay",
        getArgsFromRequest(req) {
            const obj = req.body;
            obj.session = req.session;
            obj.price = req.body.price;
            obj.increment = req.body.increment;
            obj.packageId = req.body.packageId;
            obj.companyId = req.body.companyId;
            obj.ip = req.headers["x-forwarded-for"];
            return [obj];
        },
    },
});

/**
 * 下单接口回调
 *
 * 校验
 * 添加次数
 * 修改订单状态
 */
// TODO 数据锁进行并发控制
new ValidatedMethod({
    name: "order.callback",
    mixins: [RestMethodMixin],
    validate: null,
    run(data) {
        if (!data || data.return_code !== "SUCCESS") { // 通信失败
            return { return_code: "FAIL", return_msg: data.return_msg };
        }

        // 是否已经处理过该回调
        const code = data.out_trade_no; // 订单号
        const order = OrderDao.findOne({ code: code });
        if (order && order.wechatCode) {
            return { return_code: "SUCCESS", return_msg: "OK" };
        }

        if (data.return_code !== "SUCCESS") { // 支付失败
            OrderDao.updateSpecifiedFieldByCode(code, {
                status: ConstantCode.ORDER.STATUS.FAILURE,
                wechatCode: data.transaction_id,
                errDes: data.err_code + ":" + data.err_code_des
            })
            return { return_code: "SUCCESS", return_msg: "OK" };
        }

        // 签名校验
        // TODO 校验出错解决方案
        const pa = Object.assign({}, data);
        pa.sign = "";
        if (API.generateSignature(pa) !== data.sign) {
            Logger.error(`充值回调 签名校验失败 `);
            return { return_code: "FAIL", return_msg: "签名失败" };
        }
        // 金额校验
        // if(order.price*100 != data.total_fee){ // 订单金额与微信返回金额不符
        //     return {return_code:"FAIL",return_msg:"订单金额与微信返回金额不符"};
        // }

        //  更新用户次数
        let timesRes;
        let statusRes;
        if (order.userType === Role.PERSON) {
            timesRes = PersonDao.updateSignatureNumber(order.targetId, { $inc: { signatureNumber: order.increment } });
        } else {
            timesRes = CompanyDao.updateSignatureNumber(order.targetId, { $inc: { signatureNumber: order.increment } });
        }

        if (!timesRes) { // 次数添加失败
            Logger.error(`充值回调 更新用户次数失败 `);
            // 更新订单信息
            statusRes = OrderDao.updateSpecifiedFieldByCode(code, {
                payAt: new Date(parseInt(data.time_end)),
                status: ConstantCode.ORDER.STATUS.PAID,
                wechatCode: data.transaction_id
            });
        } else {
            // 更新订单信息
            statusRes = OrderDao.updateSpecifiedFieldByCode(code, {
                payAt: new Date(parseInt(data.time_end)),
                status: ConstantCode.ORDER.STATUS.FINISH,
                wechatCode: data.transaction_id
            });
        }
        // TODO 更新表失败
        if (!statusRes) {
            Logger.error(`充值回调 更新订单失败 `);
        }
        return { return_code: "SUCCESS", return_msg: "OK" };
    },
    restOptions: {
        url: "/order.callback",
        getArgsFromRequest(req) {
            let xml = "";
            req.on('data', function(chunk) {
                xml += chunk;
            });
            const parse = function(cb) {
                req.on('end', function() {
                    xml2js.parseString(xml, {
                        explicitArray: false
                    }, cb)
                })
            }
            const parseData = Meteor.wrapAsync(parse);
            let json = parseData();
            let data = json.xml;
            return [data];
        },
    },
});
