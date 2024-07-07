import { Boot } from './scenes/Boot';
import { Stage1 } from './scenes/Stage1';
import { Stage2 } from './scenes/Stage2';
import { Stage3 } from './scenes/Stage3';
import { Result } from './scenes/Result';
import { MainMenu } from './scenes/MainMenu';
import { VolumeModal } from './scenes/VolumeModal';
import { Preloader } from './scenes/Preloader';

import { Game, Types } from "phaser";

const config: Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    parent: 'game-container',
    fullscreenTarget: 'game-container',
    backgroundColor: '#000000',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: [
        Boot,
        Preloader,
        MainMenu,
        VolumeModal,
        Stage1,
        Stage2,
        Stage3,
        Result
    ],
    dom: {
		createContainer: true
	},
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { x: 0, y: 300 },
            debug: false
        }
    },
};

const game = new Game(config);

export default game;