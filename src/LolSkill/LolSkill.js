"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const Request = require("request");
const jsdom_1 = require("jsdom");
// tslint:disable no-any
class LolSkill {
    constructor() {
        this.uri = "http://www.lolskill.net/game/EUW/";
    }
    httpRequest(uri) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                Request(uri, (err, res, body) => {
                    if (err)
                        reject(err);
                    else if (res && res.statusCode !== 200)
                        reject(err);
                    else {
                        const dom = new jsdom_1.JSDOM(body);
                        resolve(dom);
                    }
                });
            });
        });
    }
    get(summonerName) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const res = yield this.httpRequest(this.uri + summonerName);
                return res.window.document;
            }
            catch (ex) {
                return undefined;
            }
        });
    }
}
exports.LolSkill = LolSkill;
//# sourceMappingURL=LolSkill.js.map