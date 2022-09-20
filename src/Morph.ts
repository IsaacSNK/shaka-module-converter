import fs from 'fs';
import { Project, ScriptTarget } from "ts-morph";
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

  sourceFile.save();
})();

