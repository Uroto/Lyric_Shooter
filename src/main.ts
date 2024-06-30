import { Boot } from './scenes/Boot';
import { Stage1 } from './scenes/Stage1';
import { Stage2 } from './scenes/Stage2';
import { Stage3 } from './scenes/Stage3';
import { Result } from './scenes/Result';
import { MainMenu } from './scenes/MainMenu';
import { Preloader } from './scenes/Preloader';

import { Game, Types } from "phaser";

//  Find out more information about the Game Config at:
//  https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig
const config: Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    parent: 'game-container',
    fullscreenTarget: 'game-container',
    backgroundColor: '#000000',
    scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: [
        Boot,
        Preloader,
        MainMenu,
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

export default new Game(config);