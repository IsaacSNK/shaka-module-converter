import * as esprima from 'esprima';
import * as escodegen from 'escodegen';
import { readEntireFile } from './io/AsyncFileReader.js';

const applyRule = (node, metadata) => {
};

// For each file in source directory, 
    // - convert to typescript
    // - remove all goog.assert and google specific env variables
    // - use namespace
export const processFile = async (file) => {
    const fileContents = await readEntireFile(file);
    esprima.parseScript(fileContents, {}, (node, meta) => {
        console.log(escodegen.generate(node));
    });
};