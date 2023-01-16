import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

import glob from 'glob-promise';
import { v4 as uuidv4 } from 'uuid';

export const asyncMkdir = promisify(fs.mkdir);
export const asyncCopyFile = promisify(fs.copyFile);
export const asyncReadFile = promisify(fs.readFile);
export const asyncWriteFile = promisify(fs.writeFile);
export const asyncExists = promisify(fs.exists);
export const asyncStat = promisify(fs.stat);

export async function getAllFiles(folder){
    return await glob( `${folder}/**/*.*`, { nodir:true, dot:true }); //include hidden
}

export async function getAllVolumes(folder){
    return await glob( `${folder}/volume*.json`, { nodir:true });
}

export async function objectifyFile(sourceBaseFolder, filePath){
    const relativePath = filePath.replace(sourceBaseFolder, '');
    const text = await asyncReadFile(filePath, 'utf8');
    const encoded = encode(text);
    return { relativePath, encoded };
}

export function extractFile(targetFolder, fileObject){
    const decoded = decode(fileObject.encoded);
    const destination = path.join(targetFolder, fileObject.relativePath);
    return asyncWriteFile(destination, decoded);
}

function encode(text){
    return Buffer.from(text).toString('base64');
}

function decode(base64String){
    try{
        return Buffer.from(base64String, 'base64').toString('utf8');
    }catch(e){
        return Buffer.from(base64String, 'base64').toString('ascii');
    }
}

export function uuidNoDashes(){
    return uuidv4().replace(/-/gi, '');
}