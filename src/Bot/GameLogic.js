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
const LolSkill_1 = require("../LolSkill/LolSkill");
const Riot_1 = require("../Riot/Riot");
const Logger_1 = require("../Logger/Logger");
class GameLogic {
    // === Constructor === //
    constructor() {
        this.riotApi = new Riot_1.Riot();
        this.gameApi = new LolSkill_1.LolSkill();
    }
    // === Public Methods === //
    getChampionById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.champions === undefined)
                this.champions = yield this.riotApi.getChampions();
            return this.champions[id];
        });
    }
    getSummonerId(summoner) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.riotApi.getSummonerId(summoner);
        });
    }
    getCurrentGame(summonerId, summonerName) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.champions === undefined)
                this.champions = yield this.riotApi.getChampions();
            const game = yield this.riotApi.isInGame(summonerId);
            let teamId = 100;
            if (game) {
                const page = yield this.gameApi.get(summonerName);
                const summIds = [];
                const summonersInGame = game.participants.map(el => {
                    if (el.summonerId === summonerId)
                        teamId = el.teamId;
                    summIds.push(el.summonerId);
                    return {
                        name: el.summonerName,
                        id: el.summonerId,
                        champion: this.champions[el.championId],
                        team: el.teamId,
                        champScore: parseInt(page.querySelector(`div[data-summoner-id="${el.summonerId}"] .skillscore`).innerHTML.replace(",", "")),
                        champPerf: page.querySelector(`div[data-summoner-id="${el.summonerId}"] .stats .stat`).innerHTML,
                        rank: "",
                        wins: 0,
                        losses: 0,
                        isRegisteredUser: el.summonerId === summonerId
                    };
                });
                const league = yield this.riotApi.getRankedInfo(summIds);
                for (const s of summonersInGame) {
                    if (league[s.id] !== undefined) {
                        s.rank = `${league[s.id][0].tier} ${league[s.id][0].entries[0].division}`;
                        s.wins = league[s.id][0].entries[0].wins;
                        s.losses = league[s.id][0].entries[0].losses;
                    }
                }
                summonersInGame.sort((a, b) => b.champScore - a.champScore);
                const leagueGame = {
                    gameId: game.gameId,
                    gameTypeId: game.gameQueueConfigId,
                    winChance: page.querySelector(`div.team-${teamId} .winchance .tooltip`).innerHTML,
                    summoners: summonersInGame,
                    isFinished: false
                };
                return leagueGame;
            }
            else {
                return null;
            }
        });
    }
    processFinishedGame(game) {
        return __awaiter(this, void 0, void 0, function* () {
            const match = yield this.riotApi.getMatchById(game.gameId);
            if (match) {
                Logger_1.Logger.info(`Found match: ${game.gameId}`);
                return match;
            }
            else {
                return null;
            }
        });
    }
}
exports.GameLogic = GameLogic;
//# sourceMappingURL=GameLogic.js.map