import * as Request from "request";
import { Config } from "../Config/Config";

import {
    Champions,
    ChampionMap,
    LeagueV2,
    SummonerV3,
    SpectatorV3
} from "../_types/Riot";

export class Riot {
    private apiKey: string = `?api_key=${Config.RiotApiKey}`;
    private champions: string = "https://euw1.api.riotgames.com/lol/static-data/v3/champions";
    private leagueV2: string = "https://euw.api.riotgames.com/api/lol/EUW/v2.5/league/by-summoner/";
    private summonerV3: string = "https://euw1.api.riotgames.com/lol/summoner/v3/summoners/by-name/";
    private spectatorV3: string = "https://euw1.api.riotgames.com/lol/spectator/v3/active-games/by-summoner/";

    private key: string = Config.RiotApiKey;

    constructor() {}

    private async httpRequest<T>(uri: string): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            Request(uri, (err, res, body) => {
                if (err) {
                    reject(err);
                }
                else if (res && res.statusCode !== 200) {
                    reject(err);
                }
                else {
                    resolve(JSON.parse(body));
                }
            });
        });
    }

    async getChampions(): Promise<ChampionMap> {
        try {
            const champions: Champions = await this.httpRequest<Champions>(this.champions + this.apiKey);

            const map: ChampionMap = {};

            for (const c in champions.data) {
                map[champions.data[c].id] = champions.data[c].name;
            }

            return map;

        }
        catch (ex) {
            return undefined;
        }
    }

    async getSummonerId(summonerName: string): Promise<number> {
        try {
            const summoner: SummonerV3 = await this.httpRequest<SummonerV3>(this.summonerV3 + summonerName + this.apiKey);
            return summoner.id;
        }
        catch (ex) {
            return undefined;
        }
    }

    async isInGame(summonerId: number): Promise<SpectatorV3> {
        try {
            const game: SpectatorV3 = await this.httpRequest<SpectatorV3>(this.spectatorV3 + summonerId + this.apiKey);
            return game;
        }
        catch (ex) {
            return undefined;
        }
    }

    async getRankedInfo(summonerIds: number[]): Promise<LeagueV2> {
        try {
            const league: LeagueV2 = await this.httpRequest<LeagueV2>(`${this.leagueV2}${summonerIds.toString()}/entry${this.apiKey}`);
            return league;
        }
        catch (ex) {
            return undefined;
        }
    }

}
