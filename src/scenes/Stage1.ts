import Phaser, { Scene, GameObjects } from 'phaser';
import { IRenderingUnit, IWord, Player } from "textalive-app-api";
import { MobileControls } from '../ui/MobileControls';
import { isMobileDevice } from '../ui/device';

interface CustomText extends Phaser.GameObjects.Text {
    intervalID?: number;
    timeoutID?: number;
}
export class Stage1 extends Scene
{
    background: GameObjects.Image | undefined;
    background_scroll: Phaser.GameObjects.TileSprite | undefined;
    textObjects: Phaser.Physics.Arcade.Group | undefined;
    textObject: GameObjects.Text | undefined;
    text = ""
    previousText: string = "";
    player: Player | undefined;
    gamePlayer: GameObjects.Sprite | undefined;
    bullets: GameObjects.Group | undefined;
    isJumping: boolean = false;
    isPaused: boolean = false;
    keySpace: Phaser.Input.Keyboard.Key | undefined;
    keyA: Phaser.Input.Keyboard.Key | undefined;
    keyD: Phaser.Input.Keyboard.Key | undefined;
    keyLeft: Phaser.Input.Keyboard.Key | undefined;
    keyRight: Phaser.Input.Keyboard.Key | undefined;
    score: number = 0;
    scoreText: GameObjects.Text | undefined;
    play: GameObjects.Sprite | undefined;
    home: GameObjects.Image | undefined;
    scoreThreshold: number = 300; // スコアの閾値
    mobileControls?: MobileControls;

    constructor ()
    {
        super('Stage1');
        this.animatedWord = this.animatedWord.bind(this);
    }

