import { Scene } from 'phaser';
import { Player } from 'textalive-app-api';

export class Result extends Scene
{
    camera: Phaser.Cameras.Scene2D.Camera | undefined;
    background: Phaser.GameObjects.Image | undefined;
    gameover_text : Phaser.GameObjects.Text | undefined;
    score: number | undefined;
    player: Player | undefined;

    constructor ()
    {
        super('Result');
    }

    create ()
    {
        this.background = this.add.image(window.innerWidth / 2, window.innerHeight / 2, 'background');
        this.background.setAlpha(0.5);

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
            this.scene.stop('Game');
            this.scene.stop('Result');

            if (this.player?.video) {
                try {
                    this.player.requestStop(); // まず一時停止
                    this.player.requestPlay();  // その後再生
                } catch (error) {
                    console.error("再生エラー:", error);
                }
            }
            this.registry.set('score', 0);
            this.scene.start('Game');
          });

          this.add.text(window.innerWidth / 2, window.innerHeight / 2 + 200, 'Back to Main Menu', {
            fontFamily: 'Arial', fontSize: 30, color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5)
          .setInteractive()
          .on('pointerdown', () => {
            this.scene.stop('Game');
            this.scene.stop('Result');
            this.scene.start('MainMenu');
          });

        // this.input.once('pointerdown', () => {

        //     this.scene.stop('Game');
        //     this.scene.stop('Result');
        //     this.scene.start('MainMenu');

        // });
    }
}
