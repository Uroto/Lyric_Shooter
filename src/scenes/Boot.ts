import { Scene } from 'phaser';

export class Boot extends Scene
{
    constructor ()
    {
        super('Boot');
    }

    preload ()
    {
        this.load.spritesheet('hachunemiku', 'assets/hachunemiku_sprite.png', { frameWidth: 512, frameHeight: 512 });
    }

    create ()
    {
        this.scene.start('Preloader');
    }
}
