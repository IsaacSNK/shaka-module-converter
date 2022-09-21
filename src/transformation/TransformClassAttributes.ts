import { ClassDeclaration, ConstructorDeclaration, ConstructorTypeNode, MethodDeclaration, Node, ParameterDeclaration, SourceFile } from "ts-morph";
import ts, {PropertyAccessExpression, SyntaxKind } from "typescript";


export const transformAttributesExpression = (sourceFile: SourceFile) => {

    let classNodeList: Node[] = [];
    let methodNodeList: Node[] = [];
    sourceFile.forEachDescendant((node: Node<ts.Node>) => {
        if (ts.isClassDeclaration(node.compilerNode)) {
            classNodeList.push(node);
        }
        else if(ts.isMethodDeclaration(node.compilerNode)){
            methodNodeList.push(node);
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
                   if(property!== undefined && property.length >= 2){
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
      if(constructor !==undefined){
        constructor.getParameters().forEach((parameter) => {  
            const parameterType = propertyTypes[parameter.getName()];
            parameter.getName(); 
            if(parameterType!==undefined) {
                parameter.setType(parameterType);
            }
         });
      }
     setParameterTypes(methodNodeList);
};

const setParameterTypes=(methodNodeList: Node<ts.Node>[]) => {

    methodNodeList.forEach((method)=>{
        const MethodDeclaration = method as MethodDeclaration;
        const jsDocs = MethodDeclaration.getJsDocs()[0];
        let propertyTypes = new Object();
        jsDocs.getTags().forEach((jsDoc) => {         
           if(jsDoc.getStructure().tagName ==='param'){
            const property = jsDoc.getStructure().text?.toString().split(' ');
              if(property!== undefined && property.length >= 2){
                    propertyTypes[property[1]] = property[0].replace(/[\{\}]/g, "").replace('...*','any');
             }
           }
         });
      const methodParameters = MethodDeclaration.getParameters();
      methodParameters.forEach((methodParam)=>{
        const parameterType = propertyTypes[methodParam.getName()];
            let finalParameterType:string = parameterType !== undefined? parameterType.replace('!',''): 'any';
            if(finalParameterType.indexOf('?') == 0){
                finalParameterType = `${finalParameterType.replace('?','')}| undefined | null `
            }
            methodParam.setType(finalParameterType);
      })

    })

}
