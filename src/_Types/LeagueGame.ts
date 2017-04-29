export type LeagueGame = {
    winChance: string;
    summoners: SummonersInGame[]
}

export type SummonersInGame = {
    name: string,
    id: number,
    champion: string,
    team: number,
    champScore: number;
    champPerf: string;
}