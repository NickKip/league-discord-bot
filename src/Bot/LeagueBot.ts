import * as Discord from "discord.js";
import { ChampionMap } from "../_types/Riot";
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
            if(msg.author.username !== this.bot.user.username) this.onMessage(msg);
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
        console.log(`Author: ${msg.author.username}, ${msg.content}`);

        let cmd = null;

        for(let c of Commands.Cmd) {
            if(msg.content.indexOf(c) > -1) {
                cmd = c;
                break;
            }
        }

        if(cmd) {
            switch(cmd) {
                case "!register":
                    this.registerUser(msg);
                    break;
                case "!testgame": 
                    this.getCurrentGame(33088517, "NHONHA ChikCen", msg.author);
                    break;
            }
        }
        else
            msg.channel.sendMessage(`You can't talk to me, try issuing one of these commands: ${Formatter.CommandFormatter(Commands.Cmd)}`);
    }

    /**
     * This event is triggered whenever a user in the guild changes presence
     * 
     * @param o - the previous Discord presence of the user
     * @param n - the updated Discord presence of the user
     */
    private onPresenceUpdate(o: Discord.GuildMember, n: Discord.GuildMember): void {
        if(n.presence && n.presence.game) {
            if(n.presence.game.name === Config.LeagueGameName) {
                let sub = this.subscriptions.get(n.user.username);

                if(sub)
                    this.getCurrentGame(sub.summonerId, sub.summonerName, n.user);
            }
        } 
    }

    /**
     * Registers your interest in subscribing to a users game
     * 
     * @param msg - the originating Discord message
     */
    private async registerUser(msg: Discord.Message): Promise<{}> {
        let summoner = msg.content.split("!register ")[1];
        let discordUser = msg.author.username;

        if(!summoner) {
            msg.channel.sendMessage(`You haven't provided a summoner name, please try: \`!register your-summoner-name\``);
        }
        else {
            if(this.games.get(summoner) === undefined) this.games.set(summoner, []);

            if(this.subscriptions.get(discordUser) === undefined) {
                let summonerId = await this.riotApi.getSummonerId(summoner);
                Logger.info(`Summoner: ${summoner}, ${summonerId}`);

                if(summonerId) {
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
    }
    /**
     * Gets information about the current game and sends this back as a chat message
     * 
     * @param summonerId
     * @param summonerName
     * @param user
     */
    private async getCurrentGame(summonerId: number, summonerName: string, user: Discord.User): Promise<{}> {
        if(this.champions === undefined)
            this.champions = await this.riotApi.getChampions();

        let game = await this.riotApi.isInGame(summonerId);
        let teamId = 100;

        if(game) {
            let page = await this.gameApi.get(summonerName);

            let summonersInGame: SummonersInGame[] = game.participants.map((el) => {
                if(el.summonerId === summonerId)
                    teamId = el.teamId;

                return {
                    name: el.summonerName,
                    id: el.summonerId,
                    champion: this.champions[el.championId],
                    team: el.teamId,
                    champScore: parseInt(page.querySelector(`div[data-summoner-id="${s.id}"] .skillscore`).innerHTML.replace(",", "")),
                    champPerf: page.querySelector(`div[data-summoner-id="${s.id}"] .stats .stat`).innerHTML
                }
            });

            summonersInGame.sort((a, b) => {
                return b.champScore - a.champScore;
            });

            let leagueGame: LeagueGame = {
                winChance: page.querySelector(`div.team-${teamId} .winchance .tooltip`).innerHTML,
                summoners: summonersInGame
            }

            user.sendMessage(Formatter.GameResponse(leagueGame, summonerId));
        }
        else 
            user.sendMessage(`${summonerName} is not in a game right now!`);

        return;
    }

    /**
     * Connects the bot to Discord
     */
    connect(): void {
        this.bot.login(Config.Token);
    }
}