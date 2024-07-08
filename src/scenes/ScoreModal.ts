import { Scene } from 'phaser';

export class ScoreModal extends Scene {
    constructor() {
        super('ScoreModal');
    }

    create() {
        // 背景を半透明の黒に設定
        this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x000000, 0.5).setOrigin(0);

        const score_list = this.registry.get('score_list');
        let scoreModal = `<div id="score_modal">
                            <button class="button is-black">&times;</button>
                            <table>
                                <caption>
                                    <strong>SCORE RESULT</strong>
                                </caption>
                                <thead>
                                    <tr>
                                        <th scope="col">stage1</th>
                                        <th scope="col">stage2</th>
                                        <th scope="col">bonus stage</th>
                                        <th scope="col">sum score</th>
                                    </tr>
                                </thead>
                                <tbody>`;
        if (score_list.length === 0){
            scoreModal += `<tr><td colspan="4">スコアがありません</td></tr>`;
        } else {
            for (let i = 0; i < score_list.length; i++) {
                scoreModal += `
                    <tr>
                        <td>${this.sc_display(score_list[i][0])}</td>
                        <td>${this.sc_display(score_list[i][1])}</td>
                        <td>${this.sc_display(score_list[i][2])}</td>
                        <td>${this.sum_display(score_list[i][0], score_list[i][1], score_list[i][2])}</td>
                    </tr>
                `;
            }
        }

        scoreModal += '</tbody></table></div>';

        this.add.dom(this.scale.width / 2, this.scale.height / 2).createFromHTML(scoreModal);
            // .setOrigin(0.5);

        const btn = document.querySelector('#score_modal > button');
        btn?.addEventListener('click', () => {
            this.scene.stop('ScoreModal');
            this.scene.resume('MainMenu');
        });
    }

    sc_display(score: number) {
        if (score === undefined){
            return '---';
        } else {
            return score;
        }
    }

    sum_display(score1: number, score2: number, score3: number) {
        const validNumbers = [score1, score2, score3].filter(num => num !== undefined);
        return validNumbers.reduce((sum, num) => sum + num, 0);
    }
}