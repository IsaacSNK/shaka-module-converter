import { BinaryExpression, ClassDeclaration, Node, SourceFile, SyntaxKind } from "ts-morph";
import ts, { ClassExpression } from "typescript";

export const transformClassExpression = (sourceFile: SourceFile) => {
    const classesToConvert: BinaryExpression[] = getClassesToConvert(sourceFile);
    const nodePrinter = ts.createPrinter();
    const classMap = new Map<string, ClassExpression>();
    classesToConvert.forEach(binaryExpression => {
        const newNode = createClassNode(ts.factory, binaryExpression.compilerNode);
        classMap.set(newNode.name?.text ?? 'unknown', newNode);
        const nodeText = nodePrinter.printNode(ts.EmitHint.Unspecified, newNode, sourceFile.compilerNode);
        sourceFile.replaceText([binaryExpression.getStart(), binaryExpression.getEnd()], nodeText);
    });
    //declareStaticFields(sourceFile, classMap);
};

const getClassesToConvert = (sourceFile: SourceFile): BinaryExpression[] => {
    const result: BinaryExpression[] = [];
    sourceFile.forEachDescendant(node => {
        if (isClassExpression(node)) {
            const classBinaryExpression = node.getParent();
            if (classBinaryExpression) {
                result.push(classBinaryExpression as BinaryExpression);
            }            
        }
    });
    return result;
}

const isClassExpression = (node: Node<ts.Node>): boolean => {
    return node.getKind() === SyntaxKind.ClassExpression 
            && node.getParent()?.getKind() === SyntaxKind.BinaryExpression
            && node.getParent()?.getParent()?.getKind() === SyntaxKind.ExpressionStatement
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

const declareStaticFields = (sourceFile: SourceFile, classMap: Map<string, ClassExpression>) => {
    sourceFile.forEachChild(child => {
        const classRefered = isStaticFieldDeclaration(child.compilerNode, classMap);
        if (classRefered) {

        }
    });
}

const isStaticFieldDeclaration = (node: ts.Node, classMap: Map<string, ClassExpression>): ClassExpression | undefined => {
    if (ts.isExpressionStatement(node) && ts.isBinaryExpression(node.expression) && ts.isPropertyAccessExpression(node.expression.left)) {
        const leftSide = node.expression.left.expression as ts.PropertyAccessExpression;
        return classMap.get(leftSide.name.getText());
    }
    return undefined;
}