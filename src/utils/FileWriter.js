import fs from 'fs';

export const openFileForWrite = (fileName) => {
    return fs.createWriteStream(fileName);
};

export const writeLine = (writerStream, line) => {
    writerStream.write(line);
    writerStream.write('\n');
};