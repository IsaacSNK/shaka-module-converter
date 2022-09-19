import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

export const generateFileInventory = (filePath) => {
    if (!(fs.statSync(filePath).isDirectory())) {
        return [filePath];
    } else {
        return getAllFilesForDir(filePath);
    }
};

const getAllFilesForDir = (dirPath, arrayOfFiles: Array<string> = []): Array<string> => {
    const files = fs.readdirSync(dirPath)
    arrayOfFiles = arrayOfFiles ?? []
    files.forEach(function (file) {
        if (fs.statSync(dirPath + "/" + file).isDirectory()) {
            arrayOfFiles = getAllFilesForDir(dirPath + "/" + file, arrayOfFiles)
        } else if (file.endsWith('.js')) {
            arrayOfFiles.push(path.join(dirPath, "/", file))
        }
    })
    return arrayOfFiles;
};