import { defineConfig } from 'vite';

export default defineConfig({
    base: './',
    build: {
        assetsInlineLimit: 0,
        outDir: 'dist',
        assetsDir: 'assets',
    },
    base: '/Lyric_Shooter/',
});