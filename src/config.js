const jsSourceCodeExtensions = ['ts','js','mjs','cjs','hbs','map','jsx','tsx','vue','svelte','lock','promisify','es6','coffee'];
const dotnetSourceCodeExtensions = ['cs','cshtml','aspx','csproj'];
const phpSourceCodeExtensions = ['php'];
const goSourceCodeExtensions = ['go'];
const rustSourceCodeExtensions = ['rs'];
const webSourceCodeExtensions = ['html','htm','css','scss','less'];
const javaSourceCodeExtensions = ['java'];
const rubySourceCodeExtensions = ['rb'];
const cSourceCodeExtensions = ['c','cpp','h'];
const pythonSourceCodeExtensions = ['py'];
const scriptSourceCodeExtensions = ['cmd','bat','ps1','sh','applescript'];
const configExtensions = ['ini','cfg','config','yaml','yml','whitelist'];
const dataExtensions = ['csv','json','xml','sql','lcl','flow'];
const textExtensions = ['txt','markdown','md'];
const logExtensions = ['log'];


//TODO: find all file extensions of common programming languages / frameworks
function getTextFileExtensions(){
    return [
        ...jsSourceCodeExtensions, 
        ...dotnetSourceCodeExtensions, 
        ...phpSourceCodeExtensions, 
        ...goSourceCodeExtensions, 
        ...rustSourceCodeExtensions,
        ...webSourceCodeExtensions,
        ...javaSourceCodeExtensions,
        ...cSourceCodeExtensions,
        ...rubySourceCodeExtensions,
        ...pythonSourceCodeExtensions,
        ...scriptSourceCodeExtensions,
        ...configExtensions,
        ...dataExtensions,
        ...textExtensions,
        ...logExtensions,
    ];
}

function getTextFileExtensionsDictionary(){
    const res = {};
    for(const ext of getTextFileExtensions()){
        res[ext] = true;
    }
    return res;
}

export default {
    textFileExtensions:getTextFileExtensions(),
    textFileExtensionsDictionary:getTextFileExtensionsDictionary(),
    chunkSize:30,
    folderStructureIndexFile:'folders.idx'
}