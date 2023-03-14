import path from 'path';
import fs from 'fs';

import { extractFile, getAllVolumes, blue, red, green, yellow, createSpinner, ProgressBar, extractZip } from './common.js';
//asyncMkdir, asyncCopyFile, asyncExists, asyncReadFile,
import Config from './config.js';

export async function restore(sourceFolder, targetFolder){
    console.time('Restore files');
    let zipFileName = null;
    if(path.basename(sourceFolder).toLowerCase().endsWith('.zip')){
        zipFileName = sourceFolder;
        const extractTo = path.join(path.dirname(sourceFolder), path.basename(sourceFolder).toLowerCase().replace('.zip', ''));
        await extractZip(zipFileName, extractTo);
    }
    yellow(`Restoring ${sourceFolder} into ${targetFolder}`);
    try{
        await restoreFolderTree(sourceFolder, targetFolder);
        await restoreTextVolumes(sourceFolder, targetFolder);
        await restoreBinaryFiles(sourceFolder, targetFolder);
    }catch(e){
        red(e);
    }
    
    console.timeEnd('Restore files');
} 

export async function restoreFolderTree(sourceFolder, targetFolder){
    const spinner = createSpinner('Restoring folder structure...');
    const folderStructureFilePath = path.join(sourceFolder, Config.folderStructureIndexFile);
    const folderStructureFilePathExists = await fs.promises.exists(folderStructureFilePath);
    if(!folderStructureFilePathExists){
        red(`ERROR ${folderStructureFilePath} NOT FOUND`);
        return;
    }

    const taregtFolderExists = await asyncExists(targetFolder);
    if(!taregtFolderExists){
        await fs.promises.mkdir(taregtFolderExists);
    }

    const content = await fs.promises.readFile(folderStructureFilePath, 'utf8');
    const folders = JSON.parse(content);
    const chunks = Math.ceil(folders.length / Config.chunkSize);
    for(let i = 0; i < chunks; i++){
        const slice = folders.slice(i * Config.chunkSize, Math.min(folders.length, (i + 1) * Config.chunkSize));
        await Promise.all(slice.map((folder) => {
            const folderPath = path.join(targetFolder, folder);
            return fs.promises.mkdir(folderPath, {recursive: true});
        }));
    }
    spinner.stop();
}

async function restoreTextVolumes(sourceFolder, targetFolder){
    const progressBar = new ProgressBar('Restoring text files');
    const volumes = await getAllVolumes(sourceFolder);

    for(let i = 0; i < volumes.length; i++){
        if(i === 0){
            progressBar.start(volumes.length);
        }
        await restoreVolume(volumes[i], targetFolder);
        progressBar.update(i);
    }

    progressBar.update(volumes.length);
    progressBar.stop();
}

async function restoreVolume(volumeFilePath, targetFolder){
    const content = await fs.promises.readFile(volumeFilePath, 'utf8');
    const files = JSON.parse(content);
    const chunks = Math.ceil(files.length / Config.chunkSize);
    for(let i = 0; i <= chunks; i++){
        const slice = files.slice(i * Config.chunkSize, Math.min(files.length, (i + 1) * Config.chunkSize));
        const promises = slice.map(file => extractFile(targetFolder, file));
        await Promise.all(promises);
    }
}

async function restoreBinaryFiles(sourceFolder, targetFolder){
    const binariesIndexFilePath = path.join(sourceFolder, Config.binariesIndexFile);
    const binariesIndexFilePathExists = await fs.promises.exists(binariesIndexFilePath);
    if(binariesIndexFilePathExists){
        const progressBar = new ProgressBar('Restoring text files');
        const binariesContent = await fs.promises.readFile(binariesIndexFilePath, "utf8");
        const binaries = JSON.parse(binariesContent);
        const chunks = Math.ceil(binaries.length / Config.chunkSize);
        let accumulator = 0;
        for(let i = 0; i <= chunks; i++){
            if(i === 0){
                progressBar.start(binaries.length);
            }
            const slice = binaries.slice(i * Config.chunkSize, Math.min(binaries.length, (i + 1) * Config.chunkSize));
            const promises = slice.map(file => {
                const cleanName = path.join(path.dirname(file), path.basename(file).substring(36));
                return fs.promises.copyFile(path.join(sourceFolder, Config.binariesFolder, path.basename(file)), path.join(targetFolder, cleanName));
            });
            await Promise.all(promises);
            accumulator += slice.length;
            progressBar.update(accumulator);
        }
    }else{
        yellow('No binaries index file found');
    }
}