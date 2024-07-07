import { Scene } from 'phaser';

export class VolumeModal extends Scene {
    constructor() {
        super({ key: 'VolumeModal' });
    }

    preload() {
        this.load.audio('test', 'assets/test.mp3');
    }

    create() {
        // 背景を半透明の黒に設定
        this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x000000, 0.5).setOrigin(0);

        const volume = `
            <div id="volume_change">
                <button class="button is-black">&times</button>
                <div class="volume_change_content">
                    <h2>音量調節</h2>
                    <input type="range" min="0" max="100" step="1" value="90" id="volumeSlider">
                </div>
            </div>
        `
        this.add.dom(this.scale.width / 2, this.scale.height / 2).createFromHTML(volume)
            .setOrigin(0.5);

        const volumeSlider = document.querySelector('#volumeSlider') as HTMLInputElement;

        const btn = document.querySelector('#volume_change > button');
        btn?.addEventListener('click', () => {
            this.scene.stop('VolumeModal');
            this.scene.start('MainMenu');
        });
        
        const testSound = this.sound.add('test');

        // スライダーの値が変わったときに音量を調節
        volumeSlider.addEventListener('input', () => {
            const mainMenu = this.scene.get('MainMenu') as any;
            mainMenu.player.volume = volumeSlider.value;

            // 音量を設定して音声を再生
            testSound.setVolume(parseFloat(volumeSlider.value) / 100);
            testSound.play();
        });
    }
}