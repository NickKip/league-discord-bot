export type Champions = {
    data: {
        [key: string]: {
            title: string;
            id: number;
            key: string;
            name: string;
        }
    }
};

export type ChampionMap = {
    [id: number]: string;
};

export type SummonerV3 = {
    profileIconId: number;
    name: string;
    summonerLevel: number;
    accountId: number;
    id: number;
    resvisionDate: number;
};

export type SpectatorV3 = {
    gameId: number;
    gameStartTime: number;
    platformId: string;
    gameMode: string;
    mapId: number;
    gameType: string;
    bannedChampions: BannedChampion[];
    observers: Observer;
    participants: CurrentGameParticipant[];
    gameLength: number;
    gameQueueConfigId: number;
};

export type BannedChampion = {
    pickTurn: number;
    championId: number;
    teamId: number;
};

export type Observer = {
    encryptionKey: string;
};

export type CurrentGameParticipant = {
    profileIconId: number;
    championId: number;
    summonerName: string;
    runes: Rune[];
    bot: boolean;
    teamId: number;
    spell1Id: number;
    spell2Id: number;
    masteries: Mastery[];
    summonerId: number;
};

export type Rune = {
    count: number;
    runeId: number;
};

export type Mastery = {
    masteryId: number;
    rank: number;
};

export type LeagueV2 = {
    [summonerId: string]: LeagueV2DTO[];
};

export type LeagueV2DTO = {
    tier: string;
    queue: string;
    name: string;
    entries: LeagueV2DTOEntry[];
};

export type LeagueV2DTOEntry = {
    isFreshBlood: boolean;
    division: string;
    isVeteran: boolean;
    wins: number;
    losses: number;
    playerOrTeamId: string;
    playerOrTeamName: string;
    isInactive: boolean;
    isHotStreak: boolean;
    leaguePoints: number;
};
