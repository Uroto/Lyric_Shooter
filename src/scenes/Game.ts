import { Scene, GameObjects } from 'phaser';
import { IPlayerApp, IRenderingUnit, IWord, Player } from "textalive-app-api";

export class Game extends Scene
{
    background: GameObjects.Image | undefined;
    background_scroll: Phaser.GameObjects.TileSprite | undefined;
    textObjects: Phaser.GameObjects.Text[] = [];
    textObject: GameObjects.Text | undefined;
    text = ""
    previousText: string = "";
    player: Player | undefined;

    constructor ()
    {
        super('Game');
        this.animatedWord = this.animatedWord.bind(this);
    }

    create ()
    {
        this.background_scroll = this.add.tileSprite(0, 0, window.innerWidth, window.innerHeight, 'background')
            .setOrigin(0, 0);
        this.player = this.registry.get('player');

        this.textObject = this.add.text(50, 10, this.text, {
            fontFamily: 'Arial', fontSize: 24, color: '#ffffff'
        });

        if (this.textObject) {
            // テキストオブジェクトを物理エンティティとして追加
            this.physics.add.existing(this.textObject);

            // 物理プロパティを設定
            const textBody = this.textObject.body as Phaser.Physics.Arcade.Body;
            textBody.setCollideWorldBounds(true);
            textBody.setVelocity(100, 200); // 任意の速度を設定
            textBody.setBounce(1, 1); // 反発係数を設定

            // 初期のテキストオブジェクトをリストに追加
            this.textObjects.push(this.textObject);
        }

        // 歌詞情報の準備
        this.prepareLyrics();

        // this.input.once('pointerdown', () => {

        //     this.scene.launch('GameOver');

        // });
    }

    update(time: number, delta: number): void {
        // 背景をスクロールさせる
        if (this.background_scroll) {
            this.background_scroll.tilePositionX += 1; // X方向にスクロール
            this.background_scroll.tilePositionY += 0.5; // Y方向にスクロール（必要に応じて調整）
        }

        if (this.text !== this.previousText) {
            // 新しいテキストオブジェクトを作成して追加
            const newTextObject = this.add.text(50, 10 + this.textObjects.length * 30, this.text, {
                fontFamily: 'Arial', fontSize: 24, color: '#ffffff'
            });

            // 新しいテキストオブジェクトを物理エンティティとして追加
            this.physics.add.existing(newTextObject);

            // 物理プロパティを設定
            const newTextBody = newTextObject.body as Phaser.Physics.Arcade.Body;
            newTextBody.setCollideWorldBounds(true);
            newTextBody.setVelocity(100, 200); // 任意の速度を設定
            newTextBody.setBounce(1, 1); // 反発係数を設定

            // 新しいテキストオブジェクトをリストに追加
            this.textObjects.push(newTextObject);

            // 前回のテキストを更新
            this.previousText = this.text;
        }
    }

    prepareLyrics() {
        if (this.player?.video) {
            let w: IWord | undefined = this.player.video.firstWord;
            while (w) {
                w.animate = this.animatedWord;
                w = w.next;
            }
        }
    }

    animatedWord(now: number, unit: IRenderingUnit) {
        const word = unit as IWord;
        if (word.contains(now)) {
            this.text = word.text;
        }
    }
}
