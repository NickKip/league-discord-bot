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
const Config_1 = require("../Config/Config");
class Riot {
    constructor() {
        this.apiKey = `?api_key=${Config_1.Config.RiotApiKey}`;
        this.champions = "https://euw1.api.riotgames.com/lol/static-data/v3/champions";
        this.summonerV3 = "https://euw1.api.riotgames.com/lol/summoner/v3/summoners/by-name/";
        this.spectatorV3 = "https://euw1.api.riotgames.com/lol/spectator/v3/active-games/by-summoner/";
        this.key = Config_1.Config.RiotApiKey;
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
                        resolve(JSON.parse(body));
                    }
                });
            });
        });
    }
    getChampions() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let champions = yield this.httpRequest(this.champions + this.apiKey);
                let map = {};
                for (let c in champions.data) {
                    map[champions.data[c].id] = champions.data[c].name;
                }
                return map;
            }
            catch (ex) {
                return undefined;
            }
        });
    }
    getSummonerId(summonerName) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let summoner = yield this.httpRequest(this.summonerV3 + summonerName + this.apiKey);
                return summoner.id;
            }
            catch (ex) {
                return undefined;
            }
        });
    }
    isInGame(summonerId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let game = yield this.httpRequest(this.spectatorV3 + summonerId + this.apiKey);
                return game;
            }
            catch (ex) {
                return undefined;
            }
        });
    }
}
exports.Riot = Riot;
//# sourceMappingURL=Riot.js.map