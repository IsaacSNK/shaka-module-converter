import { ClassDeclaration, ConstructorDeclaration, ConstructorTypeNode, IfStatement, MethodDeclaration, Node, ParameterDeclaration, SourceFile } from "ts-morph";
import ts, {PropertyAccessExpression, SyntaxKind } from "typescript";


export const transformAttributesExpression = (sourceFile: SourceFile) => {
    let classNodeList: Node[] = [];
    let methodNodeList: Node[] = [];
    let debugComments:any[][]=[];
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
                    propertyTypes[property[1]] = cleanProp(property[0]);
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
                type: cleanProp(parameterType)
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
     //remove comments
    sourceFile.forEachDescendant((node: Node<ts.Node>) => {
         if(ts.isIfStatement(node.compilerNode)){
            const other = (node as unknown as  IfStatement);
            other.remove()
           
        }
    });

};

const setParameterTypes=(methodNodeList: Node<ts.Node>[]) => {

    methodNodeList.forEach((method)=>{
        const MethodDeclaration = method as MethodDeclaration;
        const jsDocs = MethodDeclaration.getJsDocs()[0];
        let propertyTypes = new Object();
        let returnType;
        jsDocs.getTags().forEach((jsDoc) => {         
           if(jsDoc.getStructure().tagName ==='param'){
            const property = jsDoc.getStructure().text?.toString().split(' ');
              if(property!== undefined && property.length >= 2){
                    propertyTypes[property[1]] = cleanProp(property[0]);
             }
           }
           else if(jsDoc.getStructure().tagName ==='return'){
              returnType = cleanProp(jsDoc.getStructure().text?.toString());
           }
         });
      const methodParameters = MethodDeclaration.getParameters();
      //sets the type for each parameter if found in the js doc else set as any
      methodParameters.forEach((methodParam)=>{
        const parameterType = propertyTypes[methodParam.getName()];
            let finalParameterType:string = cleanProp(parameterType);
            if(finalParameterType.indexOf('?') == 0){
                finalParameterType = `${finalParameterType.replace('?','')}| undefined | null `
            }
            methodParam.setType(finalParameterType);
      })    
      //set the return type   
      returnType = formatReturnType(cleanProp(returnType));
      MethodDeclaration.setReturnType(returnType);
    })
}

const cleanProp=(prop:string | undefined)=>{
    let propertValue = prop !== undefined? prop.replace('!','').replace(/[\{\}]/g, "").replace('...*','any'):'any'
    return propertValue;
}

const formatReturnType=(returnType:string )=>{
    return returnType.replace('Promise.','Promise');
}
