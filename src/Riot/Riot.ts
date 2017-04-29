import * as Request from "request";
import { Config } from "../Config/Config";

import {
    Champions,
    ChampionMap,
    SummonerV3,
    SpectatorV3
} from "../_types/Riot";

export class Riot {
    private apiKey = `?api_key=${Config.RiotApiKey}`;
    private champions = "https://euw1.api.riotgames.com/lol/static-data/v3/champions";
    private summonerV3 = "https://euw1.api.riotgames.com/lol/summoner/v3/summoners/by-name/";
    private spectatorV3 = "https://euw1.api.riotgames.com/lol/spectator/v3/active-games/by-summoner/";

    private key = Config.RiotApiKey;

    constructor() {}

    private async httpRequest<T>(uri: string): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            Request(uri, (err, res, body) => {
                if(err) 
                    reject(err);
                else if(res && res.statusCode !== 200) 
                    reject(err);
                else {
                    resolve(JSON.parse(body));
                }
            });
        });
    }

    async getChampions(): Promise<ChampionMap> {
        try {
            let champions = await this.httpRequest<Champions>(this.champions + this.apiKey);

            let map: ChampionMap = {};

            for(let c in champions.data) {
                map[champions.data[c].id] = champions.data[c].name;
            }

            return map

        }
        catch(ex) {
            return undefined;
        }
    }

    async getSummonerId(summonerName: string): Promise<number> {
        try {
            let summoner = await this.httpRequest<SummonerV3>(this.summonerV3 + summonerName + this.apiKey);
            return summoner.id;
        }
        catch(ex) {
            return undefined;
        }
    }

    async isInGame(summonerId: number): Promise<SpectatorV3> {
        try {
            let game = await this.httpRequest<SpectatorV3>(this.spectatorV3 + summonerId + this.apiKey);
            return game;
        }
        catch(ex) {
            return undefined;
        }
    }

}