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

    constructor ()
    {
        super('MainMenu');
    }

    preload ()
    {
        this.load.image('spaceship1', 'assets/spaceship1.png');
    }

    create ()
    {
        this.background = this.add.image(this.scale.width / 2, this.scale.height / 2, 'spaceship1');

        this.registry.set('player', this.player);

        this.registry.set('score', 0);

        const button = `
            <button class="button is-black" disabled>
                Play!
            </button>
        `
        const select = `
            <div class="select is-primary">
                <select>
                    <option value="" disabled selected style="display:none;">曲を選択してください</option>
                    <option value="1">SUPERHERO / めろくる</option>
                    <option value="2">いつか君と話したミライは / タケノコ少年</option>
                </select>
            </div>
        `

        this.logo = this.add.image(this.scale.width / 2, this.scale.height / 4, 'logo');
        this.select = this.add.dom(this.scale.width / 2, this.scale.height / 2).createFromHTML(select);
        this.button = this.add.dom(this.scale.width / 2, this.scale.height / 2 + this.scale.height / 8).createFromHTML(button);
        const sel = document.querySelector('select');
        const btn = document.querySelector('button');

        this.add.text(10, 10, '＋')
                .setInteractive()
                .on('pointerup', () => {
                    if (this.scale.isFullscreen) {
                        this.scale.stopFullscreen();
                    } else {
                        this.scale.startFullscreen();
                    }
                    this.scale.toggleFullscreen();
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
}