import path from 'path';

// import { isBinaryFile } from "isbinaryfile"; //TODO: test this library for performance and correctness
import cliSpinners from 'cli-spinners';
import ora from 'ora';

import { asyncMkdir, asyncCopyFile, asyncWriteFile, asyncStat, objectifyFile, uuidNoDashes, getAllFiles } from './common.js';
import ProgressBar from './ProgressBar.js';
import Config from './config.js';

export async function buildFolderTreeIndex(allFiles, sourceFolder, targetFolder){
    const result = new Set(allFiles.map(file => path.dirname(file).replace(sourceFolder, '')));
    await asyncWriteFile(`${targetFolder}/${Config.folderStructureIndexFile}`, Array.from(result).join('\n'));
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
    try{
        const dividedFiles = await beforeAppend(sourceFolder, targetFolder);
        await handleTextFiles(sourceFolder, dividedFiles.texts, targetFolder, volumeThreshold);
        await handleBinaryFiles(dividedFiles.binaries, sourceFolder, targetFolder);
        console.log('DONE');
    }catch(e){
        console.log(e);
    }
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
    console.log(`extensions found: ${Array.from(new Set(allFiles.map(f => path.extname(f).replace('.',''))))}`);
    console.log(`texts: ${dividedFiles.texts.length}, binary: ${dividedFiles.binaries.length}`);

    return dividedFiles;
}

async function handleTextFiles(sourceFolder, textFiles, targetFolder, volumeThreshold){
    let chunkSize = 50; //TODO: optimize this number for minimum time, use trail ande error + manipulate uv_threadpool_size
    const threshold = 1 * 1024 * 1024 * volumeThreshold;
    const chunks = Math.ceil(textFiles.length / chunkSize);

    let accumulator = 0;
    let chunkFileObjects = [];
    let progressBarCounter = 0;
    const progressBar = new ProgressBar('Appending text files');
    let volumeIndex = 0;

    for(let index = 0; index < chunks; index++){
        if(index === 0){
            progressBar.start(textFiles.length, 0);
        }
        const chunk = textFiles.slice(index * 20, Math.min(textFiles.length, (index + 1) * 20));
        accumulator += await getChunkSize(chunk);
        progressBarCounter += chunkSize;
        const fileObjects = await Promise.all(chunk.map(async (file) => await objectifyFile(sourceFolder, file)));
        chunkFileObjects = chunkFileObjects.concat(fileObjects);

        if(accumulator >= threshold){
            await createVolume(targetFolder, volumeIndex, chunkFileObjects);
            accumulator = 0;
            chunkFileObjects = [];
            volumeIndex++;
            progressBar.update(progressBarCounter);
        }
    }
    progressBar.update(textFiles.length);
    progressBar.stop();
}

export async function createVolume(targetFolder, volumeIndex, files){
    await asyncWriteFile(path.join(targetFolder, `volume_${volumeIndex}.json`), JSON.stringify(files));
}

async function handleBinaryFiles(binaryFiles, sourceFolder, targetFolder){
    //TODO: use progress bar instead of spinner
    const spinner = ora({text:'Handling binary files...', spinner: cliSpinners.dots});
    
    let spinnerCounter = 0;
    const binariesIndex = [];
    const promises = [];
    const binariesFolder = path.join(targetFolder, 'binaries');
    const binariesFolderExists = await asyncStat(binariesFolder);
    if(!binariesFolderExists){
        await asyncMkdir(binariesFolder);
    }

    for(const file of binaryFiles){
        if(spinnerCounter === 0){
            spinner.start();
        }
        const uniqeName = toUniqueFileName(file);
        const relativeToSource = uniqeName.replace(sourceFolder, '');
        binariesIndex.push(relativeToSource);
        promises.push(asyncCopyFile(file, `${targetFolder}/binaries/${path.basename(uniqeName)}`));
        spinnerCounter++;
    }

    await asyncWriteFile(`${targetFolder}/binaries.idx`, binariesIndex.join('\n'));
    await Promise.all(promises);

    spinner.stop();
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