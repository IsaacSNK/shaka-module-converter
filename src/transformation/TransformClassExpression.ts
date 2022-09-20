import { Node, SourceFile } from "ts-morph";
import ts, { BinaryExpression, ClassExpression, ExpressionStatement } from "typescript";

export const transformClassExpression = (sourceFile: SourceFile) => {
    sourceFile.transform(traversal => {
        const factory = traversal.factory;
        const node = traversal.visitChildren(); 
        if (isClassExpression(node)) {
            return createClassNode(factory, node);
        }
        return node;
    })
    sourceFile.forEachDescendant((node: Node<ts.Node>) => {
        if (ts.isClassExpression(node.compilerNode)) {
            console.log('here');
        }
    });
};

const isClassExpression = (node: ts.Node): boolean => {
    if (ts.isExpressionStatement(node) && ts.isBinaryExpression(node.expression)) {
        const binaryExpression = node.expression;
        return ts.isClassExpression(binaryExpression.right);
    }
    return false;
};

const createClassNode = (factory: ts.NodeFactory, node: ts.Node): ClassExpression => {
    const originalExpression = ((node as ExpressionStatement).expression as BinaryExpression).right as ClassExpression;
    return factory.createClassExpression([], 'Error', undefined, undefined, originalExpression.members);
}