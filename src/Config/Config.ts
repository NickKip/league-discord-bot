export class Config {

    // === Bot Details === //

    static BotName: string = "League Bot";
    static Token: string = "your-token";
    static Debugging: boolean = true;

    // === League Details === //

    static LeagueGameName: string = "League of Legends";
    static RiotApiKey: string = "your-riot-api-key";

    // === Game Types === //

    // TEAM_BUILDER_RANKED_SOLO: 420
    // RANKED_FLEX_SR: 440
    // RANKED_SOLO_5x5: 4

    static GameTypeIds: number[] = [420, 440];

    // === Debugging Helpers === //

    static SummonerId: number = 0;
    static SummonerName: string = "";
    static AccountId: number = 0;
}
