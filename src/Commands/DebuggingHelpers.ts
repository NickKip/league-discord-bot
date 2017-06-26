import { Config } from "../Config/Config";
import { GameLogic } from "../Bot/GameLogic";
import { Riot } from "../Riot/Riot";
import { MatchList, MatchV3, MatchDto } from "../_types/Riot";
import { LeagueGame, SummonersInGame } from "../_types/LeagueGame";

export class DebuggingHelpers {

    // === Private Properties === //

    // Summoner Id
    private summonerId: number = Config.SummonerId;

    // Summoner Name
    private summonerName: string = Config.SummonerName;

    // Riot Account Id
    private accountId: number = Config.AccountId;

    // Game Logic
    private gameLogic: GameLogic;

    // Riot Api
    private riot: Riot;

    // === Constructor === //

    constructor () {

        this.gameLogic = new GameLogic();
        this.riot = new Riot();
    }

    // === Private Methods === //

    private async constructFakeGame(): Promise<LeagueGame> {

        const matchList: MatchList = await this.riot.getMatchesByAccount(this.accountId);

        if (matchList.matches.length > 0) {

            const lastMatch: MatchV3 = matchList.matches[0];

            const fakeSummoner: SummonersInGame = {
                name: this.summonerName,
                id: this.summonerId,
                champion: await this.gameLogic.getChampionById(lastMatch.champion),
                team: 0,
                champScore: 0,
                champPerf: "NA",
                rank: "",
                wins: 0,
                losses: 0,
                isRegisteredUser: true
            };

            const fakeGame: LeagueGame = {
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
    }

    // === Public Methods === //

    public async testProcessGame(): Promise<MatchDto> {

        const lastGame: LeagueGame = await this.constructFakeGame();

        return await this.gameLogic.processFinishedGame(lastGame);
    }
}
