import { Scene } from 'phaser';
import { Player } from 'textalive-app-api';

export class Result extends Scene
{
    camera: Phaser.Cameras.Scene2D.Camera | undefined;
    background: Phaser.GameObjects.Graphics | undefined;
    gameover_text : Phaser.GameObjects.Text | undefined;
    bonus_text: Phaser.GameObjects.Text | undefined;
    score: number | undefined;
    player: Player | undefined;

    constructor ()
    {
        super('Result');
    }

    create ()
    {
        this.background = this.add.graphics()
                                  .fillStyle(0x000000, 1)
                                  .fillRoundedRect(window.innerWidth / 4, window.innerHeight / 4, window.innerWidth / 2, window.innerHeight / 2, 20)
                                  .setAlpha(0.8);

        this.player = this.registry.get('player');
        this.score = this.registry.get('score');

        this.add.text(window.innerWidth / 2, window.innerHeight / 2, 'Score: ' + this.score?.toString(), {
            fontFamily: 'Arial', fontSize: 60, color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);

        this.add.text(window.innerWidth / 2, window.innerHeight / 2 + 100, 'Click to continue', {
            fontFamily: 'Arial', fontSize: 30, color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5)
          .setInteractive()
          .on('pointerdown', () => {
            this.scene.stop('Stage1');
            this.scene.stop('Stage2');
            this.scene.stop('Stage3');
            this.scene.stop('Result');

            if (this.player?.video) {
                this.player.requestStop();
                this.player.requestPlay();
            }

            const previousScene = this.registry.get('previousScene');
            this.scene.start(previousScene);
            this.registry.set('score', 0);
            this.registry.set('previousScene', 'Result');
        });

        this.add.text(window.innerWidth / 2, window.innerHeight / 2 + 200, 'Back to Main Menu', {
            fontFamily: 'Arial', fontSize: 30, color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5)
          .setInteractive()
          .on('pointerdown', () => {
            this.scene.stop('Stage1');
            this.scene.stop('Stage2');
            this.scene.stop('Stage3');
            this.scene.stop('Result');
            this.scene.start('MainMenu');
        });

        const previousScene = this.registry.get('previousScene');
        const max_score = this.registry.get('max_score');
        if (this.score && previousScene !== 'Stage3' && this.score >= max_score * 0.9) {
            this.bonus_text = this.add.text(window.innerWidth / 2, window.innerHeight / 2 + 300, 'Bonus Stage!!', {
                fontFamily: 'Arial', fontSize: 60, color: '#ffffff',
                align: 'center'
                
            }).setOrigin(0.5)
              .setActive(false)
              .setAlpha(0.5)
              .setInteractive()
              .on('pointerdown', () => {
                    this.player?.requestStop(); // まず一時停止
                    this.player?.requestPlay();  // その後再生

                    this.scene.stop('Stage1');
                    this.scene.stop('Stage2');
                    this.scene.stop('Stage3');
                    this.scene.stop('Result');
                    this.scene.start('Stage3');
            });
        }

        const songUrl = "https://piapro.jp/t/ELIC/20240130010349";
        this.player?.createFromSongUrl(songUrl)
                    .then(() => {
                        this.bonus_text?.setActive(true);
                        this.bonus_text?.setAlpha(1);
                    });
    }
}
