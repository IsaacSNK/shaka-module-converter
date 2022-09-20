import ts from 'typescript';

export const isGoogProvide = (node: ts.Node): boolean => {
    if (ts.isCallExpression(node)) {
        return node.expression.getText() === 'goog.provide';
    }
    return false;
};

export const convertGoogProvideToNamespace = (name: string, statements: ts.NodeArray<ts.Statement>) => {
    const exportModifier = ts.factory.createModifier(ts.SyntaxKind.ExportKeyword);
    return [ts.factory.createModuleDeclaration([exportModifier], 
        ts.factory.createIdentifier('shaka.util'), 
        ts.factory.createModuleBlock(statements), 
        ts.NodeFlags.Namespace)];
};