import ts from 'typescript';

export const GoogProvideToNamespace: ts.TransformerFactory<ts.SourceFile> = (
    context: ts.TransformationContext
) => {
    const { factory } = context;
    return (rootNode) => {
        let googModuleId: string | undefined;
        function visit(node: ts.Node): ts.Node {
            node = ts.visitEachChild(node, visit, context);
            if (isGoogProvide(node)) {
                googModuleId = 'shaka.util';                                
            }
            return node;
        }
        const result = ts.visitNode(rootNode, visit);
        if (googModuleId) {
            return factory.updateSourceFile(rootNode as ts.SourceFile, convertGoogProvideToNamespace(googModuleId, result.statements));
        }
        return result;
        
    };
};

const isGoogProvide = (node: ts.Node): boolean => {
    if (ts.isCallExpression(node)) {
        return node.expression.getText() === 'goog.provide';
    }
    return false;
};

const convertGoogProvideToNamespace = (name: string, statements: ts.NodeArray<ts.Statement>) => {
    const exportModifier = ts.factory.createModifier(ts.SyntaxKind.ExportKeyword);
    return [ts.factory.createModuleDeclaration([exportModifier], 
        ts.factory.createIdentifier('shaka.util'), 
        ts.factory.createModuleBlock(statements), 
        ts.NodeFlags.Namespace)];
};