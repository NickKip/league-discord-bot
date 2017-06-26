import { ChampionMap, SpectatorV3, LeagueV2, MatchDto } from "../_types/Riot";
import { LeagueGame, SummonersInGame } from "../_types/LeagueGame";
import { LolSkill } from "../LolSkill/LolSkill";
import { Riot } from "../Riot/Riot";
import { Logger } from "../Logger/Logger";

export class GameLogic {

    // === Private Properties === //

    // The Riot API which handles getting data from Riot
    private riotApi: Riot;

    // The LolSkill API which handles getting data from LolSkill
    private gameApi: LolSkill;

    // A map of champions returned from Riot API
    private champions: ChampionMap;

    // === Constructor === //

    constructor() {

        this.riotApi = new Riot();
        this.gameApi = new LolSkill();
    }

    // === Public Methods === //

    public async getChampionById(id: number): Promise<string> {

        if (this.champions === undefined) this.champions = await this.riotApi.getChampions();

        return this.champions[id];
    }

    public async getSummonerId(summoner: string): Promise<number> {

        return await this.riotApi.getSummonerId(summoner);
    }

    public async getCurrentGame(summonerId: number, summonerName: string): Promise<LeagueGame> {

        if (this.champions === undefined) this.champions = await this.riotApi.getChampions();

        const game: SpectatorV3 = await this.riotApi.isInGame(summonerId);
        let teamId: number = 100;

        if (game) {

            const page: Document = await this.gameApi.get(summonerName);
            const summIds: number[] = [];

            const summonersInGame: SummonersInGame[] = game.participants.map(el => {

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
                    losses: 0,
                    isRegisteredUser: el.summonerId === summonerId
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

            summonersInGame.sort((a, b) => b.champScore - a.champScore);

            const leagueGame: LeagueGame = {

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
    }

    public async processFinishedGame(game: LeagueGame): Promise<MatchDto> {

        const match: MatchDto = await this.riotApi.getMatchById(game.gameId);

        if (match) {

            Logger.info(`Found match: ${game.gameId}`);

            return match;
        }
        else {

            return null;
        }
    }
}
