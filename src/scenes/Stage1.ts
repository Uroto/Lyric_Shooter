import { Scene, GameObjects } from 'phaser';
import { IPlayerApp, IRenderingUnit, IWord, Player } from "textalive-app-api";

export class Stage1 extends Scene
{
    background: GameObjects.Image | undefined;
    background_scroll: Phaser.GameObjects.TileSprite | undefined;
    textObjects: Phaser.Physics.Arcade.Group | undefined;
    textObject: GameObjects.Text | undefined;
    text = ""
    previousText: string = "";
    player: Player | undefined;
    gamePlayer: GameObjects.Star | undefined;
    bullets: GameObjects.Group | undefined;
    isJumping: boolean = false;
    keySpace: Phaser.Input.Keyboard.Key | undefined;
    keyA: Phaser.Input.Keyboard.Key | undefined;
    keyD: Phaser.Input.Keyboard.Key | undefined;
    keyLeft: Phaser.Input.Keyboard.Key | undefined;
    keyRight: Phaser.Input.Keyboard.Key | undefined;
    score: number = 0;
    scoreText: GameObjects.Text | undefined;

    constructor ()
    {
        super('Stage1');
        this.animatedWord = this.animatedWord.bind(this);
    }

    create ()
    {
        this.background_scroll = this.add.tileSprite(0, 0, window.innerWidth, window.innerHeight, 'background')
            .setOrigin(0, 0);
        this.player = this.registry.get('player');

        this.bullets = this.physics.add.group();

        this.score = 0;
        this.scoreText = this.add.text(0, 10, "SCORE: " + this.score.toString(), {
            fontFamily: 'Arial', fontSize: 24, color: '#ffffff'
        });

        // テキストオブジェクトのグループを作成
        this.textObjects = this.physics.add.group();

        // 歌詞情報の準備
        this.prepareLyrics();

        this.gamePlayer = this.add.star(window.innerWidth - 50, window.innerHeight - 50, 5, 32, 64, 0xffff00, 1);
        this.physics.add.existing(this.gamePlayer);

        const gamePlayerBody = this.gamePlayer.body as Phaser.Physics.Arcade.Body;
        gamePlayerBody.setCollideWorldBounds(true);

        this.keySpace = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.keyA = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.keyD = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        this.keyLeft = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
        this.keyRight = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);

        this.physics.add.collider(this.gamePlayer, this.textObjects);
        this.physics.add.collider(this.bullets, this.textObjects, this.touch as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback, undefined, this);
        this.physics.world.on('worldbounds', (body: Phaser.Physics.Arcade.Body) => {
            if (this.bullets?.contains(body.gameObject)) {
                this.handleWorldBoundsCollision(body);
            }
        });

        this.add.text(200, 10, "FINISH", {fontFamily: 'Arial', fontSize: 24, color: '#ffffff'})
                .setInteractive()
                .on('pointerdown', () => {
                    this.scene.pause('Stage1');
                    this.player?.requestPause();
                    this.scene.launch('Result');
                    this.registry.set('score', this.score);
                });
        
        this.input.mouse?.disableContextMenu();
        this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            if (pointer.leftButtonDown()) {
                const bullet = this.add.circle(this.gamePlayer?.x, this.gamePlayer?.y, 10, 0xffff00, 1);
                this.physics.add.existing(bullet);
                this.bullets?.add(bullet);

                const bulletBody = bullet.body as Phaser.Physics.Arcade.Body;
                bulletBody.setVelocity(-300, 0);
                bulletBody.setCollideWorldBounds(true, 1, 1, true);
                bulletBody.allowGravity = false;
            } else if (pointer.rightButtonDown()) {
                const bullet = this.add.circle(this.gamePlayer?.x, this.gamePlayer?.y, 10, 0xffff00, 1);
                this.physics.add.existing(bullet);
                this.bullets?.add(bullet);

                const bulletBody = bullet.body as Phaser.Physics.Arcade.Body;
                bulletBody.setVelocity(300, 0);
                bulletBody.setCollideWorldBounds(true, 1, 1, true);
                bulletBody.allowGravity = false;
            }
        });

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

        // ゲームプレイヤーを移動させる
        if (this.keySpace?.isDown && !this.isJumping) {
            if (this.gamePlayer?.body) {
                this.gamePlayer.body.velocity.y = -500;
                this.isJumping = true;
            }
        }
        if (this.keyLeft?.isDown || this.keyA?.isDown) {
            if (this.gamePlayer?.body) {
                this.gamePlayer.body.velocity.x = -200;
            }
        }
        if (this.keyRight?.isDown || this.keyD?.isDown) {
            if (this.gamePlayer?.body) {
                this.gamePlayer.body.velocity.x = 200;
            }
        }

        if ((this.gamePlayer?.body as Phaser.Physics.Arcade.Body).blocked.down) {
            this.isJumping = false;
        }

        if (!this.player?.isPlaying) {
            this.scene.pause('Stage1');
            this.player?.requestPause();
            this.registry.set('score', this.score);
            this.scene.launch('Result');
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

    touch(bullet: GameObjects.GameObject, text: GameObjects.GameObject){
        const textBody = text.body as Phaser.Physics.Arcade.Body;
        const bulletBody = bullet.body as Phaser.Physics.Arcade.Body;
        textBody.enable = false;
        bulletBody.enable = false;
        (text as Phaser.GameObjects.Text).setVisible(false);
        (bullet as Phaser.GameObjects.Arc).setVisible(false);
        this.score += (text as Phaser.GameObjects.Text).text.length * 10;
        this.scoreText?.setText("SCORE: " + this.score.toString());
    };

    handleWorldBoundsCollision(body: Phaser.Physics.Arcade.Body) {
        if (body.gameObject) {
            (body.gameObject as Phaser.GameObjects.Arc).setVisible(false);
            body.enable = false;
        }
    }
}
