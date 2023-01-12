import path from 'path';
import { asyncMkdir, asyncReadFile, extractFile } from './common'

export async function restoreFolderTree(destinationFolder, folderStructureFile){
    const content = await asyncReadFile(folderStructureFile, 'utf8');
    const promises = [];
    for(const folder of content.split('\n')){
        const folderPath = path.join(destinationFolder, folder);
        promises.push(asyncMkdir(folderPath));
    }
    await Promise.all(promises);
}

export async function extractVolume(rootDestination, volumeFilePath){
    const content = await asyncReadFile(folderStructureFile, 'utf8');
    const files = JSON.parse(content);
    const promises = files.map(file => extractFile(rootDestination, file));
    await Promise.all(promises);
    
}

export async function extractBinaries(rootDestinationFolder, binariesIndexPath){
    
}