import { JsonRoutes } from "meteor/simple:json-routes";

// 从Request解析获得Token
import "./TokenParse";

// 根据获得的Token得到解析获得对应的值
import "./Auth";

JsonRoutes.Middleware.use("/", JsonRoutes.Middleware.parseBearerToken);
JsonRoutes.Middleware.use("/", JsonRoutes.Middleware.authenticateMeteorUserByToken);
// JsonRoutes.ErrorMiddleware.use("/", RestMiddleware.handleErrorAsJson);
JsonRoutes.ErrorMiddleware.use("/", RestMiddleware.handlerErrorAsJson);
