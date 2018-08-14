/** 日志类 **/
// const path = require("path");

const debug = true;

// const stackInfo = () => {
//     const stackReg = /at\s+(.*)\s+\((.*):(\d*):(\d*)\)/i,
//         stackReg2 = /at\s+()(.*):(\d*):(\d*)/i;
//
//     const stackList = (new Error()).stack.split("\n").slice(3);
//     const s = stackList[0];
//     const sp = stackReg.exec(s) || stackReg2.exec(s);
//     const data = {};
//     if (sp && sp.length === 5) {
//         data.method = sp[1];
//         data.path = sp[2];
//         data.line = sp[3];
//         data.pos = sp[4];
//         data.file = path.basename(data.path);
//     }
//     return data;
// };

class Logger {

    static base(msg, where) {
        // const info = stackInfo();
        // const output = `${info.file}:${info.line} (${info.method})`;
        // return `${(new Date()).toLocaleTimeString()} ${output}`;
        return where ? `${where}: ${msg} date:${(new Date()).toLocaleTimeString()}` : `${msg} date:${(new Date()).toLocaleTimeString()}`;
    }

    static info(msg, where, ...args) {
        console.info(Logger.base(msg, where), ...args);
    }

    static log(msg, where, ...args) {
        console.log(Logger.base(msg, where), ...args);
    }

    static debug(msg, where, ...args) {
        if (debug) {
            console.info(Logger.base(msg, where), ...args);
        }
    }

    static error(msg, where, ...args) {
        console.error(Logger.base(msg, where), ...args);
    }
}

export default Logger;
