import path from 'path';
import { glob } from 'glob-promise'
import { isBinaryFile } from "isbinaryfile";
import { v4 as uuidv4 } from 'uuid';
import { cliProgress } from'cli-progress';

import { asyncMkdir, asyncCopyFile, asyncWriteFile, asyncStat, objectifyFile } from './common';

export async function buildFolderTreeIndex(allFiles, rootSourceFolder, rootTargetFolder){
    const result = new Set(allFiles.map(file => path.dirname(file).replace(rootSourceFolder, '')));
    await asyncWriteFile(`${rootTargetFolder}/folders.idx`, result.join('\n'));
}

export async function getAllFiles(rootSourceFolder){
    return await glob( `${rootSourceFolder}/**/*.*`);
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
export async function append(rootSourceFolder, rootTargetFolder, volumeThreshold = 5){
    
    //Scan and build folder tree index
    //Show spinner
    const allFiles = await getAllFiles(rootSourceFolder);
    await buildFolderTreeIndex(allFiles, rootSourceFolder, rootTargetFolder);
    const dividedFiles = divideBinariesAndTextFiles(allFiles);

    const progress = new cliProgress.SingleBar({
        format: 'CLI Progress |' + colors.cyan('{bar}') + '| {percentage}% || {value}/{total} Chunks || Speed: {speed}',
    }, cliProgress.Presets.shades_classic);

    let chunkSize = 20;
    const threshold = 1 * 1024 * 1024 * volumeThreshold;
    const chunks = Math.ceil(dividedFiles.texts.length / chunkSize);

    let accumulator = 0;
    let chunkFileObjects = [];

    for(let index = 0; index < chunks; index++){
        const chunk = dividedFiles.texts.slice(index * 20, Math.min(dividedFiles.texts.length, (index + 1) * 20));
        accumulator += await getChunkSize(chunk);
        const fileObjects = await Promise.all(chunk.map(file => objectifyFile(file)));
        chunkFileObjects.concat(fileObjects);

        if(accumulator >= threshold){
            await createVolume(rootDestinationFolder, index, chunkFileObjects);
            accumulator = 0;
            chunkFileObjects = [];
        }
    }
}

//receive a destination folder, index, and array of TEXT files. It write the volume in the destination folder
export async function createVolume(rootDestinationFolder, volumeIndex, files){
    await asyncWriteFile(path.join(rootDestinationFolder, `index_${volumeIndex}.json`), JSON.stringify(files));
}

async function createBinariesFolder(destinationFolder){
    await asyncMkdir(path.join(destinationFolder, 'binaries'));
    await asyncMkdir(path.join(destinationFolder, 'binaries', 'files'));
}

export async function saveBinaryFiles(destinationFolder, files){
    await createBinariesFolder();
    const promises = [];
    for(const file of files){
        const unique = uuidv4().replace(/-/g, '');
        const newFileName = `#${unique}#${path.basename}`;
        promises.push(asyncCopyFile(file, path.join(destinationFolder, 'binaries', 'files', newFileName)));
    }
    await Promise.all(promises);
}

//return true if the file is binary or false if it is text file
//main function will hold 2 arrays, one for binary files, which will pass into saveBinaryFiles and one for text files which will pass into createVolume
//probably slowest
export async function isBinary(filePath){
    return await isBinaryFile(filePath);
}

//probably second fastest
export async function isBinaryByMimeType(filePath){
    return await isBinaryFile(filePath);
}

//probaly the fastest way
export function isBinaryNaive(filePath){
    const textFileExtensions = {
        cs:true,
        ts:true,
        js:true,
        txt:true,
        html:true,
        htm:true,
        css:true,
        scss:true,
        less:true,
        jsx:true,
        tsx:true,
        vue:true,
        svelte:true,
        csv:true,
        md:true,
        c:true,
        cpp:true,
        h:true,
        go:true,
        rs:true,
        py:true,
        cmd:true,
        bat:true,
        ps1:true,
        java:true,
        ini:true,
        cfg:true,
        config:true,
        yaml:true,
        go:true,
        aspx:true,
        json:true,
        xml:true,
        csproj:true,
        rb:true,
        log:true        
    };

    const ext = path.extname(filePath.replace('.','').toLowerCase());
    return !textFileExtensions[ext];
}