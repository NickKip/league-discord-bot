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
        this.bot.on("message", (msg) => {
            if (msg.author.username !== this.bot.user.username)
                this.onMessage(msg);
        });
        this.bot.on("presenceUpdate", (oldMember, newMember) => {
            this.onPresenceUpdate(oldMember, newMember);
        });
    }
    /**
     * An event that is fired every time the bot receives a message
     *
     * @param msg - Discord.Message
     */
    onMessage(msg) {
        if (msg.channel.type === "dm") {
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
                    case "!remove":
                        this.removeSubscription(msg);
                        break;
                    case "!list":
                        this.listSubscriptions(msg);
                        break;
                    case "!testgame":
                        this.getCurrentGame(0, "", msg.author);
                        break;
                }
            }
            else
                msg.channel.sendMessage(`You can't talk to me, try issuing one of these commands: ${Formatter_1.Formatter.CommandFormatter(Commands_1.Commands.Cmd)}`);
        }
    }
    /**
     * This event is triggered whenever a user in the guild changes presence
     *
     * @param o - the previous Discord presence of the user
     * @param n - the updated Discord presence of the user
     */
    onPresenceUpdate(o, n) {
        if (n.presence && n.presence.game) {
            if (n.presence.game.name === Config_1.Config.LeagueGameName) {
                let sub = this.subscriptions.get(n.user.username);
                if (sub)
                    this.getCurrentGame(sub.summonerId, sub.summonerName, n.user);
            }
        }
    }
    /**
     * Registers your interest in subscribing to a users game
     *
     * @param msg - the originating Discord message
     */
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
            return;
        });
    }
    /**
     * Gets information about the current game and sends this back as a chat message
     *
     * @param summonerId
     * @param summonerName
     * @param user
     */
    getCurrentGame(summonerId, summonerName, user) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.champions === undefined)
                this.champions = yield this.riotApi.getChampions();
            let game = yield this.riotApi.isInGame(summonerId);
            let teamId = 100;
            if (game) {
                let page = yield this.gameApi.get(summonerName);
                let summonersInGame = game.participants.map((el) => {
                    if (el.summonerId === summonerId)
                        teamId = el.teamId;
                    return {
                        name: el.summonerName,
                        id: el.summonerId,
                        champion: this.champions[el.championId],
                        team: el.teamId,
                        champScore: parseInt(page.querySelector(`div[data-summoner-id="${el.summonerId}"] .skillscore`).innerHTML.replace(",", "")),
                        champPerf: page.querySelector(`div[data-summoner-id="${el.summonerId}"] .stats .stat`).innerHTML
                    };
                });
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
    removeSubscription(msg) {
        let discordUser = msg.author.username;
        this.subscriptions.delete(discordUser);
        msg.author.sendMessage(`You have been removed from the subscription and will no longer get updates. Add yourself back with \`!register your-summoner-name\`.`);
    }
    listSubscriptions(msg) {
        if (this.subscriptions.size > 0)
            msg.author.sendMessage(Formatter_1.Formatter.ListSubscriptions(this.subscriptions));
        else
            msg.author.sendMessage(`${this.bot.user.username} does not have any subscriptions yet. :( Be the first with \`!register your-summoner-name\`!`);
    }
    /**
     * Connects the bot to Discord
     */
    connect() {
        this.bot.login(Config_1.Config.Token);
    }
}
exports.LeagueBot = LeagueBot;
//# sourceMappingURL=LeagueBot.js.map