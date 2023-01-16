#!/usr/bin/env node
import os from 'os';
import { execute } from './cli.js';

function setup(){
    console.log(`Running on ${os.cpus().length} CPU cores.`);
    //check if to set this variable BEFORE node starts
    //https://dev.to/johnjardincodes/increase-node-js-performance-with-libuv-thread-pool-5h10
    process.env.UV_THREADPOOL_SIZE = Math.min(4, os.cpus().length); //4 is node's default
}

function housekeep(){
    console.log("housekeep");
    process.env.UV_THREADPOOL_SIZE = 4;
}

(function main(){
    try{
        // setup();
        execute();
        // housekeep();
    }catch(e){
        console.error(e);
    }    
})();



/*
1. Learn how to publish library to npm
2. Learn how to run the library using npx
3. Learn how to run the package when it is installed globally
4. Learn how to support commonjs es6 modules and typescript
5. Learn how to call the script as if it was some sort of binary file which is in the PATH variable
6. Learn how to create a progress bar with actual % files processed out of total files
7. Make sure all IO operation are async written using promises
8. Learn how to determine if a file is text or binary (use mime types or something like that)
*/