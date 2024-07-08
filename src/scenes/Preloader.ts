import { Scene } from 'phaser';

export class Preloader extends Scene
{
    constructor ()
    {
        super('Preloader');
    }

    init ()
    {
        this.cameras.main.setBackgroundColor('#ffffff');
        this.add.text(this.scale.width / 2, this.scale.height / 2 + this.scale.height / 3, 'Loading...', {
            fontFamily: 'mihiPixelmoji', fontSize: 40, color: '#000000'
        });
        const loader = this.add.sprite(this.scale.width / 2, this.scale.height / 2, 'hachunemiku');
        this.anims.create({
            key: 'load_swing',
            frames: this.anims.generateFrameNumbers('hachunemiku', { start: 4, end: 7 }),
            frameRate: 10,
            repeat: -1,
        });
        loader.anims.play('load_swing');
    }

    preload ()
    {
        //  Load the assets for the game - Replace with your own assets
        this.load.setPath('/assets');

        this.load.image('logo', 'logo.png');

        this.load.spritesheet('play', 'play.png', { frameWidth: 70, frameHeight: 70 });
        this.load.image('home', 'home.png');
    }

    create ()
    {
        setTimeout(() => {
            this.scene.start('MainMenu');
        }, 3000);
    }
}
