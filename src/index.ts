import fs from 'fs';
import { Project, ScriptTarget } from "ts-morph";
import { generateFileInventory } from './FileInventory';
import { fixImports } from './transformation/ImportConvert';


const basePath = '../shaka-player-fork/lib/util/config_utils.ts';

(async () => {
  const project = new Project({
    compilerOptions: {      target: ScriptTarget.ES2022
    },
  });
  
  // Adds the discovered files in basePath to the project
  generateFileInventory(basePath, project).forEach(sourceFile => {
    fixImports(sourceFile);
    sourceFile.save();
  });
})();

