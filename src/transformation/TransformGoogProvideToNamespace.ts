import ts, { CallExpression } from "typescript";
import { SourceFile, Node, ExpressionStatement } from "ts-morph"

export const transformGoogProvideToNamespace = (sourceFile: SourceFile) => {
    const moduleName = removeGoogProvide(sourceFile);
    if (!moduleName) {
        throw new Error('Unable to find goog.provide statement');
    }
    const sourceText = sourceFile.getFullText();
    sourceFile.removeText();
    sourceFile.addModule({
        name: moduleName,
        statements: sourceText,    
    });
}

const removeGoogProvide = (sourceFile: SourceFile): string | undefined => {
    let googProvideModuleName = '';
    let nodeToRemove: ExpressionStatement | undefined = undefined;
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
    return argumentList[0].getText().replace(/\'/g, '');
};