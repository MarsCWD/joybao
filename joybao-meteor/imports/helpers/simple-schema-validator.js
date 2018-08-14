import { ValidationError } from "meteor/mdg:validation-error";

export default (schema, options = { clean: true }) => obj => {
    if (options.clean !== false) {
        const ans = schema;
        ans.isActive = undefined; // 移除可能通过请求发送而来的isActive字段
        schema.clean(obj);
    }

    const context = options.context ? schema.namedContext(options.context) : schema.newContext();
    const isValid = context.validate(obj);
    if (isValid) {
        return;
    }

    const errors = context.invalidKeys().map(error => ({
        name: error.name,
        type: error.type,
        details: {
            value: context.keyErrorMessage(error.name)
        }
    }));
    throw new ValidationError(errors, errors[0].details.value);
};
