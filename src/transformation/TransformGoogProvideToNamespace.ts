import ts, { CallExpression } from "typescript";
import { SourceFile, Node, ExpressionStatement } from "ts-morph"

const fileHeader = `/*! @license
* Shaka Player
* Copyright 2016 Google LLC
* SPDX-License-Identifier: Apache-2.0
*/`

export const transformGoogProvideToNamespace = (sourceFile: SourceFile): string => {
    const removeResult = removeGoogProvide(sourceFile);
    if (!removeResult) {
        throw new Error('Unable to find goog.provide statement');
    }
    let sourceText = sourceFile.getFullText();
    const headerRegex = /(.*)\n(.*Shaka Player)\n(.*)\n(.*2.0)\n(.*)\*\//;
    let replaced = false;
    sourceText = sourceText.replace(headerRegex, function(token){replaced = true; return '';});
    sourceText = sourceText.replace(new RegExp(removeResult.provideModuleName, 'g'), removeResult.className);

    sourceFile.removeText();
    sourceFile.addModule({
        isExported: true,
        name: removeResult.namespaceName,
        statements: sourceText,    
    });
    if(replaced){
        sourceFile.insertStatements(0,fileHeader)
    }
    return removeResult.namespaceName;
}

const removeGoogProvide = (sourceFile: SourceFile): Record<string, string> | undefined => {
    let googProvideModuleName: Record<string, string> | undefined = undefined;
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

const getGoogProvideModuleName = (node: ts.Node): Record<string, string> => {
    const expressionStatement = node as ts.ExpressionStatement;
    const argumentList = (expressionStatement.expression as CallExpression).arguments;
    const moduleName = argumentList[0].getText().replace(/\'/g, '');
    const parts = moduleName.split('.');
    return {
        provideModuleName: moduleName,
        namespaceName: parts.slice(0, parts.length - 1).join('.'),
        className: parts[parts.length - 1],
    };
};