#!/usr/bin/env node
import args from './args.js';
import { append } from './append.js';
import { restore } from './restore.js';
import { yellow } from './common.js';

export function main(){
    if(args.command && args.command.length === 1){
        try{
            switch(args.command[0]){
                case 'append':
                    append(args.source, args.target, args.volume);
                    break;
                case 'restore':
                    restore(args.source, args.target);
                    break;
                default:
                    yellow(`"append" and "restore" are the only options for the action param`);
            }
        }catch(e){
            console.error(e);
        }   
    }else{
        yellow(`"append" and "restore" are the only options for the action param`);
    }
};

main();