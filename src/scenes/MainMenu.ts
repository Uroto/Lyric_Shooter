import { Scene, GameObjects } from 'phaser';
import { IPlayerApp, IRenderingUnit, IWord, Player } from "textalive-app-api";

let ready = false;
const stage = Object.freeze({
    stage1: "1",
    stage2: "2",
    stage3: "3",
});

export class MainMenu extends Scene
{
    camera: Phaser.Cameras.Scene2D.Camera | undefined;
    text = ""
    isFullscreen: boolean = false;
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
        this.onAppReady = this.onAppReady.bind(this);
    }

    create ()
    {
        this.camera = this.cameras.main;
        this.camera.setBackgroundColor(0xb0c4de);

        this.player.addListener({
            onAppReady: this.onAppReady,
        });

        this.registry.set('player', this.player);   

        const button = `
            <button>
                次のシーンへ移動
            </button>
        `
        const select = `
            <select>
                <option value="" disabled selected style="display:none;">曲を選択してください</option>
                <option value="1">SUPERHERO / めろくる</option>
                <option value="2">いつか君と話したミライは / タケノコ少年</option>
                <option value="3">リアリティ / 歩く人</option>
            </select>
        `

        this.logo = this.add.image(950, 300, 'logo');
        this.button = this.add.dom(950, 600).createFromHTML(button);
        this.select = this.add.dom(950, window.innerHeight / 2).createFromHTML(select);
        const btn = document.querySelector('button');
        const sel = document.querySelector('select');

        this.add.text(10, 10, '＋')
                .setInteractive()
                .on('pointerup', () => {
                    if (this.isFullscreen) {
                        this.scale.stopFullscreen();
                    } else {
                        this.scale.startFullscreen();
                    }
                    this.isFullscreen = !this.isFullscreen;
                });

        btn?.addEventListener('click', () => {
            // if (ready) {
                if (this.player.video) {
                    try {
                        this.player.requestPause(); // まず一時停止
                        this.player.requestPlay();  // その後再生
                    } catch (error) {
                        console.error("再生エラー:", error);
                    }
                }
            // }

            switch (sel?.value){
                case stage.stage1:
                    this.scene.start('Game');
                    break;
                case stage.stage2:
                    this.scene.launch('GameOver');
                    break;
                case stage.stage3:
                    this.scene.start('Game');
                    break;
            }
        });

        sel?.addEventListener('change', () => {
            switch (sel.value){
                case stage.stage1:
                    this.player.createFromSongUrl("https://piapro.jp/t/hZ35/20240130103028");
                    break;
                case stage.stage2:
                    this.player.createFromSongUrl("https://piapro.jp/t/--OD/20240202150903")
                    break;
                case stage.stage3:
                    this.player.createFromSongUrl("https://piapro.jp/t/ELIC/20240130010349")
                    break;
            }
        });

        this.scale.on('resize', this.resize, this);
    }

    resize(gameSize: Phaser.Structs.Size) {
        const width = gameSize.width;
        const height = gameSize.height;

        // カメラのサイズを更新
        if (this.cameras.main) {
            this.cameras.main.setSize(width, height);
        }

        // ロゴの位置を更新
        if (this.logo) {
            this.logo.setPosition(width / 2, height / 4);
        }

        // ボタンの位置を更新
        if (this.button) {
            this.button.setPosition(width / 2, height / 2);
        }

        // セレクトボックスの位置を更新
        if (this.select) {
            this.select.setPosition(width / 2, height / 2 + 100);
        }
    }

    onAppReady(app: IPlayerApp) {
        if (!app.managed) {     
            this.player.video && this.player.requestPlay();
            ready = true;
        }
    }
}