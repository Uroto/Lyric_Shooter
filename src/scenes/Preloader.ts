import { Scene } from 'phaser';

export class Preloader extends Scene
{
    constructor ()
    {
        super('Preloader');
    }

    init ()
    {
        this.cameras.main.setBackgroundColor('#C1E1E6');
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
        this.load.setPath('./assets');

        // select
        this.load.image('logo', 'logo.png');
        this.load.audio('test', 'test.mp3');

        // game common
        this.load.spritesheet('play', 'play.png', { frameWidth: 70, frameHeight: 70 });
        this.load.image('home', 'home.png');
        this.load.image('spark', 'spark.png');
        
        // stage1
        this.load.image('back_stage1', 'stage1_dot.png');
        this.load.spritesheet('rinren', 'rinren.png', { frameWidth: 256, frameHeight: 128 });
        this.load.spritesheet('camome', 'camome.png', { frameWidth: 64, frameHeight: 64 });

        // stage2
        this.load.image('negi', 'negi.png');
        this.load.image('back_stage2', 'stage2_dot.png');
        this.load.image('night-sky1', 'night-sky1.jpg');
        this.load.spritesheet('miku_fly', 'miku_fly.png', { frameWidth: 256, frameHeight: 128 });
        this.load.spritesheet('star', 'star.png', { frameWidth: 256, frameHeight: 256 });

        // stage3
        this.load.image('back_stage3', 'back_stage3.png');
        this.load.spritesheet('hachunemiku', 'hachunemiku_sprite.png', { frameWidth: 512, frameHeight: 512 });
    }

    create ()
    {
        this.scene.start('MainMenu');
    }
}