    create ()
    {
        this.background_scroll = this.add.tileSprite(0, 0, this.scale.width, this.scale.height, 'back_stage1')
            .setOrigin(0, 0)
            .setAlpha(0.9);
        this.player = this.registry.get('player');
        this.isPaused = false;
        this.isJumping = false;

        this.play = this.add.sprite(this.scale.width - 120, 48, 'play').setDisplaySize(56, 56).setDepth(1100)
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

        this.home = this.add.image(this.scale.width - 48, 48, 'home').setDisplaySize(56, 56).setDepth(1100)
            .setOrigin(0.5)
            .setInteractive()
            .on('pointerdown', () => {
                this.player?.requestStop();
                this.scene.stop('Stage1');
                this.scene.start('MainMenu');
            });

        this.bullets = this.physics.add.group();

        this.score = 0;
        this.scoreText = this.add.text(20, 10, "SCORE: " + this.score.toString(), {
            fontFamily: 'mihiPixelmoji', fontSize: 32, color: '#ffffff'
        }).setStroke('#000000', 3).setDepth(1100);

        // テキストオブジェクトのグループを作成
        this.textObjects = this.physics.add.group();

        // 歌詞情報の準備
        this.prepareLyrics();


        this.gamePlayer = this.add.sprite(this.scale.width - 250, this.scale.height - 64, 'rinren');
        this.physics.add.existing(this.gamePlayer);

        this.anims.create({
            key: 'rinren_left',
            frames: [ { key: 'rinren', frame: 0 } ],
            frameRate: 10,
        });

        this.anims.create({
            key: 'rinren_right',
            frames: [ { key: 'rinren', frame: 1 } ],
            frameRate: 10,
        });

        this.gamePlayer.anims.play('rinren_left');

        const gamePlayerBody = this.gamePlayer.body as Phaser.Physics.Arcade.Body;
        gamePlayerBody.setCollideWorldBounds(true);
        gamePlayerBody.setDrag(100);

        this.keySpace = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.keyA = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.keyD = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        this.keyLeft = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
        this.keyRight = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
        if (isMobileDevice()) {
            this.input.addPointer(2);
            // Handle a touch jump in the pointer event itself. A short tap can start
            // and end between two update frames on mobile browsers.
            this.mobileControls = new MobileControls(this, 'stage1', () => this.jump());
        }

        this.physics.add.collider(this.textObjects, this.textObjects)
        this.physics.add.collider(this.gamePlayer, this.textObjects);
        this.physics.add.collider(this.bullets, this.textObjects, this.touch as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback, undefined, this);
        this.physics.world.on('worldbounds', (body: Phaser.Physics.Arcade.Body) => {
            if (this.bullets?.contains(body.gameObject)) {
                this.handleWorldBoundsCollision(body);
            }
        });
        
        this.input.mouse?.disableContextMenu();
        this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            if (pointer.leftButtonDown() && !this.isPaused && !this.isUiPointer(pointer)) this.shoot();
        });
        this.events.once('shutdown', () => this.mobileControls?.destroy());
    }

    update(): void {
        // 背景をスクロールさせる
        if (this.background_scroll && !this.isPaused) {
            this.background_scroll.tilePositionX += 1; // X方向にスクロール
        }

        if (this.text !== this.previousText) {
            // 新しいテキストオブジェクトを作成して追加
            const newTextObject = this.add.text(50, 50, this.text, {
                fontFamily: 'sharp', fontSize: 75, color: '#ffffff'
            });

            // 新しいテキストオブジェクトを物理エンティティとして追加
            this.physics.add.existing(newTextObject);
            this.textObjects?.add(newTextObject);

            // 物理プロパティを設定
            const newTextBody = newTextObject.body as Phaser.Physics.Arcade.Body;
            newTextBody.setCollideWorldBounds(true);
            const randomVelocity = 100 + Math.random() * 300;
            newTextBody.setVelocity(randomVelocity, 250); // 任意の速度を設定
            newTextBody.setBounce(0.8 - this.text.length * 0.05); // 反発係数を設定

            let intervalID: number;
            let timeoutID: number;
            timeoutID = setTimeout(() => {
                intervalID = setInterval(() => {
                    newTextObject.setVisible(!newTextObject.visible);
                }, 50);
                (newTextObject as CustomText).intervalID = intervalID;
            }, 5000);
            (newTextObject as CustomText).timeoutID = timeoutID;
            setTimeout(() => {
                newTextObject.setVisible(false);
                newTextBody.enable = false;
                clearInterval(intervalID);
            }, 7000);

            // 前回のテキストを更新
            this.previousText = this.text;
        }

        // ゲームプレイヤーを移動させる
        if (!this.isPaused) {
            if (this.keySpace?.isDown) this.jump();
            if (this.keyLeft?.isDown || this.keyA?.isDown || this.mobileControls?.directions.left) {
                if (this.gamePlayer?.body) {
                    this.gamePlayer.body.velocity.x = -200;
                    this.gamePlayer.anims.play('rinren_left');
                }
            }
            if (this.keyRight?.isDown || this.keyD?.isDown || this.mobileControls?.directions.right) {
                if (this.gamePlayer?.body) {
                    this.gamePlayer.body.velocity.x = 200;
                    this.gamePlayer.anims.play('rinren_right');
                }
            }
        }

        if ((this.gamePlayer?.body as Phaser.Physics.Arcade.Body).blocked.down) {
            if (this.isJumping) {
                this.isJumping = false;
            }
        }

        if (!this.player?.isPlaying && !this.isPaused) {
            setTimeout(() => {
                if (!this.player?.isPlaying && !this.isPaused) {
                    this.finish();
                }
            }, 100);
        }
    }

    private jump(): void {
        if (this.isPaused || this.isJumping || !this.gamePlayer?.body) return;
        this.gamePlayer.body.velocity.y = -500;
        this.isJumping = true;
    }

    shoot() {
        const bullet = this.add.star(this.gamePlayer?.x ?? 0, (this.gamePlayer?.y ?? 0) + 10, 5, 10, 15, 0xffff00, 1);
        this.physics.add.existing(bullet);
        this.bullets?.add(bullet);
        const body = bullet.body as Phaser.Physics.Arcade.Body;
        body.setVelocity(this.gamePlayer?.anims.currentAnim?.key === 'rinren_left' ? -300 : 300, 0);
        body.setCollideWorldBounds(true, 1, 1, true);
        body.allowGravity = false;
    }

    isUiPointer(pointer: Phaser.Input.Pointer): boolean {
        return Boolean(this.mobileControls?.contains(pointer.x, pointer.y))
            || (pointer.y < 90 && pointer.x > this.scale.width - 170);
    }

    prepareLyrics() {
        if (this.player?.video) {
            let w: IWord | undefined = this.player.video.firstWord;
            let max_score = 0;
            while (w) {
                w.animate = this.animatedWord;
                max_score += w.text.length * 10;
                w = w.next;
            }
            this.registry.set('max_score', max_score);
        }
    }

    animatedWord(now: number, unit: IRenderingUnit) {
        const word = unit as IWord;
        if (word.contains(now)) {
            this.text = word.text;
        }
    }

    touch(bullet: GameObjects.GameObject, text: GameObjects.GameObject){
        const textBody = text.body as Phaser.Physics.Arcade.Body;
        const bulletBody = bullet.body as Phaser.Physics.Arcade.Body;

        for (let i = 0; i < 10; i++) {
            const textObject = text as Phaser.GameObjects.Text;
            const spark = this.add.image(textObject.x, textObject.y, 'spark');
            this.physics.add.existing(spark);
            const sparkBody = spark.body as Phaser.Physics.Arcade.Body;
            const angle = Phaser.Math.Between(0, 360);
            const speed = Phaser.Math.Between(100, 300);
            this.physics.velocityFromAngle(angle, speed, sparkBody.velocity);
            sparkBody.setCollideWorldBounds(true);
            sparkBody.setBounce(1, 1);
            sparkBody.setGravityY(300);

            // 一定時間後にスプライトを削除
            this.time.delayedCall(300, () => {
                spark.destroy();
            });
        }

        textBody.enable = false;
        bulletBody.enable = false;
        (text as Phaser.GameObjects.Text).setVisible(false);
        (bullet as Phaser.GameObjects.Arc).setVisible(false);
        this.score += (text as Phaser.GameObjects.Text).text.length * 10;
        this.scoreText?.setText("SCORE: " + this.score.toString());
        if (this.score >= this.scoreThreshold) {
            this.addBackgroundImage();
            this.scoreThreshold += 300;
        }
        clearInterval((text as CustomText).intervalID);
        clearTimeout((text as CustomText).timeoutID);
    };

    handleWorldBoundsCollision(body: Phaser.Physics.Arcade.Body) {
        if (body.gameObject) {
            (body.gameObject as Phaser.GameObjects.Arc).setVisible(false);
            body.enable = false;
        }
    }

    addBackgroundImage() {
        const upperTwoThirdsHeight = this.scale.height * 2 / 3;
        const newImage = this.add.sprite(
            Phaser.Math.Between(0, this.scale.width),
            Phaser.Math.Between(0, upperTwoThirdsHeight),
            'camome'
        );
        this.anims.create({
            key: 'camome_move',
            frames: this.anims.generateFrameNumbers('camome', { start: 0, end: 4 }),
            frameRate: 10,
            repeat: -1
        });
        newImage.anims.play('camome_move');

        newImage.setAlpha(0.5);
    }

    finish() {
        const currentSceneKey = this.scene.key;
        this.scene.pause(currentSceneKey);
        this.player?.requestPause();
        this.registry.set(currentSceneKey + '_score', this.score);
        this.registry.set('previousScene', currentSceneKey);
        this.scene.launch('Result');
    }
}
