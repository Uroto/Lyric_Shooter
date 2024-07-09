import { defineConfig } from 'vite';

export default defineConfig({
    base: '/Lyric_Shooter/',
    build: {
        assetsInlineLimit: 0,
        outDir: 'dist',
        assetsDir: 'assets',
    },
});