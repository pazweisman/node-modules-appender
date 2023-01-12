#!/usr/bin/env node

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

function setup(){
    console.time('Run time');
    const OS = require('os')
    //https://dev.to/johnjardincodes/increase-node-js-performance-with-libuv-thread-pool-5h10
    process.env.UV_THREADPOOL_SIZE = Math.min(4, OS.cpus().length); //4 is node's default
}

function housekeep(){
    process.env.UV_THREADPOOL_SIZE = 4;
    console.timeEnd('Run time');
}

(function main(){
    try{
        setup();

        //read args

        housekeep();
    }catch(e){
        console.error(e);
    }
    
})();