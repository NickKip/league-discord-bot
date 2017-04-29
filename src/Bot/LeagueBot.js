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
const Discord = require("discord.js");
const Commands_1 = require("../Commands/Commands");
const Config_1 = require("../Config/Config");
const Formatter_1 = require("../Formatter/Formatter");
const Logger_1 = require("../Logger/Logger");
const LolSkill_1 = require("../LolSkill/LolSkill");
const Riot_1 = require("../Riot/Riot");
class LeagueBot {
    constructor() {
        this.bot = new Discord.Client();
        this.games = new Map();
        this.subscriptions = new Map();
        this.riotApi = new Riot_1.Riot();
        this.gameApi = new LolSkill_1.LolSkill();
        this.bot.on("ready", () => { this.onConnect(); });
        this.bot.on("message", (msg) => {
            if (msg.author.username !== this.bot.user.username)
                this.onMessage(msg);
        });
        this.bot.on("presenceUpdate", (oldMember, newMember) => {
            this.onPresenceUpdate(oldMember, newMember);
        });
    }
    onConnect() {
        console.log(`${Config_1.Config.BotName} ready to go!`);
    }
    onMessage(msg) {
        console.log(`Author: ${msg.author.username}, ${msg.content}`);
        let cmd = null;
        for (let c of Commands_1.Commands.Cmd) {
            if (msg.content.indexOf(c) > -1) {
                cmd = c;
                break;
            }
        }
        if (cmd) {
            switch (cmd) {
                case "!register":
                    this.registerUser(msg);
                    break;
                case "!testgame":
                    this.getCurrentGame(33088517, "NHONHA ChikCen", msg.author);
                    break;
            }
        }
        else
            msg.channel.sendMessage(`You can't talk to me, try issuing one of these commands: ${Formatter_1.Formatter.CommandFormatter(Commands_1.Commands.Cmd)}`);
    }
    onPresenceUpdate(o, n) {
        if (n.presence && n.presence.game) {
            if (n.presence.game.name === Config_1.Config.LeagueGameName) {
                let discordUser = n.user.username;
                let sub = this.subscriptions.get(discordUser);
                if (sub) {
                    this.getCurrentGame(sub.summonerId, sub.summonerName, n.user);
                }
            }
        }
    }
    registerUser(msg) {
        return __awaiter(this, void 0, void 0, function* () {
            let summoner = msg.content.split("!register ")[1];
            let discordUser = msg.author.username;
            if (!summoner) {
                msg.channel.sendMessage(`You haven't provided a summoner name, please try: \`!register your-summoner-name\``);
            }
            else {
                if (this.games.get(summoner) === undefined)
                    this.games.set(summoner, []);
                if (this.subscriptions.get(discordUser) === undefined) {
                    let summonerId = yield this.riotApi.getSummonerId(summoner);
                    Logger_1.Logger.info(`Summoner: ${summoner}, ${summonerId}`);
                    if (summonerId) {
                        this.subscriptions.set(discordUser, {
                            summonerId: summonerId,
                            summonerName: summoner
                        });
                        msg.channel.sendMessage(`Summoner: \`${summoner}\` has been successfully registered. You will now receive updates on their live games!`);
                    }
                    else
                        msg.channel.sendMessage(`Summoner: \`${summoner}\` has not been found. Please try again.`);
                }
                else
                    msg.channel.sendMessage(`You are already subscribed to summoner: \`${summoner}\`! Please remove this subscription first.`);
            }
            Logger_1.Logger.obj(this.subscriptions);
            Logger_1.Logger.obj(this.games);
            return;
        });
    }
    getCurrentGame(summonerId, summonerName, user) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.champions === undefined)
                this.champions = yield this.riotApi.getChampions();
            let game = yield this.riotApi.isInGame(summonerId);
            let teamId = 100;
            if (game) {
                let summonersInGame = game.participants.map((el) => {
                    if (el.summonerId === summonerId)
                        teamId = el.teamId;
                    return {
                        name: el.summonerName,
                        id: el.summonerId,
                        champion: this.champions[el.championId],
                        team: el.teamId,
                        champScore: 0,
                        champPerf: ''
                    };
                });
                let page = yield this.gameApi.get(summonerName);
                for (let s of summonersInGame) {
                    s.champScore = parseInt(page.querySelector(`div[data-summoner-id="${s.id}"] .skillscore`).innerHTML.replace(",", ""));
                    s.champPerf = page.querySelector(`div[data-summoner-id="${s.id}"] .stats .stat`).innerHTML;
                }
                summonersInGame.sort((a, b) => {
                    return b.champScore - a.champScore;
                });
                let leagueGame = {
                    winChance: page.querySelector(`div.team-${teamId} .winchance .tooltip`).innerHTML,
                    summoners: summonersInGame
                };
                user.sendMessage(Formatter_1.Formatter.GameResponse(leagueGame, summonerId));
            }
            else
                user.sendMessage(`${summonerName} is not in a game right now!`);
            return;
        });
    }
    connect() {
        this.bot.login(Config_1.Config.Token);
    }
}
exports.LeagueBot = LeagueBot;
//# sourceMappingURL=LeagueBot.js.map