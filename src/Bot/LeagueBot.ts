import * as Discord from "discord.js";
import { ChampionMap, LeagueV2, SpectatorV3 } from "../_types/Riot";
import { Commands } from "../Commands/Commands";
import { Config } from "../Config/Config";
import { Formatter } from "../Formatter/Formatter";
import { Logger } from "../Logger/Logger";
import { LeagueGame, SummonersInGame } from "../_types/LeagueGame";
import { LolSkill } from "../LolSkill/LolSkill";
import { Riot } from "../Riot/Riot";
import { Subscription } from "../_types/Subscription";

export class LeagueBot {
    // Our Discord Bot Client
    private bot: Discord.Client;

    // A map which stores the games being played
    private games: Map<string, LeagueGame[]>;

    // A map that contains all of the current subscriptions
    private subscriptions: Map<string, Subscription>;

    // The Riot API which handles getting data from Riot
    private riotApi: Riot;

    // A map of champions returned from Riot API
    private champions: ChampionMap; 

    // The LolSkill API which handles getting data from LolSkill
    private gameApi: LolSkill;

    constructor() {
        this.bot = new Discord.Client();
        this.games = new Map();
        this.subscriptions = new Map();
        this.riotApi = new Riot();
        this.gameApi = new LolSkill();

        this.bot.on("message", (msg: Discord.Message) => { 
            if (msg.author.username !== this.bot.user.username) this.onMessage(msg);
        });

        this.bot.on("presenceUpdate", (oldMember: Discord.GuildMember, newMember: Discord.GuildMember) => { 
            this.onPresenceUpdate(oldMember, newMember); 
        });
    }

    /**
     * An event that is fired every time the bot receives a message
     * 
     * @param msg - Discord.Message
     */
    private onMessage(msg: Discord.Message): void {
        if (msg.channel.type === "dm") {
            Logger.info(`Author: ${msg.author.username}, ${msg.content}`);

            let cmd: Commands = null;

            for (const c of Commands.Cmd) {
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
                        const [ command, summId, summName ] = msg.content.split(" ");
                        this.getCurrentGame(parseInt(summId), summName, msg.author);
                        break;
                }
            }
            else msg.channel.sendMessage(`You can't talk to me, try issuing one of these commands: ${Formatter.CommandFormatter(Commands.Cmd)}`);
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
            if (n.presence.game.name === Config.LeagueGameName) {
                const sub: Subscription = this.subscriptions.get(n.user.username);

                if (sub) this.getCurrentGame(sub.summonerId, sub.summonerName, n.user);
            }
        } 
    }

    /**
     * Registers your interest in subscribing to a summoners game
     * 
     * @param msg - the originating Discord message
     */
    private async registerUser(msg: Discord.Message): Promise<{}> {
        const summoner: string = msg.content.split("!register ")[1];
        const discordUser: string = msg.author.username;

        if (!summoner) {
            msg.channel.sendMessage(`You haven't provided a summoner name, please try: \`!register your-summoner-name\``);
        }
        else {
            if (this.games.get(summoner) === undefined) this.games.set(summoner, []);

            if (this.subscriptions.get(discordUser) === undefined) {
                const summonerId: number = await this.riotApi.getSummonerId(summoner);
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

        return;
    }
    /**
     * Gets information about the current game and sends this back as a chat message
     * 
     * @param summonerId
     * @param summonerName
     * @param user
     */
    private async getCurrentGame(summonerId: number, summonerName: string, user: Discord.User): Promise<{}> {
        if (this.champions === undefined) this.champions = await this.riotApi.getChampions();

        const game: SpectatorV3 = await this.riotApi.isInGame(summonerId);
        let teamId: number = 100;

        if (game) {
            const page: Document = await this.gameApi.get(summonerName);
            const summIds: number[] = [];

            const summonersInGame: SummonersInGame[] = game.participants.map((el) => {
                if (el.summonerId === summonerId) teamId = el.teamId;

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
                    losses: 0
                };
            });

            const league: LeagueV2 = await this.riotApi.getRankedInfo(summIds);

            for (const s of summonersInGame) {
                if (league[s.id] !== undefined) {
                    s.rank = `${league[s.id][0].tier} ${league[s.id][0].entries[0].division}`;
                    s.wins = league[s.id][0].entries[0].wins;
                    s.losses = league[s.id][0].entries[0].losses;
                }
            }

            summonersInGame.sort((a, b) => {
                return b.champScore - a.champScore;
            });

            const leagueGame: LeagueGame = {
                winChance: page.querySelector(`div.team-${teamId} .winchance .tooltip`).innerHTML,
                summoners: summonersInGame
            };

            user.sendMessage(Formatter.GameResponse(leagueGame, summonerId));
        }
        else user.sendMessage(`${summonerName} is not in a game right now!`);

        return;
    }

    removeSubscription(msg: Discord.Message): void {
        const discordUser: string = msg.author.username;
        this.subscriptions.delete(discordUser);
        msg.author.sendMessage(`You have been removed from the subscription and will no longer get updates. Add yourself back with \`!register your-summoner-name\`.`);
    }

    listSubscriptions(msg: Discord.Message): void {
        if (this.subscriptions.size > 0) msg.author.sendMessage(Formatter.ListSubscriptions(this.subscriptions));
        else msg.author.sendMessage(`${this.bot.user.username} does not have any subscriptions yet. :( Be the first with \`!register your-summoner-name\`!`);
    }

    /**
     * Connects the bot to Discord
     */
    connect(): void {
        this.bot.login(Config.Token);
    }
}
