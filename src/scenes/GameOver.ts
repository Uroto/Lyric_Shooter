import { Scene } from 'phaser';

export class GameOver extends Scene
{
    camera: Phaser.Cameras.Scene2D.Camera | undefined;
    background: Phaser.GameObjects.Image | undefined;
    gameover_text : Phaser.GameObjects.Text | undefined;

    constructor ()
    {
        super('GameOver');
    }

    create ()
    {
        this.camera = this.cameras.main
        this.camera.setBackgroundColor(0xff0000);

        this.background = this.add.image(window.innerWidth / 2, window.innerHeight / 2, 'background');
        this.background.setAlpha(0.5);

        this.gameover_text = this.add.text(window.innerWidth / 2, window.innerHeight / 2, 'Game Over', {
            fontFamily: 'Arial Black', fontSize: 64, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        });
        this.gameover_text.setOrigin(0.5);

        this.input.once('pointerdown', () => {

            this.scene.start('MainMenu');

        });
    }
}
