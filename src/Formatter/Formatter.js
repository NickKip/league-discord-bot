"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Formatter {
    static CommandFormatter(cmds) {
        let str = "";
        for (let c of cmds) {
            str += "`" + c + "` ";
        }
        return str;
    }
    static GameResponse(game, summonerId) {
        let win = `${game.winChance}`;
        let champs = game.summoners.map((s) => {
            return (s.id === summonerId ? `# ` : ``) + `${s.champion}: ${s.champScore} (${s.champPerf})`;
        });
        let res = `\`\`\`Markdown
# ${win}

${champs[0]}
${champs[1] || ''}
${champs[2] || ''}
${champs[3] || ''}
${champs[4] || ''}
${champs[5] || ''}
${champs[6] || ''}
${champs[7] || ''}
${champs[8] || ''}
${champs[9] || ''}
\`\`\``;
        return res;
    }
    static ListSubscriptions(subscriptions) {
        let title = `Current Subscriptions`;
        let subs = [];
        subscriptions.forEach((sub, key) => {
            subs.push(`Discord User: ${key} - Summoner: ${sub.summonerName}`);
        });
        let res = `\`\`\`Markdown
# ${title}

${subs.toString().replace(",", "\\r")}
\`\`\`
        `;
        return res;
    }
}
exports.Formatter = Formatter;
//# sourceMappingURL=Formatter.js.map