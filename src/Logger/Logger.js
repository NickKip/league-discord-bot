"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Config_1 = require("../Config/Config");
// tslint:disable no-console
class Logger {
    static info(msg) {
        if (Config_1.Config.Debugging)
            console.info(msg);
    }
    static obj(obj) {
        if (Config_1.Config.Debugging)
            console.log(obj);
    }
}
exports.Logger = Logger;
//# sourceMappingURL=Logger.js.map