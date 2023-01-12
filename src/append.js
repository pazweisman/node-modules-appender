import path from 'path';
import { promisify } from 'util';
import { isBinaryFile } from "isbinaryfile";
import { v4 as uuidv4 } from 'uuid';

import { asyncMkdir, asyncCopyFile, asyncReadFile, asyncWriteFile, asyncStat, objectifyFile } from './common';


export async function buildFolderTree(sourceFolder, destinationFolder){

}

async function getChunkSize(filePaths){

    const stats = await Promise.all(filePaths.map((filePath => asyncStat(filePath))));
    const totalSize = stats.reduce((acc, stat) => acc += stat.size, 0);
    return totalSize;
}

export async function append(rootDestinationFolder, textFilePaths){
    let chunkSize = 20;
    const threshold = 1 * 1024 * 1024 * 5;
    const chunks = Math.ceil(textFilePaths.length / chunkSize);

    let accumulator = 0;
    let chunkFileObjects = [];

    for(let index = 0; index < chunks; index++){
        const chunk = textFilePaths.slice(index * 20, Math.min(textFilePaths.length, (index + 1) * 20));
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
    return textFileExtensions.hasOwnProperty(ext); // textFileExtensions[ext] || false;
}