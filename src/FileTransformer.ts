import * as ts from "typescript";
import { readEntireFile } from "./io/AsyncFileReader";
import { openFileForWrite, writeLine } from "./io/FileWriter";

const transformerFactory: ts.TransformerFactory<ts.Node> = (
    context: ts.TransformationContext
) => {
    return (rootNode) => {
        function visit(node: ts.Node): ts.Node {
            node = ts.visitEachChild(node, visit, context);

            // if (ts.isIdentifier(node)) {
            //     return ts.factory.createIdentifier(node.text + "suffix");
            // } else {
                return node;
            // }
        }

        return ts.visitNode(rootNode, visit);
    };
};

(async () => {
    const filename = "error.js";
    const outFilename = "error.ts";
    const inputPath = `../shaka-player-fork/lib/util/${filename}`;
    const outFilePath = `../shaka-player-fork/lib/util/${outFilename}`;
    const code = await readEntireFile(inputPath);
    const sourceFile = ts.createSourceFile(filename, code, ts.ScriptTarget.Latest);
    const transformationResult = ts.transform(sourceFile, [transformerFactory]);
    const transformedSourceFile = transformationResult.transformed[0];
    const printer = ts.createPrinter();
    const result = printer.printNode(
        ts.EmitHint.Unspecified,
        transformedSourceFile,
        sourceFile
    );
    openFileForWrite(outFilePath).write(result);
})();