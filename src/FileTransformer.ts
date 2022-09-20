import ts, { SourceFile } from "typescript";
import { readEntireFile } from "./io/AsyncFileReader";
import { openFileForWrite, writeLine } from "./io/FileWriter";
import { GoogProvideToNamespace } from "./transformation/GoogProvideToNamespace";
import { convertGoogProvideToNamespace, isGoogProvide } from "./transformation/rules/goog-provide-rule";

// const transformerFactory: ts.TransformerFactory<ts.SourceFile> = (
//     context: ts.TransformationContext
// ) => {
//     const { factory } = context;
//     return (rootNode) => {
//         let googModuleId: string | undefined;
//         function visit(node: ts.Node): ts.Node {
//             node = ts.visitEachChild(node, visit, context);
//             if (isGoogProvide(node)) {
//                 googModuleId = 'shaka.util';                                
//             }
//             return node;
//         }
//         const result = ts.visitNode(rootNode, visit);
//         if (googModuleId) {
//             return factory.updateSourceFile(rootNode as SourceFile, 
//                 convertGoogProvideToNamespace(googModuleId, rootNode.statements));
//         }
//         return result;
        
//     };
// };

(async () => {
    const filename = "error.js";
    const outFilename = "error.ts";
    const inputPath = `../shaka-player-fork/lib/util/${filename}`;
    const outFilePath = `../shaka-player-fork/lib/util/${outFilename}`;
    const code = await readEntireFile(inputPath);
    const sourceFile = ts.createSourceFile(filename, code, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
    // const newCode = new GoogProvideToNamespace().transform(sourceFile);
    // const children = sourceFile.getChildren();
    // for (const node of sourceFile.getChildren()) {
    //     if (node.getText() === 'shaka.util.Error')
    //         console.log(node.getText());
    // }
    const transformationResult = ts.transform(sourceFile, [GoogProvideToNamespace]);
    const transformedSourceFile = transformationResult.transformed[0];
    const printer = ts.createPrinter();
    const result = printer.printNode(
        ts.EmitHint.Unspecified,
        transformedSourceFile,
        sourceFile
    );
    openFileForWrite(outFilePath).write(result);
})();