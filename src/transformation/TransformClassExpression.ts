import { ClassDeclaration, SourceFile, SyntaxKind, Node, BinaryExpression, printNode} from "ts-morph";
import ts, { ClassExpression, ExportKeyword } from "typescript";

export const transformClassExpression = (sourceFile: SourceFile) => {
    // sourceFile.transform(traversal => {
    //     const factory = traversal.factory;
    //     const node = traversal.visitChildren(); 
    //     if (isClassExpression(node)) {
    //         return createClassNode(factory, node);
    //     }
    //     return node;
    // })
    const classesToConvert: BinaryExpression[] = [];

    sourceFile.forEachDescendant(node => {
        if (isClassExpressionToConvert(node)) {
            const classBinaryExpression = node.getParent();
            if (classBinaryExpression) {
                classesToConvert.push(classBinaryExpression as BinaryExpression);
            }            
        }
    });

    classesToConvert.forEach(binaryExpression => {
        const newNode = createClassNode(ts.factory, binaryExpression.compilerNode);
        sourceFile.replaceText([binaryExpression.getStart(), binaryExpression.getEnd()], 
            ts.createPrinter().printNode(ts.EmitHint.Unspecified, newNode, sourceFile.compilerNode));
        // binaryExpression.getParent()?.transform(traversal => {
        //     const factory = traversal.factory;
        //     const node = traversal.visitChildren(); 
        //     if (node.kind === SyntaxKind.BinaryExpression) {
        //         return createClassNode(factory, node);
        //     }
        //     return node;
        // });
        // binaryExpression.replaceWithText('let a = 1 + 1;');
        // const jsDocs = expressionStatement.getJsDocs();
        // const newNode = binaryExpression.transform(traversal => {
        //     return traversal.visitChildren();
        //     // const transformed = createClassNode(traversal.factory, traversal.currentNode);
        //     // return transformed;
        // }) as ClassDeclaration;
        // newNode.addJsDoc(jsDocs[0].getInnerText());

        // expressionStatement.getParent().insertClass(positionFromParent, {
        //     isExported: true,
        //     name: 'test'
        // });
        // sourceFile.removeStatement(expressionStatement.pos);
        // createClass
        // expressionStatement.replaceWithText(expressionStatement.getFullText());
    });
};

const isClassExpressionToConvert = (node: Node<ts.Node>): boolean => {
    return node.getKind() === SyntaxKind.ClassExpression 
            && node.getParent()?.getKind() === SyntaxKind.BinaryExpression
            && node.getParent()?.getParent()?.getKind() === SyntaxKind.ExpressionStatement
};

const isClassExpression = (node: ts.Node): boolean => {
    if (ts.isExpressionStatement(node) && ts.isBinaryExpression(node.expression)) {
        const binaryExpression = node.expression;
        return ts.isClassExpression(binaryExpression.right);
    }
    return false;
};

const createClassNode = (factory: ts.NodeFactory, node: ts.Node): ClassExpression => {
    const originalExpression = node as ts.BinaryExpression;
    const originalClassExpression = originalExpression.right as ClassExpression;
    const className = originalExpression.left.getText();
    return factory.createClassExpression([ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)], 
        className, 
        undefined, 
        undefined, 
        originalClassExpression.members);
}