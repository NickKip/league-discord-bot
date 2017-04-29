import { Config } from "../Config/Config";

export class Logger {
    static info(msg: string): void {
        if (Config.Logging) console.info(msg)
    }

    static obj(obj: Object): void {
        if (Config.Logging) console.log(obj);
    }
}