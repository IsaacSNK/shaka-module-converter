import fs from 'fs';
import { ClassDeclaration, ConstructorDeclaration, Project, ScriptTarget, ts } from "ts-morph";
import { transformClassExpression } from './transformation/TransformClassExpression';
import { transformGoogProvideToNamespace } from './transformation/TransformGoogProvideToNamespace';

(async () => {
  const project = new Project({
    compilerOptions: {
      target: ScriptTarget.ES2022
    },
  });

  const sourceFile = project.createSourceFile("../shaka-player-fork/lib/util/error.ts", 
    fs.readFileSync('../shaka-player-fork/lib/util/error.js', 'utf8'),
    { overwrite: true });

  transformGoogProvideToNamespace(sourceFile);
  transformClassExpression(sourceFile);

  // sourceFile.forEachDescendant((node) => {
  //   if (ts.isConstructorDeclaration(node.compilerNode) && ts.hasJSDocParameterTags(node.compilerNode as ts.ConstructorDeclaration)) {
  //     const jsDocs = (node as ConstructorDeclaration).getJsDocs();
  //     jsDocs.forEach((jsDoc) => {
  //       console.log(jsDoc);
  //     });
  //     // node.compilerNode.parameters.forEach((param) => {
  //     //   const jsDocs = ts.getJSDocParameterTags(param);
  //     //   console.log(jsDocs);
  //     // });
  //   }
  // })

  sourceFile.save();
})();

