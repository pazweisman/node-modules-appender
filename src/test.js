import path from 'path';

import { getAllFiles } from './common.js';

async function test(original = 'D:/node_modules_tester/node_modules', restored = 'D:/node_modules_tester/restored'){
    const originalFiles = (await getAllFiles(original)).map(file => file.replace(original,''));
    const restoredFiles = (await getAllFiles(restored)).map(file => file.replace(restored,''));

    if(originalFiles.length !== restoredFiles.length) {
        const restoredDictionary = {};
        const originalDictionary = {};

        for(const file of restoredFiles){
            restoredDictionary[file] = true;
        }

        for(const file of originalFiles){
            originalDictionary[file] = true
        }

        for(const file of originalFiles){
            if(!restoredDictionary[file]){
                console.log(file);
            }
        }
    }else{
        console.log(`MATCH size ${originalFiles.length} - ${restoredFiles.length} = ${originalFiles.length - restoredFiles.length}`);
    }
}

test();