import { LeagueGame } from "../_types/LeagueGame";
import { Subscription } from "../_types/Subscription";

type Paddings = {
    name: number;
    score: number;
    perf: number;
    rank: number;
    wl: number;
};

export class Formatter {
    static CommandFormatter(cmds: string[]): string {
        let str: string = "";

        for (const c of cmds) {
            str += `\`${c}\` `;
        }

        return str;
    }

    private static RightPad(str: string, pad: number): string {
        for (let i: number = str.length; i < pad; i++) str += " ";
        return str;
    }

    static GameResponse(game: LeagueGame, summonerId: number): string {
        const win: string = `${game.winChance}`;
        const minPad: number = 5;

        const paddings: Paddings = {
            name: 0,
            score: 0,
            perf: 0,
            rank: 0,
            wl: 0
        };

        // Works out the highest length strings
        for (const s of game.summoners) {
            if (s.champion.length > paddings.name) paddings.name = s.name.length;
            if (s.champScore.toString().length > paddings.score) paddings.score = s.champScore.toString().length;
            if (s.champPerf.length > paddings.perf) paddings.perf = s.champPerf.length;
            if (s.rank.length > paddings.rank) paddings.rank = s.rank.length;
        }

        for (const p in paddings) paddings[p] = paddings[p] + minPad;

        const champs: string[] = game.summoners.map((s) => {
            let name: string = (s.id === summonerId ? `# ` : ``) + `${s.champion}`;
            if (name.length < paddings.name) name = this.RightPad(name, paddings.name);

            let champScore: string = `${s.champScore}`;
            if (champScore.length < paddings.score) champScore = this.RightPad(champScore, paddings.score);

            let champPerf: string = `${s.champPerf}`;
            if (champPerf.length < paddings.perf) champPerf = this.RightPad(champPerf, paddings.perf);

            let rank: string = `${s.rank}`;
            if (rank.length < paddings.rank) rank = this.RightPad(rank, paddings.rank);

            return `${name} ${champScore} ${champPerf} ${rank} (WL: ${s.wins} / ${s.losses})`;
        });

        const res: string = `\`\`\`Markdown
# ${win}

${champs[0]}
${champs[1] || ""}
${champs[2] || ""}
${champs[3] || ""}
${champs[4] || ""}
${champs[5] || ""}
${champs[6] || ""}
${champs[7] || ""}
${champs[8] || ""}
${champs[9] || ""}
\`\`\``;

        return res;
    }

    static ListSubscriptions(subscriptions: Map<string, Subscription>): string {
        const title: string = `Current Subscriptions`;

        const subs: string[] = [];

        subscriptions.forEach((sub, key) => {
            subs.push(`Discord User: ${key} - Summoner: ${sub.summonerName} (${sub.summonerId})`);
        });

        const res: string = `\`\`\`Markdown
# ${title}

${
subs.toString().replace(",", "\\r")
}
\`\`\`
        `;

        return res;
    }
}
