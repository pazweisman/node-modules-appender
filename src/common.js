import path from 'path';

import chalk from 'chalk';
import cliSpinners from 'cli-spinners';
import cliProgress from 'cli-progress';
import ora from 'ora';
import glob from 'glob-promise';
import { v4 as uuidv4 } from 'uuid';
import AdmZip from 'adm-zip';

// import fs from 'fs';
// import { promisify } from 'util';
// export const asyncMkdir = promisify(fs.mkdir);
// export const asyncCopyFile = promisify(fs.copyFile);
// export const asyncReadFile = promisify(fs.readFile);
// export const asyncWriteFile = promisify(fs.writeFile);
// export const asyncExists = promisify(fs.exists);
// export const asyncStat = promisify(fs.stat);
// export const asyncDeleteFolder = promisify(fs.rm);

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

export function yellow(text){
    console.log(chalk.yellow(text));
}

export function blue(text){
    console.log(chalk.blue(text));
}

export function green(text){
    console.log(chalk.green(text));
}

export function red(text){
    console.log(chalk.red(text));
}

export function createSpinner(prompt){
    const spinner = ora({text:prompt, spinner: cliSpinners.dots});
    spinner.start();
    return spinner;
}

export class ProgressBar{
    constructor(name, size = 25, type = 'rect'){
        this.progressBar = new cliProgress.SingleBar({
            format: `${name} |{bar}| {value}/{total} {percentage}% {duration_formatted}`,
            barsize: size,
            hideCursor: true,
            stopOnComplete: true
        }, type === 'rect' ? cliProgress.Presets.rect : type === 'legacy' ? cliProgress.Presets.legacy : cliProgress.Presets.shades_classic);
    }

    start(totalValue, startValue = 0){
        this.progressBar.start(totalValue, startValue);
    }

    update(value){
        this.progressBar.update(value);
    }

    stop(){
        this.progressBar.stop();
    }
}

export async function createZip(sourceFolderPath, zipFilePath){
    yellow(`Zipping ${sourceFolderPath} into ${zipFilePath}`);
    const spinner = createSpinner(`Zipping files into ${zipFilePath}`);
    try{
        const zip = new AdmZip();
        zip.addLocalFolder(sourceFolderPath);
        zip.writeZip(zipFilePath);
    }catch(e){
        red(e)
    }finally{
        spinner.stop();
    }
}

export async function extractZip(filepath, outputDir) {
    yellow(`Unzipping ${filepath} into ${filepath}`);
    const spinner = createSpinner(`Extracting zip into ${outputDir}`);
    try {
        const zip = new AdmZip(filepath);
        zip.extractAllTo(outputDir);
    } catch (e) {
        red(e);
    } finally{
        spinner.stop();
    }
  }