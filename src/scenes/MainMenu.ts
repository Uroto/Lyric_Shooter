import { Scene, GameObjects } from 'phaser';
import { IPlayerApp, IRenderingUnit, IWord, Player } from "textalive-app-api";

let ready = false;
let text = "test"

export class MainMenu extends Scene
{
    background: GameObjects.Image | undefined;
    logo: GameObjects.Image | undefined;
    title: GameObjects.Text | undefined;
    textObjects: Phaser.GameObjects.Text[] = [];
    textObject: GameObjects.Text | undefined;
    isFullscreen: boolean = false;
    previousText: string = "";

    constructor ()
    {
        super('MainMenu');
    }

    create ()
    {
        // this.background = this.add.image(window.innerWidth / 2, window.innerHeight / 2, 'background');

        // this.logo = this.add.image(window.innerWidth / 2, window.innerHeight / 2, 'logo');

        // this.title = this.add.text(window.innerWidth / 2, window.innerHeight / 2, 'Main Menu', {
        //     fontFamily: 'Arial Black', fontSize: 38, color: '#ffffff',
        //     stroke: '#000000', strokeThickness: 8,
        //     align: 'center'
        // }).setOrigin(0.5);

        this.add.text(10, 10, '＋')
                .setInteractive()
                .on('pointerup', () => {
                    alert("クリック");
                    if (this.isFullscreen) {
                        this.scale.stopFullscreen();
                    } else {
                        this.scale.startFullscreen();
                    }
                    this.isFullscreen = !this.isFullscreen;
                });

        this.add.text(50, 10, "再生")
                .setInteractive()
                .on('pointerup', () => {
                    alert("再生");
                    if (ready) {
                        if (player.video) {
                            try {
                                player.requestPause(); // まず一時停止
                                player.requestPlay();  // その後再生
                            } catch (error) {
                                console.error("再生エラー:", error);
                            }
                        }
                    }
                });
        this.textObject = this.add.text(50, 10, text, {
            fontFamily: 'Arial', fontSize: 24, color: '#ffffff'
        });

        if (this.textObject) {
            // テキストオブジェクトを物理エンティティとして追加
            this.physics.add.existing(this.textObject);

            // 物理プロパティを設定
            const textBody = this.textObject.body as Phaser.Physics.Arcade.Body;
            textBody.setCollideWorldBounds(true);
            textBody.setVelocity(100, 200); // 任意の速度を設定
            textBody.setBounce(1, 1); // 反発係数を設定

            // 初期のテキストオブジェクトをリストに追加
            this.textObjects.push(this.textObject);
        }
        
        // this.input.once('pointerdown', () => {

        //     this.scene.start('Game');
            
        // });
    }

    update(time: number, delta: number): void {
        if (text !== this.previousText) {
            // 新しいテキストオブジェクトを作成して追加
            const newTextObject = this.add.text(50, 10 + this.textObjects.length * 30, text, {
                fontFamily: 'Arial', fontSize: 24, color: '#ffffff'
            });

            // 新しいテキストオブジェクトを物理エンティティとして追加
            this.physics.add.existing(newTextObject);

            // 物理プロパティを設定
            const newTextBody = newTextObject.body as Phaser.Physics.Arcade.Body;
            newTextBody.setCollideWorldBounds(true);
            newTextBody.setVelocity(100, 200); // 任意の速度を設定
            newTextBody.setBounce(1, 1); // 反発係数を設定

            // 新しいテキストオブジェクトをリストに追加
            this.textObjects.push(newTextObject);

            // 前回のテキストを更新
            this.previousText = text;
        }
    }


}

// 単語が発声されていたら #text に表示する
// Show words being vocalized in #text
const animateWord = function (now: number, unit: IRenderingUnit) {
    const word = unit as IWord;
    if (word.contains(now)) {
      document.querySelector("#text")!.textContent = word.text;
      text = word.text;
    }
};
   
// TextAlive Player を作る
// Instantiate a TextAlive Player instance
const player = new Player({
    app: {
        token: "j2L2DUexqaXONLyI",
    },
    mediaElement: document.querySelector("#media") as HTMLElement,
});

player.addListener({
    onAppReady,
    onVideoReady,
});

function onAppReady(app: IPlayerApp) {
    if (!app.managed) {     
        ready = true;
        player.video && player.requestPlay();
    }
    if (!app.songUrl) {
        player.createFromSongUrl("https://piapro.jp/t/--OD/20240202150903");
    }
}

function onVideoReady() {
    // メタデータを表示する
    // Show meta data
   //  artistSpan.textContent = player.data.song.artist.name;
   //  songSpan.textContent = player.data.song.name;
   
    // 定期的に呼ばれる各単語の "animate" 関数をセットする
    // Set "animate" function
    let w: IWord = player.video.firstWord;
    while (w) {
        w.animate = animateWord;
        w = w.next;
    }
}