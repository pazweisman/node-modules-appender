import path from 'path';
import { asyncMkdir, asyncReadFile, isDescriptorLine } from './common'

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
    const rows = content.split('\n');
    for(const row of rows){
        if(isDescriptorLine(row)){

        }else{
            
        }
    }
}

export async function extractBinaries(){

}