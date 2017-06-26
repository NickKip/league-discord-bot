export type LeagueStats = {

    lastGameId: number;
    games: LeagueGame[];
    
};

export type LeagueGame = {
    gameId: number;
    gameTypeId: number;
    winChance: string;
    summoners: SummonersInGame[];
    isFinished: boolean;
};

export type SummonersInGame = {
    name: string,
    id: number,
    champion: string,
    team: number,
    champScore: number;
    champPerf: string;
    rank: string;
    wins: number;
    losses: number;
    isRegisteredUser: boolean;
};
