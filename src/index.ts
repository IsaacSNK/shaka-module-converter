import * as Colors from 'colors.ts';
import fs from 'fs';
import { generateBoilerplate } from './boilerplate/Boilerplate';
import { processFile } from './FileConverter';
import { generateFileInventory } from './FileInventory';
import { openFile, readLine } from './io/AsyncFileReader';
import { openFileForWrite, writeLine } from './io/FileWriter';

Colors.enable();

const inputPath = "../shaka-player-fork/lib/util/error.js";
const outFilePath = "../shaka-player-fork/lib/util/error.ts";

const convertFiles = (): Promise<string | void> => {
    return new Promise(async (resolve, reject) => {
        try {
            const filesToProcess = await generateFileInventory(inputPath);
            for (const file of filesToProcess) {
                await processFile(file);
            }
            resolve();
        } catch (error) {
            reject(error);
        }
    });
};

(async () => {
    try {
        // await generateBoilerplate();
        // await convertFiles();
        // console.log('All tasks completed'.green);

    } catch (e) { 
        console.error(`Conversion failed: ${e}`.red);
    }
})();