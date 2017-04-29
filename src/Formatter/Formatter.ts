import { LeagueGame } from "../_types/LeagueGame";

export class Formatter {
    static CommandFormatter(cmds: string[]): string {
        let str: string = "";

        for(let c of cmds) {
            str += "`" + c + "` ";
        }

        return str;
    }

    static GameResponse(game: LeagueGame, summonerId: number): string {
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
}