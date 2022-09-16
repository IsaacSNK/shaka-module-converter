import * as lineReader from 'line-reader';

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