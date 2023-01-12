import fs from 'fs';
import path from 'path';

export const asyncMkdir = promisify(fs.mkdir);
export const asyncCopyFile = promisify(fs.copyFile);
export const asyncReadFile = promisify(fs.readFile);
export const asyncWriteFile = promisify(fs.writeFile);
export const asyncStat = promisify(fs.stat);

export async function objectifyFile(sourceBaseFolder, filePath){
    const relativePath = filePath.replace(sourceBaseFolder, '');
    const fileName = path.basename(filePath);
    const text = asyncReadFile(filePath, 'utf8');
    const encoded = encode(text);
    return {relativePath, fileName, encoded};
}

export function extractFile(rootDestinationFolder, fileObject){
    const decoded = decode(fileObject.encoded);
    const destination = path.join(rootDestinationFolder, fileObject.relativePath, fileObject.fileName);
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
