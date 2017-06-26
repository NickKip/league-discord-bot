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
const GameLogic_1 = require("./GameLogic");
const DebuggingHelpers_1 = require("../Commands/DebuggingHelpers");
class LeagueBot {
    // === Constructor === //
    constructor() {
        this.bot = new Discord.Client();
        this.commandMgr = new Commands_1.CommandManager();
        this.games = new Map();
        this.subscriptions = new Map();
        this.gameLogic = new GameLogic_1.GameLogic();
        if (Config_1.Config.Debugging) {
            this.deuggingHelpers = new DebuggingHelpers_1.DebuggingHelpers();
        }
        this.bot.on("message", (msg) => {
            if (msg.author.username !== this.bot.user.username)
                this.onMessage(msg);
        });
        this.bot.on("presenceUpdate", (oldMember, newMember) => {
            this.onPresenceUpdate(oldMember, newMember);
        });
    }
    // === Private Methods === //
    /**
     * An event that is fired every time the bot receives a message
     *
     * @param msg - Discord.Message
     */
    onMessage(msg) {
        return __awaiter(this, void 0, void 0, function* () {
            if (msg.channel.type === "dm") {
                Logger_1.Logger.info(`Author: ${msg.author.username}, ${msg.content}`);
                const cmd = msg.content.split(" ")[0];
                if (cmd && this.commandMgr.cmd.includes(cmd)) {
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
                        case "!tg":
                            const [command, summId, summName] = msg.content.split(" ");
                            this.getCurrentGame({ summonerId: parseInt(summId), summonerName: summName }, msg.author);
                            break;
                        case "!tpg":
                            const match = yield this.deuggingHelpers.testProcessGame();
                            msg.author.sendMessage(match ? `Match info found for match: \`${match.gameId}\`.` : `Cannot find match.`);
                            break;
                    }
                }
                else
                    msg.channel.sendMessage(`You can't talk to me, try issuing one of these commands: ${Formatter_1.Formatter.CommandFormatter(this.commandMgr.cmd)}`);
            }
        });
    }
    /**
     * This event is triggered whenever a user in the guild changes presence
     *
     * @param o - the previous Discord presence of the user
     * @param n - the updated Discord presence of the user
     */
    onPresenceUpdate(o, n) {
        if (n.presence && n.presence.game) {
            const sub = this.subscriptions.get(n.user.username);
            if (sub && n.presence.game.name === Config_1.Config.LeagueGameName) {
                // User has started a new game
                this.getCurrentGame(sub, n.user);
            }
            else if (sub) {
                // User finished game
                this.processFinishedGame(sub);
            }
        }
    }
    /**
     * Registers your interest in subscribing to a summoners game
     *
     * @param msg - the originating Discord message
     */
    registerUser(msg) {
        return __awaiter(this, void 0, void 0, function* () {
            const summoner = msg.content.split("!register ")[1];
            const discordUser = msg.author.username;
            if (!summoner) {
                msg.channel.sendMessage(`You haven't provided a summoner name, please try: \`!register your-summoner-name\``);
            }
            else {
                if (this.games.get(summoner) === undefined) {
                    this.games.set(summoner, {
                        lastGameId: null,
                        games: []
                    });
                }
                if (this.subscriptions.get(discordUser) === undefined) {
                    const summonerId = yield this.gameLogic.getSummonerId(summoner);
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
        });
    }
    /**
     * Gets information about the current game and sends this back as a chat message
     *
     * @param summonerId
     * @param summonerName
     * @param user
     */
    getCurrentGame(sub, user) {
        return __awaiter(this, void 0, void 0, function* () {
            const game = yield this.gameLogic.getCurrentGame(sub.summonerId, sub.summonerName);
            if (game) {
                this._addGame(sub.summonerName, game);
                user.sendMessage(Formatter_1.Formatter.GameResponse(game));
            }
            else
                user.sendMessage(`${sub.summonerName} is not in a game right now!`);
        });
    }
    processFinishedGame(sub) {
        const stats = this.games.get(sub.summonerName);
        const lastGame = stats.games.find(x => x.gameId === stats.lastGameId);
        if (lastGame && this._isRankedGame(lastGame)) {
            lastGame.isFinished = true;
            Logger_1.Logger.info(`Game: ${lastGame.gameId} has finished.`);
            // TODO: Get some stats on last game for the current player
        }
        else {
            Logger_1.Logger.info(`Last game was not a game we care about, game id was: ${lastGame.gameTypeId}`);
        }
    }
    // === Private Helper Methods === //
    _addGame(summonerName, game) {
        const stats = this.games.get(summonerName);
        stats.lastGameId = game.gameId;
        stats.games = [
            game,
            ...stats.games
        ];
        this.games.set(summonerName, stats);
    }
    _isRankedGame(game) {
        return Config_1.Config.GameTypeIds.includes(game.gameTypeId);
    }
    // === Public Methods === //
    removeSubscription(msg) {
        const discordUser = msg.author.username;
        this.subscriptions.delete(discordUser);
        msg.author.sendMessage(`You have been removed from the subscription and will no longer get updates. Add yourself back with \`!register your-summoner-name\`.`);
    }
    listSubscriptions(msg) {
        if (this.subscriptions.size > 0)
            msg.author.sendMessage(Formatter_1.Formatter.ListSubscriptions(this.subscriptions));
        else
            msg.author.sendMessage(`${this.bot.user.username} does not have any subscriptions yet. 😢 Be the first with \`!register your-summoner-name\`!`);
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