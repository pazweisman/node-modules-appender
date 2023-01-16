import path from 'path';

import cliSpinners from 'cli-spinners';
import ora from 'ora';
import chalk from 'chalk';

import { asyncMkdir, asyncCopyFile, asyncWriteFile, asyncStat, objectifyFile, uuidNoDashes, getAllFiles, asyncExists } from './common.js';
import ProgressBar from './ProgressBar.js';
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
        console.log('DONE 🧻🧻🧻🧻🧻 🚽🚽🚽🚽🚽🚽 📂📂📂📂📂📂📂 🔤🔤🔤🔤🔤🔤');
    }catch(e){
        console.log(e);
    }
    console.timeEnd('Append files');
}

async function beforeAppend(sourceFolder, targetFolder){
    const targetFolderExists = await asyncStat(targetFolder);
    if(!targetFolderExists){
        console.log(`Create target folder ${targetFolder}`);
        asyncMkdir(targetFolder);
    }

    const spinner = ora({text:'Analyzing source folder...', spinner: cliSpinners.dots});
    spinner.start();

    const allFiles = await getAllFiles(sourceFolder);
    await buildFolderTreeIndex(allFiles, sourceFolder, targetFolder);
    const dividedFiles = divideBinariesAndTextFiles(allFiles);
    spinner.stop();
    
    console.log('');
    // console.log(`extensions found: ${Array.from(new Set(allFiles.map(f => path.extname(f).replace('.',''))))}`);
    console.log(`Found texts: ${dividedFiles.texts.length}, binary: ${dividedFiles.binaries.length}`);

    return dividedFiles;
}

async function handleTextFiles(sourceFolder, textFiles, targetFolder, volumeThreshold){
    const threshold = 1 * 1024 * 1024 * volumeThreshold;
    //TODO: optimize this number for minimum time, use trail ande error + manipulate uv_threadpool_size
    
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

        if(accumulator >= threshold || index === chunks){ //write the last volume when it passed the volume size threshold or this is the last volume
            await createVolume(targetFolder, volumeIndex, chunkFileObjects);
            accumulator = 0;
            chunkFileObjects = [];
            volumeIndex++;
            progressBar.update(progressBarCounter);
        }
    }

    // progressBar.update(textFiles.length);
    progressBar.stop();
}

export async function createVolume(targetFolder, volumeIndex, files){
    await asyncWriteFile(path.join(targetFolder, `volume_${volumeIndex}.json`), JSON.stringify(files));
}

async function handleBinaryFiles(binaryFiles, sourceFolder, targetFolder){
    const chunks = Math.ceil(binaryFiles.length / Config.chunkSize); //TODO: optimize this number for minimum time, use trail ande error + manipulate uv_threadpool_size
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

    return `${folderName}/#~${uid}~#${fileName}`;
}

function isBinaryNaive(filePath){
    const ext = path.extname(filePath).replace('.','').toLowerCase();
    return !Config.textFileExtensionsDictionary[ext];
}