RestMiddleware.handlerErrorAsJson = (errObj, request, response) => { // jshint ignore:line
    // If we at least put in some effort to throw a user-facing Meteor.Error,
    // the default code should be less severe
    let err = errObj;
    if (err.sanitizedError && err.sanitizedError.errorType === "Meteor.Error") {
        if (!err.sanitizedError.statusCode) {
            err.sanitizedError.statusCode = err.statusCode || 400;
        }

        err = err.sanitizedError;
    } else if (err.errorType === "Meteor.Error") {
        if (!err.statusCode) {
            err.statusCode = 400;
        }
    } else {
        // Hide internal error details
        // XXX could check node_env here and return full
        // error details if development
        const statusCode = err.statusCode;
        err = new Error();
        err.statusCode = statusCode;
    }

    // If an error has a `data` property, we
    // send that. This allows packages to include
    // extra client-safe data with the errors they throw.
    let body = {
        success: false,
        message: err.reason
        // error: err.error || 'internal-server-error',
        // reason: err.reason || 'Internal server error',
        // details: err.details,
        // data: err.data,
    };

    body = JSON.stringify(body, null, 2);

    response.statusCode = err.statusCode || 500;
    response.setHeader("Content-Type", "application/json");
    response.write(body);
    response.end();
};
