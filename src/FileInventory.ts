import fs from 'fs';
import path from 'path';
import { Project } from 'ts-morph';
import { fileURLToPath } from 'url';

export const generateFileInventory = (filePath: string, project: Project) => {
    let filesToAdd: string[] = [];
    if (!(fs.statSync(filePath).isDirectory())) {
        filesToAdd = [filePath];
    } else {
        filesToAdd = getAllFilesForDir(filePath);        
    }
    filesToAdd.forEach(file => {
        const fileName = removeFileExtension(file);
        const tsFile = `${fileName}.ts`;
        const jsFile = fs.readFileSync(`${fileName}.js`, 'utf8')
        project.createSourceFile(tsFile, jsFile, { overwrite: true });
    });
    return project.getSourceFiles();
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

const removeFileExtension = (file: string) => {
    return file.replace(/\.[^/.]+$/, "");
}
