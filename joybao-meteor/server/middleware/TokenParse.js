import { JsonRoutes } from "meteor/simple:json-routes";

function parseHeaders(req) {
    if (req.headers && req.headers.authorization) {
        const parts = req.headers.authorization.split(" ");

        if (parts.length === 2) {
            const scheme = parts[0];
            const credentials = parts[1];

            if (/^Bearer$/i.test(scheme)) {
                return credentials;
            }
        }
    }
    return undefined;
}

function parseQuery(req) {
    if (req.query && req.query.access_token) {
        return req.query.access_token;
    }
    return undefined;
}

JsonRoutes.Middleware.parseBearerToken = (req, res, next) => {
    req.authToken = parseHeaders(req) || parseQuery(req);
    next();
};
