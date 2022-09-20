import { SourceFile } from "ts-morph";
import ts, { BinaryExpression, ClassExpression, ExpressionStatement, ExportKeyword } from "typescript";

export const transformClassExpression = (sourceFile: SourceFile) => {
    sourceFile.transform(traversal => {
        const factory = traversal.factory;
        const node = traversal.visitChildren(); 
        if (isClassExpression(node)) {
            return createClassNode(factory, node);
        }
        return node;
    })
};

const isClassExpression = (node: ts.Node): boolean => {
    if (ts.isExpressionStatement(node) && ts.isBinaryExpression(node.expression)) {
        const binaryExpression = node.expression;
        return ts.isClassExpression(binaryExpression.right);
    }
    return false;
};

const createClassNode = (factory: ts.NodeFactory, node: ts.Node): ClassExpression => {
    const originalExpression = ((node as ExpressionStatement).expression as BinaryExpression);
    const originalClassExpression = originalExpression.right as ClassExpression;
    const className = originalExpression.left.getText();
    const classNameParts = className.split('.');
    return factory.createClassExpression([ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)], 
        classNameParts[classNameParts.length - 1], 
        undefined, 
        undefined, 
        originalClassExpression.members);
}