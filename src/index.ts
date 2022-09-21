import fs from 'fs';
import { Project, ScriptTarget } from "ts-morph";
import { generateFileInventory } from './FileInventory';
import { transformAttributesExpression } from './transformation/TransformClassAttributes';
import { transformClassExpression } from './transformation/TransformClassExpression';
import { transformGoogProvideToNamespace } from './transformation/TransformGoogProvideToNamespace';

const basePath = '../shaka-player-fork/lib/util/error.js';

(async () => {
  const project = new Project({
    compilerOptions: {
      target: ScriptTarget.ES2022
    },
  });
  
  // Adds the discovered files in basePath to the project
  generateFileInventory(basePath, project).forEach(sourceFile => {
    transformGoogProvideToNamespace(sourceFile);
    transformClassExpression(sourceFile);
    transformAttributesExpression(sourceFile);
    sourceFile.save();
  });
})();

