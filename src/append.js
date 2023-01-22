import path from 'path';

import { asyncMkdir, asyncCopyFile, asyncWriteFile, asyncStat, objectifyFile, uuidNoDashes, getAllFiles, asyncExists, yellow, green, red, blue, createSpinner, ProgressBar } from './common.js';
import Config from './config.js';

export async function buildFolderTreeIndex(allFiles, sourceFolder, targetFolder){
    const result = new Set(allFiles.map(file => path.dirname(file).replace(sourceFolder, '')));
    await asyncWriteFile(`${targetFolder}/${Config.folderStructureIndexFile}`, JSON.stringify(Array.from(result)));
}

export function divideBinariesAndTextFiles(files){
    const res = {
        binaries:[],
        texts:[]
    }
    for(const file of files){
        if(isBinaryNaive(file)){
            res.binaries.push(file);
        }else{
            res.texts.push(file);
        }
    }
    return res;
}

async function getChunkSize(filePaths){
    const stats = await Promise.all(filePaths.map((filePath => asyncStat(filePath))));
    const totalSize = stats.reduce((acc, stat) => acc += stat.size, 0);
    return totalSize;
}

//https://www.npmjs.com/package/cli-progress
export async function append(sourceFolder, targetFolder, volumeThreshold){
    console.time('Append files');
    try{
        const dividedFiles = await beforeAppend(sourceFolder, targetFolder);
        await handleTextFiles(sourceFolder, dividedFiles.texts, targetFolder, volumeThreshold);
        await handleBinaryFiles(dividedFiles.binaries, sourceFolder, targetFolder);
        yellow(`DONE`);
    }catch(e){
        red(e);
    }
    console.timeEnd('Append files');
}

async function beforeAppend(sourceFolder, targetFolder){
    const targetFolderExists = await asyncStat(targetFolder);
    if(!targetFolderExists){
        yellow(`Create target folder ${targetFolder}`);
        asyncMkdir(targetFolder, {recursive: true});
    }

    const spinner = createSpinner('Analyzing source folder files...');
    const allFiles = await getAllFiles(sourceFolder);
    await buildFolderTreeIndex(allFiles, sourceFolder, targetFolder);
    const dividedFiles = divideBinariesAndTextFiles(allFiles);
    spinner.stop();
    green(`Text files: ${dividedFiles.texts.length}, binary files: ${dividedFiles.binaries.length}`);
    // console.log(`extensions found: ${Array.from(new Set(allFiles.map(f => path.extname(f).replace('.',''))))}`);

    return dividedFiles;
}

async function handleTextFiles(sourceFolder, textFiles, targetFolder, volumeThreshold){
    const byteThreshold = 1 * 1024 * 1024 * volumeThreshold * 0.75; //base64 is ~133% size of 1 byte, thus need to compensate
    
    let accumulator = 0;
    let chunkFileObjects = [];
    let progressBarCounter = 0;
    let volumeIndex = 0;
    
    const progressBar = new ProgressBar('Appending text files');
    const chunks = Math.ceil(textFiles.length / Config.chunkSize); 
    
    for(let index = 0; index <= chunks; index++){
        if(index === 0){
            progressBar.start(textFiles.length, 0);
        }
        const chunk = textFiles.slice(index * Config.chunkSize, Math.min(textFiles.length, (index + 1) * Config.chunkSize));
        accumulator += await getChunkSize(chunk);
        progressBarCounter += Config.chunkSize;
        const fileObjects = await Promise.all(chunk.map(async (file) => await objectifyFile(sourceFolder, file)));
        chunkFileObjects = chunkFileObjects.concat(fileObjects);

        //write the last volume when it passed the volume size threshold or this is the last volume
        if(accumulator >= byteThreshold || index === chunks){ 
            await createVolume(targetFolder, volumeIndex, chunkFileObjects);
            accumulator = 0;
            chunkFileObjects = [];
            volumeIndex++;
            progressBar.update(progressBarCounter);
        }
    }
    progressBar.stop();
}

export async function createVolume(targetFolder, volumeIndex, files){
    await asyncWriteFile(path.join(targetFolder, `volume_${volumeIndex}.json`), JSON.stringify(files));
}

async function handleBinaryFiles(binaryFiles, sourceFolder, targetFolder){
    const chunks = Math.ceil(binaryFiles.length / Config.chunkSize);
    const binariesIndex = [];
    const binariesFolder = path.join(targetFolder, Config.binariesFolder);
    const binariesFolderExists = await asyncExists(binariesFolder);
    if(!binariesFolderExists){
        await asyncMkdir(binariesFolder);
    }
    const progressBar = new ProgressBar('Copying binary files');
    for(let index = 0; index <= chunks; index++){
        if(index === 0){
            progressBar.start(binaryFiles.length, 0);
        }
        const chunk = binaryFiles.slice(index * Config.chunkSize, Math.min(binaryFiles.length, (index + 1) * Config.chunkSize));
        const promises = chunk.map((file) => { 
            const uniqeName = toUniqueFileName(file);
            const relativeToSource = uniqeName.replace(sourceFolder, '');
            binariesIndex.push(relativeToSource);
            return asyncCopyFile(file, path.join(binariesFolder, path.basename(uniqeName)));
        });

        await Promise.all(promises);

        progressBar.update(chunk.length);
    }

    await asyncWriteFile(path.join(targetFolder, Config.binariesIndexFile), JSON.stringify(binariesIndex));
    progressBar.update(binaryFiles.length);
    progressBar.stop();
}

function toUniqueFileName(filePath){
    const fileName = path.basename(filePath);
    const folderName = path.dirname(filePath);
    const uid = uuidNoDashes();
    const uniquePrefix = `#~${uid}~#`; //length is 36 fix
    const uniqueFileName = `${uniquePrefix}${fileName}`;
    return `${folderName}/${uniqueFileName}`;
}

function isBinaryNaive(filePath){
    const ext = path.extname(filePath).replace('.','').toLowerCase();
    return !Config.textFileExtensionsDictionary[ext];
}