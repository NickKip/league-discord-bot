"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Config_1 = require("../Config/Config");
class CommandManager {
    constructor() {
        this.cmd = [
            "!register",
            "!remove",
            "!list"
        ];
        if (Config_1.Config.Debugging) {
            this.cmd = this.cmd.concat([
                "!tg",
                "!tpg"
            ]);
        }
    }
}
exports.CommandManager = CommandManager;
//# sourceMappingURL=Commands.js.map