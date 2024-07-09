import { Scene, GameObjects } from 'phaser';
import { IRenderingUnit, IWord, Player } from "textalive-app-api";

export class Stage2 extends Scene
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
    keyW: Phaser.Input.Keyboard.Key | undefined;
    keyA: Phaser.Input.Keyboard.Key | undefined;
    keyS: Phaser.Input.Keyboard.Key | undefined;
    keyD: Phaser.Input.Keyboard.Key | undefined;
    score: number = 0;
    scoreText: GameObjects.Text | undefined;
    play: GameObjects.Sprite | undefined;
    home: GameObjects.Image | undefined;
    isPaused: boolean = false;
    scoreThreshold: number = 100;

    constructor ()
    {
        super('Stage2');
        this.animatedWord = this.animatedWord.bind(this);
    }


    create ()
    {
        this.background_scroll = this.add.tileSprite(0, 0, this.scale.width, this.scale.height, 'back_stage2')
            .setOrigin(0, 0)
            .setAlpha(0.9);
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
                this.scene.stop('Stage2');
                this.scene.start('MainMenu');
            });

        this.bullets = this.physics.add.group();

        this.score = 0;
        this.scoreText = this.add.text(20, 10, "SCORE: " + this.score.toString(), {
            fontFamily: 'mihiPixelmoji', fontSize: 40, color: '#ffffff'
        }).setStroke('#000000', 3);;

        // テキストオブジェクトのグループを作成
        this.textObjects = this.physics.add.group();

        // 歌詞情報の準備
        this.prepareLyrics();

        this.gamePlayer = this.add.sprite(1500, 500, 'miku_fly');
        this.physics.add.existing(this.gamePlayer);

        this.anims.create({
            key: 'miku_left',
            frames: [ { key: 'miku_fly', frame: 0 } ],
            frameRate: 10,
        });

        this.anims.create({
            key: 'miku_right',
            frames: [ { key: 'miku_fly', frame: 1 } ],
            frameRate: 10,
        });

        this.gamePlayer.anims.play('miku_left');

        // 重力の影響を受けないように設定
        const gamePlayerBody = this.gamePlayer.body as Phaser.Physics.Arcade.Body;
        gamePlayerBody.allowGravity = false;
        gamePlayerBody.setCollideWorldBounds(true);
        gamePlayerBody.setDrag(200, 200)
        gamePlayerBody.setFriction(0.5);

        this.keyW = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        this.keyA = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.keyS = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        this.keyD = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.D);

        this.physics.add.collider(this.gamePlayer, this.textObjects);
        this.physics.add.collider(this.bullets, this.textObjects, this.touch as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback, undefined, this);
        this.physics.world.on('worldbounds', (body: Phaser.Physics.Arcade.Body) => {
            const gameObject = body.gameObject;
            if (gameObject){
                if (this.bullets?.contains(gameObject) || this.textObjects?.contains(gameObject)) {
                    this.handleWorldBoundsCollision(body);
                }
            }
        });

        this.input.mouse?.disableContextMenu();
        this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            if (pointer.leftButtonDown()) {
                
                if (this.gamePlayer?.anims.currentAnim?.key === 'miku_left') {
                    const bullet = this.add.image((this.gamePlayer?.x ?? 0) - (this.gamePlayer?.width ?? 0) / 2, this.gamePlayer?.y ?? 0, 'negi');
                    this.physics.add.existing(bullet);
                    this.bullets?.add(bullet);

                    const bulletBody = bullet.body as Phaser.Physics.Arcade.Body;
                    bulletBody.setCollideWorldBounds(true, 1, 1, true);
                    bulletBody.allowGravity = false;
                    bulletBody.setVelocity(-300, 0);
                } else {
                    const bullet = this.add.image((this.gamePlayer?.x ?? 0) + (this.gamePlayer?.width ?? 0) / 2, this.gamePlayer?.y ?? 0, 'negi');
                    this.physics.add.existing(bullet);
                    this.bullets?.add(bullet);

                    const bulletBody = bullet.body as Phaser.Physics.Arcade.Body;
                    bulletBody.setCollideWorldBounds(true, 1, 1, true);
                    bulletBody.allowGravity = false;
                    bulletBody.setVelocity(300, 0);
                }
            }
        });

    }

    update(): void {
        // 背景をスクロールさせる
        if (this.background_scroll && !this.isPaused) {
            this.background_scroll.tilePositionX += 1; // X方向にスクロール
        }

        if (this.text !== this.previousText) {
            const offset = this.scale.height / 12;
            const randomHeight = offset + Math.random() * (this.scale.height - 2 * offset);
            const newTextObject = this.add.text(50, randomHeight, this.text, {
                fontFamily: 'maruikoasu', fontSize: 40, color: '#ffff00'
            });

            // 新しいテキストオブジェクトを物理エンティティとして追加
            this.physics.add.existing(newTextObject);
            this.textObjects?.add(newTextObject);

            // 物理プロパティを設定
            const newTextBody = newTextObject.body as Phaser.Physics.Arcade.Body;
            newTextBody.setCollideWorldBounds(true, 1, 1, true);
            newTextBody.setVelocity(200, 0); // 任意の速度を設定
            newTextBody.setBounce(0.8 - this.text.length * 0.05); // 反発係数を設定 
            newTextBody.allowGravity = false;

            // 前回のテキストを更新
            this.previousText = this.text;
        }

        if (!this.isPaused) {
            if (this.keyW?.isDown) {
                if (this.gamePlayer?.body) {
                    this.gamePlayer.body.velocity.y = -200;
                }
            }
            if (this.keyA?.isDown) {
                if (this.gamePlayer?.body) {
                    this.gamePlayer.body.velocity.x = -200;
                    this.gamePlayer.anims.play('miku_left');
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
                    this.gamePlayer.anims.play('miku_right');
                }
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
            this.scoreThreshold += 100;
        }
    };

    handleWorldBoundsCollision(body: Phaser.Physics.Arcade.Body) {
        const gameObject = body.gameObject;
        if (gameObject) {
            (gameObject as Phaser.GameObjects.Arc).setVisible(false);
            body.enable = false;
        }
    }

    addBackgroundImage() {
        const upperTwoThirdsHeight = this.scale.height * 2 / 3;
        const newImage = this.add.sprite(
            Phaser.Math.Between(0, this.scale.width),
            Phaser.Math.Between(0, upperTwoThirdsHeight),
            'star'
        );
        this.anims.create({
            key: 'star_move',
            frames: this.anims.generateFrameNumbers('star', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1,
            repeatDelay: 2000
        });
        newImage.anims.play('star_move');

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
