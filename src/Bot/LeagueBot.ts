import * as Discord from "discord.js";
import { ChampionMap, LeagueV2, SpectatorV3, MatchDto } from "../_types/Riot";
import { CommandManager } from "../Commands/Commands";
import { Config } from "../Config/Config";
import { Formatter } from "../Formatter/Formatter";
import { Logger } from "../Logger/Logger";
import { LeagueGame, SummonersInGame, LeagueStats } from "../_types/LeagueGame";
import { LolSkill } from "../LolSkill/LolSkill";
import { Riot } from "../Riot/Riot";
import { Subscription } from "../_types/Subscription";
import { GameLogic } from "./GameLogic";
import { DebuggingHelpers } from "../Commands/DebuggingHelpers";

export class LeagueBot {

    // === Private Properties === //

    // Our Discord Bot Client
    private bot: Discord.Client;

    // A map which stores the games being played
    private games: Map<string, LeagueStats>;

    // A map that contains all of the current subscriptions
    private subscriptions: Map<string, Subscription>;

    // The GameLogic class
    private gameLogic: GameLogic;

    // The command manager
    private commandMgr: CommandManager;

    // Debugging helpers - makes debugging quicker and easier
    private deuggingHelpers: DebuggingHelpers;

    // === Constructor === //

    constructor() {
        this.bot = new Discord.Client();
        this.commandMgr = new CommandManager();
        this.games = new Map();
        this.subscriptions = new Map();
        this.gameLogic = new GameLogic();

        if (Config.Debugging) {

            this.deuggingHelpers = new DebuggingHelpers();
        }

        this.bot.on("message", (msg: Discord.Message) => { 
            if (msg.author.username !== this.bot.user.username) this.onMessage(msg);
        });

        this.bot.on("presenceUpdate", (oldMember: Discord.GuildMember, newMember: Discord.GuildMember) => { 
            this.onPresenceUpdate(oldMember, newMember); 
        });
    }

    // === Private Methods === //

    /**
     * An event that is fired every time the bot receives a message
     * 
     * @param msg - Discord.Message
     */
    private async onMessage(msg: Discord.Message): Promise<void> {
        if (msg.channel.type === "dm") {
            Logger.info(`Author: ${msg.author.username}, ${msg.content}`);

            const cmd: string = msg.content.split(" ")[0];

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
                        const [ command, summId, summName ] = msg.content.split(" ");
                        this.getCurrentGame({ summonerId: parseInt(summId), summonerName: summName }, msg.author);
                        break;

                    case "!tpg":
                        const match: MatchDto = await this.deuggingHelpers.testProcessGame();
                        msg.author.sendMessage(match ? `Match info found for match: \`${match.gameId}\`.` : `Cannot find match.`);
                        break;
                }
            }
            else msg.channel.sendMessage(`You can't talk to me, try issuing one of these commands: ${Formatter.CommandFormatter(this.commandMgr.cmd)}`);
        }
    }

    /**
     * This event is triggered whenever a user in the guild changes presence
     * 
     * @param o - the previous Discord presence of the user
     * @param n - the updated Discord presence of the user
     */
    private onPresenceUpdate(o: Discord.GuildMember, n: Discord.GuildMember): void {
        if (n.presence && n.presence.game) {

            const sub: Subscription = this.subscriptions.get(n.user.username);

            if (sub && n.presence.game.name === Config.LeagueGameName) {

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
    private async registerUser(msg: Discord.Message): Promise<void> {

        const summoner: string = msg.content.split("!register ")[1];
        const discordUser: string = msg.author.username;

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

                const summonerId: number = await this.gameLogic.getSummonerId(summoner);
                Logger.info(`Summoner: ${summoner}, ${summonerId}`);

                if (summonerId) {

                    this.subscriptions.set(discordUser, {
                        summonerId: summonerId,
                        summonerName: summoner
                    });

                    msg.channel.sendMessage(`Summoner: \`${summoner}\` has been successfully registered. You will now receive updates on their live games!`);
                }
                else msg.channel.sendMessage(`Summoner: \`${summoner}\` has not been found. Please try again.`);
            }
            else msg.channel.sendMessage(`You are already subscribed to summoner: \`${summoner}\`! Please remove this subscription first.`);
        }
    }
    /**
     * Gets information about the current game and sends this back as a chat message
     * 
     * @param summonerId
     * @param summonerName
     * @param user
     */
    private async getCurrentGame(sub: Subscription, user: Discord.User): Promise<void> {

        const game: LeagueGame = await this.gameLogic.getCurrentGame(sub.summonerId, sub.summonerName);

        if (game) {

            this._addGame(sub.summonerName, game);

            user.sendMessage(Formatter.GameResponse(game));
        }
        else user.sendMessage(`${sub.summonerName} is not in a game right now!`);
    }

    private processFinishedGame(sub: Subscription): void {

        const stats: LeagueStats = this.games.get(sub.summonerName);
        const lastGame: LeagueGame = stats.games.find(x => x.gameId === stats.lastGameId);

        if (lastGame && this._isRankedGame(lastGame)) {

            lastGame.isFinished = true;
            Logger.info(`Game: ${lastGame.gameId} has finished.`);

            // TODO: Get some stats on last game for the current player
        }
        else {

            Logger.info(`Last game was not a game we care about, game id was: ${lastGame.gameTypeId}`);
        }
    }

    // === Private Helper Methods === //

    private _addGame(summonerName: string, game: LeagueGame): void {

        const stats: LeagueStats = this.games.get(summonerName);
        stats.lastGameId = game.gameId;

        stats.games = [
            game,
            ...stats.games
        ];

        this.games.set(summonerName, stats);
    }

    private _isRankedGame(game: LeagueGame): boolean {

        return Config.GameTypeIds.includes(game.gameTypeId);
    }

    // === Public Methods === //

    removeSubscription(msg: Discord.Message): void {

        const discordUser: string = msg.author.username;
        this.subscriptions.delete(discordUser);
        msg.author.sendMessage(`You have been removed from the subscription and will no longer get updates. Add yourself back with \`!register your-summoner-name\`.`);
    }

    listSubscriptions(msg: Discord.Message): void {

        if (this.subscriptions.size > 0) msg.author.sendMessage(Formatter.ListSubscriptions(this.subscriptions));
        else msg.author.sendMessage(`${this.bot.user.username} does not have any subscriptions yet. 😢 Be the first with \`!register your-summoner-name\`!`);
    }

    /**
     * Connects the bot to Discord
     */
    connect(): void {

        this.bot.login(Config.Token);
    }
}
