import colors from 'colors';
import fs from 'fs';
import { openFile, readLine } from './utils/AsyncFileReader.js';
import { convertToModuleId } from './utils/ConversionUtils.js';
import { openFileForWrite, writeLine } from './utils/FileWriter.js';
import { extractModuleName, isProvideDeclaration } from "./utils/LegacyModuleUtils.js";

const filePath = "../shaka-player-fork/lib/util/error.js";
const outFilePath = "../shaka-player-fork/lib/util/error.js.mod";

const processFile = async (file) => {
    const reader = await openFile(file);
    const writerStream = await openFileForWrite(outFilePath);
    while (reader.hasNextLine()) {
        const line = await readLine(reader);
        if (isProvideDeclaration(line)) {
            console.log(`goog.provide found`.blue);
            const moduleName = extractModuleName(line);
            const newLine = convertToModuleId(moduleName);
            writeLine(writerStream, newLine);
        } else {
            writeLine(writerStream, line);
        }
    }
};

(async () => {
    if (!fs.existsSync(filePath)) {
        console.log(`File ${filePath} not found`.red);
    }
    const fileInventory = [filePath];
    for (const file of fileInventory) {
        console.log(`Converting file: ${file}`.yellow);
        await processFile(file);        
    }
})();