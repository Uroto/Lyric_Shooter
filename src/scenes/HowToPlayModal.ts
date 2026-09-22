import { Scene } from 'phaser';

export class HowToPlayModal extends Scene {
    constructor() { super('HowToPlayModal'); }
    create(): void {
        const backdrop = this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x000000, 0.65).setOrigin(0).setInteractive();
        const html = `<section id="how-to-play" role="dialog" aria-modal="true" aria-labelledby="how-to-title">
            <button class="modal-close button is-black" type="button" aria-label="閉じる">&times;</button>
            <h2 id="how-to-title">ルール説明</h2>
            <p class="lead">歌詞の文字を撃ってスコアを稼ぐシューティングゲームです！</p>
            <div class="stage-rule"><h3>STAGE 1</h3><p>左右に移動し、ジャンプ（Space/ボタン）しながら、クリック/タップで文字を撃ちます。</p></div>
            <div class="stage-rule"><h3>STAGE 2</h3><p>上下左右に飛びながら、クリック／タップで文字を撃ちます。</p></div>
            <p class="bonus">両ステージでハイスコアを取ると、ボーナスステージが現れるかも…？</p>
        </section>`;
        const modal = this.add.dom(this.scale.width / 2, this.scale.height / 2).createFromHTML(html).setOrigin(0.5);
        const close = () => {
            localStorage.setItem('lyric-shooter-how-to-seen', '1');
            this.scene.stop();
            this.scene.resume('MainMenu');
        };
        backdrop.on('pointerdown', close);
        (modal.node.querySelector('.modal-close') as HTMLButtonElement | null)?.addEventListener('click', close);
    }
}
