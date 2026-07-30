import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import { globSync } from 'tinyglobby';
import fs from 'node:fs';
import path from 'node:path';

const manifestPath = path.resolve('public/build/manifest.json');
const DEFAULT_MODES = ['development', 'production'];
const APP_MODE = 'app';

/**
 * When building a single game, keep previous build output intact and merge
 * the freshly built manifest entries into the existing manifest.json instead
 * of letting Vite overwrite it (which would drop every other game's entry).
 */
function partialBuildManifestMergePlugin(isPartialBuild) {
    let previousManifest = {};

    return {
        name: 'partial-build-manifest-merge',
        apply: 'build',
        enforce: 'post',
        buildStart() {
            if (isPartialBuild && fs.existsSync(manifestPath)) {
                previousManifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
            }
        },
        closeBundle() {
            if (!isPartialBuild || !fs.existsSync(manifestPath)) {
                return;
            }
            const newManifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
            const mergedManifest = { ...previousManifest, ...newManifest };
            fs.writeFileSync(manifestPath, JSON.stringify(mergedManifest, null, 4));
        },
    };
}

export default defineConfig(({ command, mode }) => {
    // `vite build --mode app` builds only app.scss + app.js.
    const isAppOnlyBuild = command === 'build' && mode === APP_MODE;
    // `vite build --mode <game-slug>` builds only that game under resources/games/.
    const gameSlug = command === 'build' && !isAppOnlyBuild && !DEFAULT_MODES.includes(mode) ? mode : null;
    const isPartialBuild = isAppOnlyBuild || Boolean(gameSlug);

    let gameEntries = globSync('resources/games/*/index.js');

    if (gameSlug) {
        const targetEntry = `resources/games/${gameSlug}/index.js`;
        if (!fs.existsSync(targetEntry)) {
            throw new Error(`Không tìm thấy game "${gameSlug}" trong resources/games/.`);
        }
        gameEntries = [targetEntry];
    }

    let input = ['resources/scss/app.scss', 'resources/js/app.js', ...gameEntries];

    if (isAppOnlyBuild) {
        input = ['resources/scss/app.scss', 'resources/js/app.js'];
    } else if (gameSlug) {
        input = gameEntries;
    }

    return {
        plugins: [
            laravel({
                input,
                refresh: true,
            }),
            partialBuildManifestMergePlugin(isPartialBuild),
        ],
        css: {
            preprocessorOptions: {
                scss: {
                    quietDeps: true,
                    silenceDeprecations: ['import', 'global-builtin', 'color-functions'],
                },
            },
        },
        build: {
            emptyOutDir: !isPartialBuild,
        },
        server: {
            watch: {
                ignored: ['**/storage/framework/views/**'],
            },
        },
    };
});
