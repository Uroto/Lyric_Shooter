import { Scene } from 'phaser';
import { Player } from 'textalive-app-api';

export class Result extends Scene
{
    camera: Phaser.Cameras.Scene2D.Camera | undefined;
    background: Phaser.GameObjects.Graphics | undefined;
    backToMainMenu_text : Phaser.GameObjects.Text | undefined;
    bonus_text: Phaser.GameObjects.Text | undefined;
    score: number | undefined;
    player: Player | undefined;

    constructor ()
    {
        super('Result');
    }

    create ()
    {   
        const bgWidth = this.scale.width / 2;
        const bgHeight = this.scale.height / 2;
        const bgX = this.scale.width / 4;
        const bgY = this.scale.height / 4;

        this.background = this.add.graphics()
                                  .fillStyle(0x000000, 1)
                                  .fillRoundedRect(bgX, bgY, bgWidth, bgHeight, 20)
                                  .setAlpha(0.8);

        this.player = this.registry.get('player');

        const previousScene = this.registry.get('previousScene');
        
        this.score = this.registry.get(previousScene + '_score');

        this.add.text(bgX + bgWidth / 2, bgY + bgHeight / 4, 'FINISH!!', {
            fontFamily: 'mihiPixelmoji', fontSize: 100, color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);

        this.add.text(bgX + bgWidth / 2, bgY + bgHeight / 2, 'Score: ' + this.score?.toString(), {
            fontFamily: 'mihiPixelmoji', fontSize: 50, color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);

        const max_score = this.registry.get('max_score');
        if (this.score !== undefined && previousScene !== 'Stage3' && this.score >= max_score * 0.9) {
            this.bonus_text = this.add.text(bgX + 3 * bgWidth / 4, bgY + 3 * bgHeight / 4, 'Bonus Stage!!', {
                fontFamily: 'mihiPixelmoji', fontSize: 30, color: '#ffffff',
                align: 'center'
                
            }).setOrigin(0.5)
              .setActive(false)
              .setAlpha(0.5)
              .setInteractive();

            const underline = this.underline(this.bonus_text);
            
            this.bonus_text?.on('pointerdown', () => {
                    this.player?.requestStop(); // まず一時停止
                    this.player?.requestPlay();  // その後再生

                    this.scene.stop('Stage1');
                    this.scene.stop('Stage2');
                    this.scene.stop('Stage3');
                    this.scene.stop('Result');
                    this.scene.start('Stage3');
            })
              .on('pointerover', function (this: Phaser.GameObjects.Text) {
                underline.setVisible(true);
            })
              .on('pointerout', function (this: Phaser.GameObjects.Text) {
                underline.setVisible(false);
            });
        }

        let backToMainMenueX;
        if (this.bonus_text && previousScene !== 'Stage3'){
            backToMainMenueX = bgX + bgWidth / 4;
        } else {
            backToMainMenueX = bgX + bgWidth / 2;
        }
        this.backToMainMenu_text = this.add.text(backToMainMenueX, bgY + 3 * bgHeight / 4, 'Back to Main Menu', {
            fontFamily: 'mihiPixelmoji', fontSize: 30, color: '#ffffff',
        }).setOrigin(0.5)
          .setInteractive();
        
        const underline = this.underline(this.backToMainMenu_text);

        this.backToMainMenu_text?.on('pointerdown', () => {
            this.scene.stop('Stage1');
            this.scene.stop('Stage2');
            this.scene.stop('Stage3');
            this.scene.stop('Result');
            this.scene.start('MainMenu');
        })
          .on('pointerover', function (this: Phaser.GameObjects.Text) {
            underline.setVisible(true);
        })
          .on('pointerout', function (this: Phaser.GameObjects.Text) {
            underline.setVisible(false);
        });

        const songUrl = "https://piapro.jp/t/ELIC/20240130010349";
        this.player?.createFromSongUrl(songUrl)
                    .then(() => {
                        this.bonus_text?.setActive(true);
                        this.bonus_text?.setAlpha(1);
                    });
    }

    underline(text: Phaser.GameObjects.Text): Phaser.GameObjects.Graphics {
        const underline = this.add.graphics();
        underline.lineStyle(3, 0xffffff, 1);
        underline.moveTo(text.x - text.width / 2, text.y + text.height / 2 + 5);
        underline.lineTo(text.x + text.width / 2, text.y + text.height / 2 + 5);
        underline.strokePath();
        underline.setVisible(false);

        return underline;
    }
}
