import { Scene, GameObjects } from 'phaser';
import { IPlayerApp, IRenderingUnit, IWord, Player } from "textalive-app-api";

export class Game extends Scene
{
    background: GameObjects.Image | undefined;
    background_scroll: Phaser.GameObjects.TileSprite | undefined;
    textObjects: Phaser.Physics.Arcade.Group | undefined;
    textObject: GameObjects.Text | undefined;
    text = ""
    previousText: string = "";
    player: Player | undefined;
    gamePlayer: GameObjects.Star | undefined;
    keyW: Phaser.Input.Keyboard.Key | undefined;
    keyA: Phaser.Input.Keyboard.Key | undefined;
    keyS: Phaser.Input.Keyboard.Key | undefined;
    keyD: Phaser.Input.Keyboard.Key | undefined;

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

        // テキストオブジェクトのグループを作成
        this.textObjects = this.physics.add.group();

        // 歌詞情報の準備
        this.prepareLyrics();

        this.gamePlayer = this.add.star(1000, 500, 5, 32, 64, 0xffff00, 1);
        this.physics.add.existing(this.gamePlayer);

        // 重力の影響を受けないように設定
        const gamePlayerBody = this.gamePlayer.body as Phaser.Physics.Arcade.Body;
        gamePlayerBody.allowGravity = false;
        gamePlayerBody.setCollideWorldBounds(true);

        this.keyW = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        this.keyA = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.keyS = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        this.keyD = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.D);

        this.physics.add.collider(this.gamePlayer, this.textObjects, this.touch as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback, undefined, this);

        // const heavyTextObject = this.add.text(50, 10, "Heavy Text", {
        //     fontFamily: 'Arial', fontSize: 24, color: '#ffffff'
        // });
        // this.physics.add.existing(heavyTextObject);
        // const heavyTextBody = heavyTextObject.body as Phaser.Physics.Arcade.Body;
        // heavyTextBody.setCollideWorldBounds(true);
        // heavyTextBody.setBounce(0.5);
        // heavyTextBody.allowGravity = true;
        // heavyTextBody.mass = 5000; // 大きな質量
        
        // const lightTextObject = this.add.text(50, 50, "Light Text", {
        //     fontFamily: 'Arial', fontSize: 24, color: '#ffffff'
        // });
        // this.physics.add.existing(lightTextObject);
        // const lightTextBody = lightTextObject.body as Phaser.Physics.Arcade.Body;
        // lightTextBody.setCollideWorldBounds(true);
        // lightTextBody.setBounce(0.5);
        // lightTextBody.allowGravity = true;
        // lightTextBody.mass = 500; // 小さな質量

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
            const newTextObject = this.add.text(50, 50, this.text, {
                fontFamily: 'Arial', fontSize: 40, color: '#ffff00'
            });

            // 新しいテキストオブジェクトを物理エンティティとして追加
            this.physics.add.existing(newTextObject);
            this.textObjects?.add(newTextObject);

            // 物理プロパティを設定
            const newTextBody = newTextObject.body as Phaser.Physics.Arcade.Body;
            newTextBody.setCollideWorldBounds(true);
            const randomVelocity = Math.random() * 300;
            newTextBody.setVelocity(randomVelocity, 250); // 任意の速度を設定
            newTextBody.setBounce(0.8 - this.text.length * 0.05); // 反発係数を設定 

            // 前回のテキストを更新
            this.previousText = this.text;
        }

        // ゲームプレイヤーの速度をリセット
        if (this.gamePlayer?.body) {
            this.gamePlayer.body.velocity.x = 0;
            this.gamePlayer.body.velocity.y = 0;
        }

        // ゲームプレイヤーを移動させる
        if (this.keyW?.isDown) {
            if (this.gamePlayer?.body) {
                this.gamePlayer.body.velocity.y = -200;
            }
        }
        if (this.keyA?.isDown) {
            if (this.gamePlayer?.body) {
                this.gamePlayer.body.velocity.x = -200;
            }
        }
        if (this.keyS?.isDown) {
            if (this.gamePlayer?.body) {
                this.gamePlayer.body.velocity.y = 200;
            }
        }
        if (this.keyD?.isDown) {
            if (this.gamePlayer?.body) {
                this.gamePlayer.body.velocity.x = 200;
            }
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

    touch(player: GameObjects.GameObject, text: GameObjects.GameObject){
        const textBody = text.body as Phaser.Physics.Arcade.Body;
        textBody.enable = false;
        (text as Phaser.GameObjects.Text).setVisible(false);
    };
}
