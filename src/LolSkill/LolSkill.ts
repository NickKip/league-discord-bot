import * as Request from "request";
import { JSDOM } from "jsdom";

// tslint:disable no-any

export class LolSkill {
    private uri: string = "http://www.lolskill.net/game/EUW/";

    constructor() {}

    private async httpRequest(uri: string): Promise<any> {
        return new Promise<Document>((resolve, reject) => {
            Request(uri, (err, res, body) => {
                if (err) reject(err);
                else if (res && res.statusCode !== 200) reject(err);
                else {
                    const dom: Document = new JSDOM(body);
                    resolve(dom);
                }
            });
        });
    }

    async get(summonerName: string): Promise<any> {
        try {
            const res: any = await this.httpRequest(this.uri + summonerName);
            return res.window.document;
        }
        catch (ex) {
            return undefined;
        }
    }
}
