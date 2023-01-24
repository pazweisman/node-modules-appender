import path from 'path';

import yargs from 'yargs/yargs';
import nodeModulesPath from 'node_modules-path';

//https://yargs.js.org/docs/#api-reference-commandmodule
const args = yargs(process.argv.slice(2))
    .scriptName("nodeappender")
    .usage('$0 <cmd> [args]')
    .command('append', 'append files', {
    source: {
        alias: 's',
        default: nodeModulesPath()
    },
    target: {
        alias: 't',
        default: path.join(process.cwd(), 'appended')
    },
    volume: {
        alias: 'v',
        default: 5
    }
    })
    .command('restore', 'restore files', {
    source: {
        alias: 's',
        default: path.join(process.cwd(), 'appended')
    },
    target: {
        alias: 't',
        default: path.join(process.cwd(), 'node_modules')
    }
    })
    .help()
    .argv;

const { _, source, target, volume } = args;
export default {command:_, source, target, volume};


// https://markoskon.com/yargs-examples/
// const usage = yargs(process.argv.slice(2))
// .scriptName('nodeappend')
// .usage(`nodeappend -a <action> arguments`)
// .option("a", { alias: "action", describe: "Action", type: "string", demandOption: true, choices:['append','restore'] })
// .option("s", { alias: "source", describe: "Source folder", type: "string" })
// .option("t", { alias: "target", describe: "Target folder", type: "string" })
// .option("v", { alias: "volume", describe: "Volume size", type: "number", default:5 })
// .argv;

// usage.source = usage.source ? usage.source.replace(/\\/gi, '/') : null;
// usage.target = usage.target ? usage.target.replace(/\\/gi, '/') : null;

// if(usage.action === 'append' && !usage.source){
//     usage.source = nodeModulesPath();
// }

// if(usage.action === 'append' && !usage.target){
//     usage.target = path.join(process.cwd(), 'appended');
// }

// if(usage.action === 'restore' && !usage.source){
//     usage.target = path.join(process.cwd(), 'appended');
// }

// if(usage.action === 'restore' && !usage.target){
//     usage.target = path.join(process.cwd(), 'node_modules');
// }

// export default usage;