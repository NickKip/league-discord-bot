import { Config } from "../Config/Config";

// tslint:disable no-console

export class Logger {
    static info(msg: string): void {
        if (Config.Debugging) console.info(msg);
    }

    static obj(obj: Object): void {
        if (Config.Debugging) console.log(obj);
    }
}
