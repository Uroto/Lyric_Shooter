import { Scene, GameObjects } from 'phaser';
import { IPlayerApp, IRenderingUnit, IWord, Player } from "textalive-app-api";

const stage = Object.freeze({
    stage1: "1",
    stage2: "2",
    stage3: "3",
});

export class MainMenu extends Scene
{
    background: Phaser.GameObjects.Image | undefined;
    text = ""
    previousText: string = "";
    player: Player = new Player({
        app: {
            token: "j2L2DUexqaXONLyI",
        },
        mediaElement: document.querySelector("#media") as HTMLElement,
    });
    logo: Phaser.GameObjects.Image | undefined;
    button: Phaser.GameObjects.DOMElement | undefined;
    select: Phaser.GameObjects.DOMElement | undefined;
    fullscreen: Phaser.GameObjects.Sprite | undefined;
    trophy: Phaser.GameObjects.Image | undefined;
    volume: Phaser.GameObjects.Image | undefined;

    constructor ()
    {
        super('MainMenu');
    }

    preload ()
    {
        this.load.image('spaceship1', 'assets/spaceship1.png');
        this.load.image('trophy', 'assets/trophy.png');
        this.load.image('volume', 'assets/volume.png');
        this.load.spritesheet('fullscreen', 'assets/fullscreen.png', { frameWidth: 100, frameHeight: 100 });
    }

    create ()
    {
        this.background = this.add.image(this.scale.width / 2, this.scale.height / 2, 'spaceship1');

        this.registry.set('player', this.player);

        let score_list;
        if (this.registry.get('score_list')){
            score_list = this.registry.get('score_list');
        } else {
            score_list = [];
        }
        const sc_stage1 = this.registry.get('Stage1_score');
        const sc_stage2 = this.registry.get('Stage2_score');
        const sc_stage3 = this.registry.get('Stage3_score');

        if (sc_stage1 !== undefined || sc_stage2 !== undefined || sc_stage3 !== undefined) {
            const score = [sc_stage1, sc_stage2, sc_stage3];
            score_list.push(score);
        }
        this.registry.set('score_list', score_list);
        this.registry.set('Stage1_score', undefined);
        this.registry.set('Stage2_score', undefined);
        this.registry.set('Stage3_score', undefined);

        const button = `
            <button class="button is-black" disabled>
                Play!
            </button>
        `
        const select = `
            <div class="select is-primary">
                <select>
                    <option value="" disabled selected style="display:none;">曲を選択してください</option>
                    <option value="1">SUPERHERO / めろくる [stage1]</option>
                    <option value="2">いつか君と話したミライは / タケノコ少年 [stage2]</option>
                </select>
            </div>
        `

        this.logo = this.add.image(this.scale.width / 2, this.scale.height / 4, 'logo');
        this.select = this.add.dom(this.scale.width / 2, this.scale.height / 2).createFromHTML(select);
        this.button = this.add.dom(this.scale.width / 2, this.scale.height / 2 + this.scale.height / 8).createFromHTML(button);
        const sel = document.querySelector('select');
        const btn = document.querySelector('button');

        this.trophy = this.add.image(3 * this.scale.width / 4, 4 * this.scale.height / 5, 'trophy')
                        .setInteractive()                      
                        .setAlpha(0.8);
        this.hover(this.trophy);
        this.trophy.on('pointerup', () => {
            this.scene.pause('MainMenu');
            this.scene.launch('ScoreModal');
            this.disableDOMElements();
        });
        
        this.volume = this.add.image(3 * this.scale.width / 4 + 150, 4 * this.scale.height / 5, 'volume')
                    .setInteractive()
                    .setAlpha(0.8);
        this.hover(this.volume);
        this.volume.on('pointerup', () => {
            this.scene.pause('MainMenu');
            this.scene.launch('VolumeModal');
            this.disableDOMElements();
        });

        this.fullscreen = this.add.sprite(3 * this.scale.width / 4 + 300, 4 * this.scale.height / 5, 'fullscreen')
                            .setInteractive()
                            .setAlpha(0.8);
        this.hover(this.fullscreen);
        
        this.anims.create({
            key: 'expand',
            frames: [ { key: 'fullscreen', frame: 0 } ],
            frameRate: 1,
        });

        this.anims.create({
            key: 'compress',
            frames: [ { key: 'fullscreen', frame: 1 } ],
            frameRate: 1,
        });

        this.fullscreen?.on('pointerup', () => {
            if (this.scale.isFullscreen) {
                this.scale.stopFullscreen();
                this.fullscreen?.anims.play('expand');
            } else {
                this.scale.startFullscreen();
                this.fullscreen?.anims.play('compress');
            }
            this.scale.toggleFullscreen();
        });

        this.scale.on('leavefullscreen', () => {
            this.fullscreen?.anims.play('expand');
        });

        btn?.addEventListener('click', () => {
            if (this.player.video) {
                this.player.requestStop(); // まず一時停止
                this.player.requestPlay();  // その後再生
            }

            switch (sel?.value){
                case stage.stage1:
                    this.scene.stop('Stage1');
                    this.scene.stop('Stage2');
                    this.scene.stop('Stage3');
                    this.scene.stop('MainMenu');
                    this.scene.start('Stage1');
                    break;
                case stage.stage2:
                    this.scene.stop('Stage1');
                    this.scene.stop('Stage2');
                    this.scene.stop('Stage3');
                    this.scene.stop('MainMenu');
                    this.scene.start('Stage2');
                    break;
                default:
                    break;
            }
        });

        sel?.addEventListener('change', () => {
            switch (sel.value){
                case stage.stage1:
                    if (btn) {
                        this.preparePlay("https://piapro.jp/t/hZ35/20240130103028", btn, sel);
                    }
                    break;
                case stage.stage2:
                    if (btn) {
                        this.preparePlay("https://piapro.jp/t/--OD/20240202150903", btn, sel);
                    }
                    break;
                default:
                    break;
            }
        });

        this.events.on('resume', this.enableDOMElements);
    }

    preparePlay(songUrl:string, btn:HTMLButtonElement, sel:HTMLSelectElement) {
        btn.disabled = true;
        sel.disabled = true;
        this.player.createFromSongUrl(songUrl)
                    .then(() => {
                        btn.removeAttribute('disabled');
                        sel.removeAttribute('disabled');
                    });
    }

    hover(obj: Phaser.GameObjects.GameObject){
        obj.on('pointerover', function (this: Phaser.GameObjects.Image | Phaser.GameObjects.Sprite) {
            this.setAlpha(1);
        })
           .on('pointerout', function (this: Phaser.GameObjects.Image | Phaser.GameObjects.Sprite) {
            this.setAlpha(0.8);
        });
    }

    disableDOMElements() {
        const btn = document.querySelector('button');
        const sel = document.querySelector('select');
        if (btn) btn.disabled = true;
        if (sel) sel.disabled = true;
    }

    enableDOMElements() {
        const btn = document.querySelector('button');
        const sel = document.querySelector('select');
        if (btn) btn.disabled = false;
        if (sel) sel.disabled = false;
    }
}