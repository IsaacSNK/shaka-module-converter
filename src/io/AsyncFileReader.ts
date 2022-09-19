import * as lineReader from 'line-reader';
import fs from 'fs';

export const openFile = (file) => {
    return new Promise((resolve, reject) => {
        lineReader.open(file, (err, reader) => {
            if (!err) {
                resolve(reader);
            } else {
                reject(err);
            }
        });
    });
}

export const readLine = (reader) => {
    return new Promise((resolve, reject) => {
        reader.nextLine(function(err, line) {
            if (!err) {
                resolve(line);
            } else {
                reject(err);
            }
        });
    });
};

export const readEntireFile = (file): Promise<string> => {
    return new Promise((resolve, reject) => {
        fs.readFile(file, 'utf8', (err, data) => {
            if (!err) {
                resolve(data);
            } else {
                reject(err);
            }
        });
    });
};