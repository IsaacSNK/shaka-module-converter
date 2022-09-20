import { ClassDeclaration, ConstructorDeclaration, ConstructorTypeNode, Node, ParameterDeclaration, SourceFile } from "ts-morph";
import ts, {PropertyAccessExpression, SyntaxKind } from "typescript";


export const transformAttributesExpression = (sourceFile: SourceFile) => {

    let classNodeList: Node[] = [];
    sourceFile.forEachDescendant((node: Node<ts.Node>) => {
        if (ts.isClassDeclaration(node.compilerNode)) {
            classNodeList.push(node);
            return;
        }
    });
    let constructor:ConstructorDeclaration ;
    let propertyTypes = new Object();
    classNodeList.forEach(function (classNode) {
        let propertyList:string[]=[]; 
        classNode.forEachDescendant((node: Node<ts.Node>)=>{
            if (ts.isConstructorDeclaration(node.compilerNode) && ts.hasJSDocParameterTags(node.compilerNode as ts.ConstructorDeclaration)) {
                constructor = (node as ConstructorDeclaration);
                const jsDocs = (node as ConstructorDeclaration).getJsDocs()[0];
                //get constructor param types
                jsDocs.getTags().forEach((jsDoc) => {         
                   const property = jsDoc.getStructure().text?.toString().split(' ');
                   if(property?.length === 2){
                    propertyTypes[property[1]] = property[0].replace(/[\{\}]/g, "").replace('...*','any');
                   }
                });
              }
            //get all properties 
            if(ts.isPropertyAccessExpression(node.compilerNode)){
                const propertyAccess =  (node.compilerNode as PropertyAccessExpression);
                const expressionKind = (propertyAccess.expression).kind;
                if(expressionKind === SyntaxKind.ThisKeyword){
                    const property = propertyAccess.name.escapedText.toString()
                    if (!propertyList.includes(property)) {
                        propertyList.push(property);
                      }
                }
            }
        });
        // insert property
        for(let i=0;i<propertyList.length;i++){
            const parameterType = propertyTypes[propertyList[i]];
            
            (classNode as ClassDeclaration).insertProperty(i,{
                isStatic: false,
                name: propertyList[i],
                type: parameterType!==undefined ? parameterType:'any'
              });
        }

      });
      //@ts-ignore
      constructor.getParameters().forEach((parameter) => {  
        const parameterType = propertyTypes[parameter.getName()];
        parameter.getName(); 
        if(parameterType!==undefined) {
            parameter.setType(parameterType);
        }
     });

};