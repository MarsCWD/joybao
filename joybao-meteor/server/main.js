/*!
 * 服务端主入口，加载顺序：
 * middleware - 中间件加载
 * http - 外部访问依赖
 * api - 服务端提供的接口，
 * 客户端包括小程序，App（依赖于method或publish）
 * 更新人： yifeng.shen
 * 更新时间：2017-04-23
 */

import "../imports/http";
import "../imports/startup/server";

/** Job初始化 */
import "../imports/job/index";
