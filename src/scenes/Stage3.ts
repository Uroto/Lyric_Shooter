import { Scene, GameObjects } from 'phaser';
import { IRenderingUnit, IWord, Player } from "textalive-app-api";

export class Stage3 extends Scene
{
    background: GameObjects.Image | undefined;
    background_scroll: Phaser.GameObjects.TileSprite | undefined;
    textObjects: Phaser.Physics.Arcade.Group | undefined;
    textObject: GameObjects.Text | undefined;
    text = ""
    previousText: string = "";
    player: Player | undefined;
    gamePlayer: GameObjects.Sprite | undefined;
    score: number = 0;
    sumScore: number = 0;
    scoreText: GameObjects.Text | undefined;
    play: GameObjects.Sprite | undefined;
    home: GameObjects.Image | undefined;
    isPaused: boolean = false;

    constructor ()
    {
        super('Stage3');
        this.animatedWord = this.animatedWord.bind(this);
    }

    create ()
    {
        this.background_scroll = this.add.tileSprite(0, 0, this.scale.width, this.scale.height, 'back_stage3')
            .setOrigin(0, 0);
        this.player = this.registry.get('player');
        this.isPaused = false;

        this.play = this.add.sprite(this.scale.width - 130, 50, 'play')
            .setOrigin(0.5)
            .setInteractive();
        this.play.anims.create({
            key: 'stop',
            frames: [ { key: 'play', frame: 0 } ],
            frameRate: 10,
        });
        this.play.anims.create({
            key: 'play',
            frames: [ { key: 'play', frame: 1 } ],
            frameRate: 10,
        });

        this.play.on('pointerdown', () => {
            if (this.player?.isPlaying) {
                this.player.requestPause();
                this.play?.anims.play('play');
                this.isPaused = true;
                this.gamePlayer?.setActive(false);
                this.physics.world.pause();
            } else {
                this.player?.requestPlay();
                this.play?.anims.play('stop');
                this.isPaused = false;
                this.gamePlayer?.setActive(true);
                this.physics.world.resume();
            }
        });

        this.home = this.add.image(this.scale.width - 50, 50, 'home')
            .setOrigin(0.5)
            .setInteractive()
            .on('pointerdown', () => {
                this.player?.requestStop();
                this.scene.stop('Stage3');
                this.scene.start('MainMenu');
            });

        this.score = 0;
        const previousScene = this.registry.get('previousScene');
        this.sumScore = this.registry.get(previousScene + '_score') ?? 0;
        this.scoreText = this.add.text(20, 10, "SCORE: " + this.sumScore.toString(), {
            fontFamily: 'mihiPixelmoji', fontSize: 40, color: '#ffffff'
        });

        // テキストオブジェクトのグループを作成
        this.textObjects = this.physics.add.group();

        // 歌詞情報の準備
        this.prepareLyrics();

        this.gamePlayer = this.add.sprite(this.scale.width - 50, this.scale.height - 50, 'hachunemiku');
        this.physics.add.existing(this.gamePlayer);

        this.anims.create({
            key: 'idle',
            frames: [ { key: 'hachunemiku', frame: 0 } ],
            frameRate: 10,
        });

        this.anims.create({
            key: 'walk',
            frames: this.anims.generateFrameNumbers('hachunemiku', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'swing',
            frames: this.anims.generateFrameNumbers('hachunemiku', { start: 4, end: 7 }),
            frameRate: 10,
        });

        const gamePlayerBody = this.gamePlayer.body as Phaser.Physics.Arcade.Body;
        gamePlayerBody.setCollideWorldBounds(true);

        this.physics.add.overlap(this.gamePlayer, this.textObjects, this.touch as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback, undefined, this);

        this.gamePlayer.anims.play('walk');
        this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            if (pointer.leftButtonDown()) {
                this.gamePlayer?.anims.play('swing');
            }
        });

        this.gamePlayer?.on('animationcomplete-swing', () => {
            this.gamePlayer?.anims.play('walk');
        }, this);

    }

    update(): void {
        // 背景をスクロールさせる
        if (this.background_scroll) {
            this.background_scroll.tilePositionX += 1; // X方向にスクロール
        }

        if (this.text !== this.previousText) {
            // 新しいテキストオブジェクトを作成して追加
            let fontSize = this.text.length * 70;
            if (fontSize > this.scale.height) {
                fontSize = this.scale.height;
            }
            const newTextObject = this.add.text(10, this.scale.height - 10, this.text, {
                fontFamily: 'pop', fontSize: fontSize, color: '#000000'
            });

            // 新しいテキストオブジェクトを物理エンティティとして追加
            this.physics.add.existing(newTextObject);
            this.textObjects?.add(newTextObject);

            // 物理プロパティを設定
            const newTextBody = newTextObject.body as Phaser.Physics.Arcade.Body;
            newTextBody.setCollideWorldBounds(true);
            newTextBody.setVelocity(300 + this.text.length * 0.05, 0); // 任意の速度を設定

            // 前回のテキストを更新
            this.previousText = this.text;
        }


        if (!this.player?.isPlaying) {
            setTimeout(() => {
                if (!this.player?.isPlaying && !this.isPaused) {
                    this.finish();
                }
            }, 100);
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

    touch(text: GameObjects.GameObject){
        const textBody = text.body as Phaser.Physics.Arcade.Body;
        textBody.enable = false;
        (text as Phaser.GameObjects.Text).setVisible(false);
        this.input.once('pointerdown', (pointer: Phaser.Input.Pointer) => {
            if (pointer.leftButtonDown()) {
                this.score += (text as Phaser.GameObjects.Text).text.length * 10;
                this.sumScore += (text as Phaser.GameObjects.Text).text.length * 10;

                // スコアアップのテキストを表示
                const scoreUpText = this.add.text(this.gamePlayer?.x ?? 0, (this.gamePlayer?.y ?? 0) - (this.gamePlayer?.height ?? 0) / 2, "score up!!", {
                    fontFamily: 'mihiPixelmoji', fontSize: 40, color: '#ff0000'
                });
                this.time.addEvent({
                    delay: 500,
                    callback: () => {
                        scoreUpText.destroy();
                    }
                });
            }
        });
        this.scoreText?.setText("SCORE: " + this.sumScore.toString());
    };

    finish() {
        const currentSceneKey = this.scene.key;
        this.scene.pause(currentSceneKey);
        this.player?.requestPause();
        this.registry.set(currentSceneKey + '_score', this.score);
        this.registry.set('previousScene', currentSceneKey);
        this.scene.launch('Result');
    }
}
