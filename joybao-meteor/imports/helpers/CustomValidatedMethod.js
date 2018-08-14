import { ValidatedMethod } from "meteor/mdg:validated-method";
// import { HandleExceptionHelper } from './HandleExceptionHelper';
import Logger from "./Logger";

/**
 *  自定义ValidatedMethod
 */
export default class CustomValidatedMethod extends ValidatedMethod {
    /**
     *  重写 ValidatedMethod._execute (为了处理异常的捕获)
     */
    _execute(methodInvocation, args) {
        let rn;
        try {
            rn = super._execute(methodInvocation, args);
        } catch (e) {
            // HandleExceptionHelper.process(e);
            Logger.log(e);
            rn = {
                success: false,
                msg: e.reason
            };
        }
        return rn;
    }
}
