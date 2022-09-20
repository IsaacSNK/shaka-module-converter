import ts, { CallExpression } from "typescript";
import { SourceFile, Node, ExpressionStatement } from "ts-morph"

const fileHeader = `/*! @license
* Shaka Player
* Copyright 2016 Google LLC
* SPDX-License-Identifier: Apache-2.0
*/`

export const transformGoogProvideToNamespace = (sourceFile: SourceFile): string => {
    const moduleName = removeGoogProvide(sourceFile);
    if (!moduleName) {
        throw new Error('Unable to find goog.provide statement');
    }
    let sourceText = sourceFile.getFullText();
    const headerRegex = /(.*)\n(.*Shaka Player)\n(.*)\n(.*2.0)\n(.*)\*\//;
    let replaced = false;
    sourceText = sourceText.replace(headerRegex, function(token){replaced = true; return '';});

    sourceFile.removeText();
    sourceFile.addModule({
        name: moduleName,
        statements: sourceText,    
    });
    if(replaced){
        sourceFile.insertStatements(0,fileHeader)
    }
    return moduleName;
}

const removeGoogProvide = (sourceFile: SourceFile): string | undefined => {
    let googProvideModuleName = '';
    const found = sourceFile.forEachDescendant((node: Node<ts.Node>) => {
        if (isGoogProvide(node.compilerNode)) {     
            const statement = node as ExpressionStatement;    
            googProvideModuleName = getGoogProvideModuleName(statement.compilerNode)
            statement.remove();
            return true;
        }
    });
    if (found) {
        return googProvideModuleName;
    }
    return undefined;
};

const isGoogProvide = (node: ts.Node): boolean => {
    if (ts.isExpressionStatement(node) && ts.isCallExpression(node.expression) && ts.isPropertyAccessExpression(node.expression?.expression)) {
        const propertyAccessExpression = node.expression?.expression;
        return propertyAccessExpression.getText() === 'goog.provide';
    }
    return false;
};

const getGoogProvideModuleName = (node: ts.Node): string => {
    const expressionStatement = node as ts.ExpressionStatement;
    const argumentList = (expressionStatement.expression as CallExpression).arguments;
    const moduleName = argumentList[0].getText().replace(/\'/g, '');
    const parts = moduleName.split('.');
    return parts.slice(0, parts.length - 1).join('.');
};