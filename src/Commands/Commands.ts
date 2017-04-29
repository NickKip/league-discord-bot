import * as Discord from "discord.js";
import { Formatter } from "../Formatter/Formatter";

export class Commands {
    static Cmd: Array<string> = [
        "!register",
        "!remove",
        "!testgame"
    ];

    static RegisterArgs: Map<string, string[]> = new Map([
        ["register", ["username"]]
    ]);
}