"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Formatter {
    static CommandFormatter(cmds) {
        let str = "";
        for (const c of cmds) {
            str += `\`${c}\` `;
        }
        return str;
    }
    static RightPad(str, pad) {
        for (let i = str.length; i < pad; i++)
            str += " ";
        return str;
    }
    static GameResponse(game, summonerId) {
        const win = `${game.winChance}`;
        const minPad = 5;
        const paddings = {
            name: 0,
            score: 0,
            perf: 0,
            rank: 0,
            wl: 0
        };
        for (const s of game.summoners) {
            if (s.champion.length > paddings.name)
                paddings.name = s.name.length;
            if (s.champScore.toString().length > paddings.score)
                paddings.score = s.champScore.toString().length;
            if (s.champPerf.length > paddings.perf)
                paddings.perf = s.champPerf.length;
            if (s.rank.length > paddings.rank)
                paddings.rank = s.rank.length;
        }
        for (const p in paddings)
            paddings[p] = paddings[p] + minPad;
        const champs = game.summoners.map((s) => {
            let name = (s.id === summonerId ? `# ` : ``) + `${s.champion}`;
            if (name.length < paddings.name)
                name = this.RightPad(name, paddings.name);
            let champScore = `${s.champScore}`;
            if (champScore.length < paddings.score)
                champScore = this.RightPad(champScore, paddings.score);
            let champPerf = `${s.champPerf}`;
            if (champPerf.length < paddings.perf)
                champPerf = this.RightPad(champPerf, paddings.perf);
            let rank = `${s.rank}`;
            if (rank.length < paddings.rank)
                rank = this.RightPad(rank, paddings.rank);
            return `${name} ${champScore} ${champPerf} ${rank} (WL: ${s.wins} / ${s.losses})`;
        });
        const res = `\`\`\`Markdown
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
    static ListSubscriptions(subscriptions) {
        const title = `Current Subscriptions`;
        const subs = [];
        subscriptions.forEach((sub, key) => {
            subs.push(`Discord User: ${key} - Summoner: ${sub.summonerName} (${sub.summonerId})`);
        });
        const res = `\`\`\`Markdown
# ${title}

${subs.toString().replace(",", "\\r")}
\`\`\`
        `;
        return res;
    }
}
exports.Formatter = Formatter;
//# sourceMappingURL=Formatter.js.map