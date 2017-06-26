import { Config } from "../Config/Config";

export class CommandManager {

    public cmd: string[];

    constructor() {

        this.cmd = [
            "!register",
            "!remove",
            "!list"
        ];

        if (Config.Debugging) {

            this.cmd = this.cmd.concat([
                "!tg",
                "!tpg"
            ]);
        }
    }
}
