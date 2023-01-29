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

args.source = args.source.replace(/\\/gi, '/');
args.target = args.target.replace(/\\/gi, '/');

const { _, source, target, volume } = args;
export default {command:_, source, target, volume};