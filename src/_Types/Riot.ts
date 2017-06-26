// === Champions === //

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

export type BannedChampion = {
    pickTurn: number;
    championId: number;
    teamId: number;
};

// === Summoners === //

export type SummonerV3 = {
    profileIconId: number;
    name: string;
    summonerLevel: number;
    accountId: number;
    id: number;
    resvisionDate: number;
};

// === Spectators === //

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

// === Observer === //

export type Observer = {
    encryptionKey: string;
};

// === Game Participants === //

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

export type ParticipantIdentityDto = {
    player: PlayerDto;
    participantId: number;
};

export type PlayerDto = {
    currentPlatformId: string;
    summonerName: string;
    matchHistoryUri: string;
    platformId: string;
    currentAccountId: number;
    profileIcon: number;
    summonerId: number;
    accountId: number;
};

export type ParticipantDto = {
    stats: ParticipantStatsDto;
    participantId: number;
    runes: Rune[];
    timeline: ParticipantTimelineDto;
    teamId: number;
    spell1Id: number;
    spell2Id: number;
    masteries: Mastery[];
    highestAchievedSeasonTier: string;
    championId: number;
};

export type ParticipantStatsDto = {
    item1: number;
    totalPlayerScore: number;
    visionScore: number;
    unrealKills: number;
    win: boolean;
    objectivePlayerScore: number;
    largestCriticalStrike: number;
    totalDamageDealt: number;
    magicDamageDealtToChampions: number;
    largestMultiKill: number;
    largestKillingSpree: number;
    quadraKills: number;
    totalTimeCrowdControlDealt: number;
    magicalDamageTaken: number;
    longestTimeSpentLiving: number;
    neutralMinionsKilledEnemyJungle: number;
    firstTowerAssist: boolean;
    neutralMinionsKilledTeamJungle: number;
    goldEarned: number;
    item2: number;
    item3: number;
    item0: number;
    deaths: number;
    item6: number;
    wardsPlaced: number;
    item4: number;
    item5: number;
    turretKills: number;
    tripleKills: number;
    damageSelfMitigated: number;
    goldSpent: number;
    magicDamageDealt: number;
    kills: number;
    doubleKills: number;
    firstInhibitorKill: boolean;
    trueDamageTaken: number;
    firstBloodAssist: boolean;
    firstBloodKill: boolean;
    assists: number;
    totalScoreRank: number;
    neutralMinionsKilled: number;
    combatPlayerScore: number;
    visionWardsBoughtInGame: number;
    damageDealtToTurrets: number;
    physicalDamageDealtToChampions: number;
    pentaKills: number;
    trueDamageDealt: number;
    trueDamageDealtToChampions: number;
    champLevel: number;
    participantId: number;
    firstInhibitorAssist: boolean;
    wardsKilled: number;
    firstTowerKill: boolean;
    totalHeal: number;
    totalMinionsKilled: number;
    physicalDamageDealt: number;
    damageDealtToObjectives: number;
    sightWardsBoughtInGame: number;
    totalDamageDealtToChampions: number;
    totalUnitsHealed: number;
    inhibitorKills: number;
    totalDamageTaken: number;
    killingSprees: number;
    timeCCingOthers: number;
    physicalDamageTaken: number;
};

export type ParticipantTimelineDto = {
    lane: string;
    participantId: number;
    csDiffPerMinDeltas: Delta;
    goldPerMinDeltas: Delta;
    xpDiffPerMinDeltas: Delta;
    creepsPerMinDeltas: Delta;
    xpPerMinDeltas: Delta;
    damageTakenDiffPerMinDeltas: Delta;
    damageTakenPerMinDeltas: Delta;
    role: string;
};

export type Delta = {
    "0-10": number;
    "10-20": number;
    "20-30"?: number;
    "30-40"?: number;
    "40-50"?: number;
    "50-60"?: number;
};

// === Rune === //

export type Rune = {
    count?: number;
    runeId: number;
    rank?: number;
};

// === Mastery === //

export type Mastery = {
    masteryId: number;
    rank: number;
};

// === League === //

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

// === Matches === //

export type MatchList = {
    matches: MatchV3[];
    totalGames: number;
    startIndex: number;
    endIndex: number;
};

export type MatchV3 = {
    lane: string;
    gameId: number;
    champion: number;
    platformId: string;
    timestamp: number;
    queue: number;
    role: string;
    season: number;
};

export type MatchDto = {
    seasonId: number;
    queueId: number;
    gameId: number;
    participantIdentities: ParticipantIdentityDto[];
    gameVersion: string;
    platformId: string;
    gameMode: string;
    mapId: number;
    gameType: string;
    teams: TeamStatsDto[];
    participants: ParticipantDto[];
    gameDuration: number;
    gameCreation: number;
};

// === Teams === //

export type TeamStatsDto = {

    firstDragon: boolean;
    firstInhibitor: boolean;
    bans: TeamBansDto[];
    baronKills: number;
    firstRiftHerald: boolean;
    firstBaron: boolean;
    riftHeraldKills: number;
    firstBlood: boolean;
    teamId: number;
    firstTower: boolean;
    vilemawKills: number;
    inhibitorKlls: number;
    towerKills: number;
    dominionVictoryScore: number;
    win: string;
    dragonKills: number;
};

export type TeamBansDto = {
    pickTurn: number;
    championId: number;
};
