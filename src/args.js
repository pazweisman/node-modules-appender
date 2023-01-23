import yargs from 'yargs/yargs';
import nodeModulesPath from 'node_modules-path';
import path from 'path';

// https://markoskon.com/yargs-examples/
const usage = yargs(process.argv.slice(2))
.usage(`Crap - logo does not work correctly on bash`)
.option("a", { alias: "action", describe: "Action", type: "string", demandOption: true, choices:['append','restore'] })
.option("s", { alias: "source", describe: "Source folder", type: "string" })
.option("t", { alias: "target", describe: "Target folder", type: "string" })
.option("v", { alias: "volume", describe: "Volume size", type: "number", default:5 })
.argv;

usage.source = usage.source ? usage.source.replace(/\\/gi, '/') : null;
usage.target = usage.target ? usage.target.replace(/\\/gi, '/') : null;

if(usage.action === 'append' && !usage.source){
    usage.source = nodeModulesPath();
}

if(usage.action === 'append' && !usage.target){
    usage.target = path.join(process.cwd(), 'appended');
}

if(usage.action === 'restore' && !usage.source){
    usage.target = path.join(process.cwd(), 'appended');
}

if(usage.action === 'restore' && !usage.target){
    usage.target = path.join(process.cwd(), 'node_modules');
}

export default usage;