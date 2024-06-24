import { Scene, GameObjects } from 'phaser';
import { IPlayerApp, IRenderingUnit, IWord, Player } from "textalive-app-api";

let ready = false;
let text = ""

export class MainMenu extends Scene
{
    background: GameObjects.Image | undefined;
    background_scroll: Phaser.GameObjects.TileSprite | undefined;
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
        this.background_scroll = this.add.tileSprite(0, 0, window.innerWidth, window.innerHeight, 'background')
            .setOrigin(0, 0);

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
                });

        const button = `
            <button disabled>
                次のシーンへ移動
            </button>
        `
        this.add.dom(500, 10).createFromHTML(button);

        const btn = document.querySelector('button');
        btn?.addEventListener('click', () => {
            this.scene.start('Game');
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

        const select = `
        <select>
            <option value="" disabled selected style="display:none;">曲を選択してください</option>
            <option value="https://piapro.jp/t/hZ35/20240130103028">SUPERHERO / めろくる</option>
            <option value="https://piapro.jp/t/--OD/20240202150903">いつか君と話したミライは / タケノコ少年</option>
            <option value="https://piapro.jp/t/ELIC/20240130010349">リアリティ / 歩く人</option>
        </select>
        `
        this.add.dom(500, 500).createFromHTML(select);
        const sel = document.querySelector('select');
        sel?.addEventListener('change', () => {
            player.createFromSongUrl(sel.value);
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
    }

    update(time: number, delta: number): void {
        // 背景をスクロールさせる
        if (this.background_scroll) {
            this.background_scroll.tilePositionX += 1; // X方向にスクロール
            this.background_scroll.tilePositionY += 0.5; // Y方向にスクロール（必要に応じて調整）
        }
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

        if (ready) {
            const btn = document.querySelector('button');
            btn?.removeAttribute('disabled');
        }
    }


}

// 単語が発声されていたら #text に表示する
// Show words being vocalized in #text
const animateWord = function (now: number, unit: IRenderingUnit) {
    const word = unit as IWord;
    if (word.contains(now)) {
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
        player.video && player.requestPlay();
        ready = true;
    }
    // if (!app.songUrl) {
    //     player.createFromSongUrl("https://piapro.jp/t/--OD/20240202150903");
    // }
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