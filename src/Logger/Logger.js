"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Config_1 = require("../Config/Config");
class Logger {
    static info(msg) {
        if (Config_1.Config.Logging)
            console.info(msg);
    }
    static obj(obj) {
        if (Config_1.Config.Logging)
            console.log(obj);
    }
}
exports.Logger = Logger;
//# sourceMappingURL=Logger.js.map