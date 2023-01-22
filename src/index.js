#!/usr/bin/env node
import { executeWithCommandLIneArgs } from './cli.js';

export function main(){
    try{
        executeWithCommandLIneArgs();
    }catch(e){
        console.error(e);
    }    
};

main();