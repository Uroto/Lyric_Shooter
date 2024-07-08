/// <reference types="vite/client" />
import Phaser from 'phaser';

interface ImportMetaEnv {
    readonly TEXT_ALIVE_API_KEY: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}

interface CustomText extends Phaser.GameObjects.Text {
    intervalID?: number;
    timeoutID?: number;
}