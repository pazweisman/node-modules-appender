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
