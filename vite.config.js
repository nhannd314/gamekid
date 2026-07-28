import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import { globSync } from 'tinyglobby';

const gameEntries = globSync('resources/games/*/index.js');

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/scss/app.scss', 'resources/js/app.js', ...gameEntries],
            refresh: true,
        }),
    ],
    css: {
        preprocessorOptions: {
            scss: {
                quietDeps: true,
                silenceDeprecations: ['import', 'global-builtin', 'color-functions'],
            },
        },
    },
    server: {
        watch: {
            ignored: ['**/storage/framework/views/**'],
        },
    },
});
