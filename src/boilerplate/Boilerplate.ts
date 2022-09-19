import fs from 'fs';
import colors from 'colors.ts';
import { exec } from 'child_process';
import { resolve } from 'path';

const BASE_DIR = '/Users/isaac/dev-workspace/shaka-player-typescript';

export const generateBoilerplate = async () => {
    await cleanup();
    await createBaseDirectory();
    await generatePackageJson();
    await initializeTypescriptProject();
};

const cleanup = (): Promise<void> => {
    console.log('Cleaning up existing files'.yellow);
    return new Promise((resolve, reject) => {
        fs.rm(BASE_DIR, { recursive: true }, (err) => {
            if (err) {
                console.warn('Nothing to cleanup'.red);
                resolve();
            } else {
                console.warn('Cleanup done'.green);
                resolve();
            }
        });
    });
};

const createBaseDirectory = (): Promise<string | void> => {
    console.log(`Generating base directory ${BASE_DIR}`.yellow);
    return new Promise((resolve, reject) => {
        fs.mkdir(BASE_DIR, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
};

const generatePackageJson = (): Promise<string | void> => {
    console.log('Generating package.json'.yellow);
    return new Promise((resolve, reject) => {
        const callback = (err) => {
            if (err) {
                reject(`Failed to generate package.json: ${err}`);
            } else {
                resolve();
            }
        };
        fs.writeFile(`${BASE_DIR}/package.json`, JSON.stringify({
            "name": "shaka-player",
            "description": "DASH/EME video player library",
            "version": "4.2.0",
            "homepage": "https://github.com/shaka-project/shaka-player",
            "author": "Google",
            "maintainers": [
                {
                    "name": "Joey Parrish",
                    "email": "joeyparrish@google.com"
                }
            ],
            "devDependencies": {
                "@babel/core": "^7.17.5",
                "@babel/polyfill": "^7.12.1",
                "@babel/preset-env": "^7.16.11",
                "@teppeis/clutz": "^1.0.29-4c95e12.v20190929",
                "awesomplete": "^1.1.5",
                "babel-plugin-istanbul": "^6.1.1",
                "cajon": "^0.4.4",
                "code-prettify": "^0.1.0",
                "color-themes-for-google-code-prettify": "^2.0.4",
                "core-js": "^3.21.1",
                "dialog-polyfill": "^0.5.6",
                "es6-promise-polyfill": "^1.2.0",
                "eslint": "^8.9.0",
                "eslint-config-google": "^0.14.0",
                "eslint-plugin-shaka-rules": "file:./build/eslint-plugin-shaka-rules",
                "esprima": "^4.0.1",
                "fontfaceonload": "^1.0.2",
                "google-closure-compiler-java": "^20220301.0.0",
                "google-closure-deps": "https://gitpkg.now.sh/google/closure-library/closure-deps?d7736da6",
                "google-closure-library": "^20220301.0.0",
                "htmlhint": "^1.1.3",
                "jasmine-ajax": "^4.0.0",
                "jimp": "^0.16.1",
                "js-yaml": "^4.1.0",
                "jsdoc": "github:joeyparrish/jsdoc#2ca85bb6",
                "karma": "^6.3.16",
                "karma-babel-preprocessor": "^8.0.2",
                "karma-coverage": "^2.2.0",
                "karma-jasmine": "^4.0.1",
                "karma-jasmine-ajax": "^0.1.13",
                "karma-local-wd-launcher": "^1.6.1",
                "karma-opera-launcher": "^1.0.0",
                "karma-sourcemap-loader": "^0.3.8",
                "karma-spec-reporter": "^0.0.34",
                "karma-webdriver-launcher": "^1.0.8",
                "less": "https://gitpkg.now.sh/joeyparrish/less.js/packages/less?28c63a43",
                "less-plugin-clean-css": "github:austingardner/less-plugin-clean-css#4e9e77bf",
                "material-design-lite": "^1.3.0",
                "mux.js": "^6.2.0",
                "open-sans-fonts": "^1.6.2",
                "postcss-less": "^6.0.0",
                "pwacompat": "^2.0.17",
                "rimraf": "^3.0.2",
                "sprintf-js": "^1.1.2",
                "ssim.js": "^3.5.0",
                "stylelint": "^14.5.1",
                "stylelint-config-standard": "^25.0.0",
                "tippy.js": "^4.3.5",
                "which": "^2.0.2"
            },
            "shakaCustom": {
                "purposeOfDemoDeps": "These are the files from node_modules that need to be deployed with the demo app.",
                "demoDeps": [
                    "awesomplete/awesomplete.css",
                    "awesomplete/awesomplete.min.js",
                    "dialog-polyfill/dialog-polyfill.css",
                    "dialog-polyfill/dist/dialog-polyfill.js",
                    "eme-encryption-scheme-polyfill/index.js",
                    "es6-promise-polyfill/promise.min.js",
                    "google-closure-library/closure/goog/base.js",
                    "less/dist/less.js",
                    "material-design-lite/dist/material.indigo-blue.min.css",
                    "material-design-lite/dist/material.min.js",
                    "mux.js/dist/mux.min.js",
                    "popper.js/dist/umd/popper.min.js",
                    "pwacompat/pwacompat.min.js",
                    "tippy.js/umd/index.min.js",
                    "tippy.js/index.css"
                ]
            },
            "main": "dist/shaka-player.compiled.js",
            "repository": {
                "type": "git",
                "url": "https://github.com/shaka-project/shaka-player.git"
            },
            "bugs": {
                "url": "https://github.com/shaka-project/shaka-player/issues"
            },
            "license": "Apache-2.0",
            "scripts": {
                "prepublishOnly": "python build/checkversion.py && python build/all.py --force"
            },
            "dependencies": {
                "eme-encryption-scheme-polyfill": "^2.1.1"
            },
            "engines": {
                "node": ">=14"
            }
        }, null, 4), callback);
    });
};

const initializeTypescriptProject = (): Promise<string | void> => {
    console.log('Generating tsconfig.json'.yellow);
    return new Promise((resolve, reject) => {
        const callback = (err) => {
            if (err) {
                reject(`Failed to generate package.json: ${err}`);
            } else {
                resolve();
            }
        };
        fs.writeFile(`${BASE_DIR}/tsconfig.json`, JSON.stringify({
            "compilerOptions": {
                "declaration": true,
                "outDir": "./dist/",
                "target": "ESNext",
                "module": "commonjs",
                "esModuleInterop": true,
                "forceConsistentCasingInFileNames": true,
                "strict": true,
                "skipLibCheck": true,
            }
        }, null, 4), callback);
    });
};