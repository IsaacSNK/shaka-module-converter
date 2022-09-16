import colors from 'colors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { openFile, readLine } from './src/utils/AsyncFileReader.js';
import { extractDependencyName, extractModuleName, isProvideDeclaration, isRequireDeclaration } from './utils/LegacyModuleUtils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePath = "../shaka-player/lib";

const getFilesToProcess = (filePath) => {
    if (!(fs.statSync(filePath).isDirectory())) {
        return [filePath];
    } else {
        return getAllFilesForDir(filePath);
    }
};

const getAllFilesForDir = (dirPath, arrayOfFiles) => {
    const files = fs.readdirSync(dirPath)
    arrayOfFiles = arrayOfFiles || []
    files.forEach(function (file) {
        if (fs.statSync(dirPath + "/" + file).isDirectory()) {
            arrayOfFiles = getAllFilesForDir(dirPath + "/" + file, arrayOfFiles)
        } else if (file.endsWith('.js')) {
            arrayOfFiles.push(path.join(__dirname, dirPath, "/", file))
        }
    })
    return arrayOfFiles;
};

const createGraphFiles = (graph) => {
    const vertex = new Map();
    vertex.set(0, {
        id: 0,
        name: "Shaka"
    });
    const edgeArray = [];
    Array.from(graph.keys()).forEach((name, index) => {
        const id = index + 1;
        vertex.set(name, {
            id, 
            name,
            parent: 0
        });
        graph.get(name).forEach(dep => {
            dep.parent = id;
        });
    });
    Array.from(graph.values()).forEach((dependencies) => {
        dependencies.forEach(dep => {
            if (dep.parent === undefined) {
                console.log('Orphan!');
                dep.parent = 0;
            }
            edgeArray.push({
                target: dep.parent,
                source: vertex.get(dep.name).id
            });
        });
    });
    fs.writeFileSync('public/data/vertex.json', JSON.stringify(Array.from(vertex.values()), undefined, 4));
    fs.writeFileSync('public/data/edges.json', JSON.stringify(edgeArray, undefined, 4));
};

const processFile = async (file, graph) => {
    let moduleName = undefined;
    const reader = await openFile(file);
    while (reader.hasNextLine()) {
        const line = await readLine(reader);
        if (!moduleName && isProvideDeclaration(line)) {
            moduleName = extractModuleName(line);
            if (!graph.has(moduleName)) {
                graph.set(moduleName, new Array());
            }

        } else if (isRequireDeclaration(line) && moduleName) {
            const dependencyName = extractDependencyName(line);
            graph.get(moduleName).push({
                name: dependencyName                
            });
            if (!graph.has(dependencyName)) {
                graph.set(dependencyName, new Array());
            }
        }
    }
};

(async () => {
    if (!fs.existsSync(filePath)) {
        console.log(`File ${filePath} not found`.red);
    }
    const graph = new Map();
    const fileInventory = getFilesToProcess(filePath);
    for (const file of fileInventory) {
        console.log(`Processing file: ${file}`.yellow);
        await processFile(file, graph);        
    }
    createGraphFiles(graph);
})();