import fs from 'fs';
import ts from 'typescript';
import { Project, ScriptTarget, Statement, StructureKind, Node } from "ts-morph";
import { openFileForWrite } from './io/FileWriter';
import { isGoogProvide } from './transformation/rules/goog-provide-rule';

const project = new Project({
    compilerOptions: {
      target: ScriptTarget.ESNext
    },
  });

let sourceFile = project.createSourceFile("../shaka-player-fork/lib/util/error.ts", 
    fs.readFileSync('../shaka-player-fork/lib/util/error.js', 'utf8'),
    {
        overwrite: true        
    });
    let toRemove: number | undefined;
    // sourceFile.getStatements().forEach((statement, index) => {
    //     if (statement.getText().includes('shaka.util.Error')) {
    //         toRemove = index;
    //     }
    // });
    if (toRemove) {
        sourceFile = sourceFile.removeStatement(toRemove);
    }
    
// sourceFile.transform(traversal => {
//     const node = traversal.visitChildren(); // return type is `ts.Node`
//     if (isGoogProvide(node)) {
//         toDelete = node;
//     }
//     // if (ts.isNumericLiteral(node)) {
//     //   const incrementedValue = parseInt(node.text, 10) + 1;
//     //   return ts.createNumericLiteral(incrementedValue.toString());
//     // }
//     return node;
// });
// sourceFile.getStatement()
sourceFile.save();
