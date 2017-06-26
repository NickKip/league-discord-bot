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
const Config_1 = require("../Config/Config");
const GameLogic_1 = require("../Bot/GameLogic");
const Riot_1 = require("../Riot/Riot");
class DebuggingHelpers {
    // === Constructor === //
    constructor() {
        // === Private Properties === //
        // Summoner Id
        this.summonerId = Config_1.Config.SummonerId;
        // Summoner Name
        this.summonerName = Config_1.Config.SummonerName;
        // Riot Account Id
        this.accountId = Config_1.Config.AccountId;
        this.gameLogic = new GameLogic_1.GameLogic();
        this.riot = new Riot_1.Riot();
    }
    // === Private Methods === //
    constructFakeGame() {
        return __awaiter(this, void 0, void 0, function* () {
            const matchList = yield this.riot.getMatchesByAccount(this.accountId);
            if (matchList.matches.length > 0) {
                const lastMatch = matchList.matches[0];
                const fakeSummoner = {
                    name: this.summonerName,
                    id: this.summonerId,
                    champion: yield this.gameLogic.getChampionById(lastMatch.champion),
                    team: 0,
                    champScore: 0,
                    champPerf: "NA",
                    rank: "",
                    wins: 0,
                    losses: 0,
                    isRegisteredUser: true
                };
                const fakeGame = {
                    gameId: lastMatch.gameId,
                    gameTypeId: lastMatch.queue,
                    winChance: "Fake",
                    summoners: [fakeSummoner],
                    isFinished: true
                };
                return fakeGame;
            }
            else {
                return null;
            }
        });
    }
    // === Public Methods === //
    testProcessGame() {
        return __awaiter(this, void 0, void 0, function* () {
            const lastGame = yield this.constructFakeGame();
            return yield this.gameLogic.processFinishedGame(lastGame);
        });
    }
}
exports.DebuggingHelpers = DebuggingHelpers;
//# sourceMappingURL=DebuggingHelpers.js.map