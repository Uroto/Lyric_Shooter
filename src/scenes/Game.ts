import { Scene } from 'phaser';

export class Game extends Scene
{
    camera: Phaser.Cameras.Scene2D.Camera | undefined;
    background: Phaser.GameObjects.Image | undefined;
    msg_text : Phaser.GameObjects.Text | undefined;

    constructor ()
    {
        super('Game');
    }

    create ()
    {
        this.input.once('pointerdown', () => {

            this.scene.launch('GameOver');

        });
    }
}
