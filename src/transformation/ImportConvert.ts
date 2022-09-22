import { ClassDeclaration, ConstructorDeclaration, ConstructorTypeNode, IfStatement, ImportClause, ImportDeclaration, MethodDeclaration, Node, ParameterDeclaration, SourceFile } from "ts-morph";
import ts, {PropertyAccessExpression, SyntaxKind } from "typescript";

export const fixImports = (sourceFile: SourceFile): void => {
    const headerRegex = /(.*)shaka-player\//;
    const filePath = sourceFile.getFilePath().replace(headerRegex,'');
    const filePathWithoutName = sourceFile.getDirectory().getPath().replace(headerRegex,'')
    const filePathSections = filePath.split('/')
    sourceFile.forEachDescendant((node: Node<ts.Node>) => {
        if (ts.isImportDeclaration(node.compilerNode)) {
           const importDeclaration = (node as  ImportDeclaration);
           let importPath = importDeclaration.getModuleSpecifierValue();
           importPath = importPath.replace(/(?<=\..*)\./g, '/');
           importPath = importPath.replace('dev-workspace/shaka-player-fork/','');
           const importPieces = importPath.replace('./','').split('/');
           let replaced =false;
           importPath = importPath.replace(filePathWithoutName, function(token){replaced = true; return '';});
           if(replaced){
            importDeclaration.setModuleSpecifier(importPath)
           }else{
            let importResult = './'
            for(let i=0;filePathSections.length-1>i;i++){
               if(importPieces[i]!==filePathSections[i]){
                 importResult= importResult+importPieces[i]+'/';
               }
               else{
                 importResult= importResult+'../';
               }
            }
            importResult = importResult+importPieces[importPieces.length-1];
            importDeclaration.setModuleSpecifier(importResult)
           }
        }
       
    });

}