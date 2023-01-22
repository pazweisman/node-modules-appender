import path from 'path';
import yargs from 'yargs/yargs';
import nodeModulesPath from 'node_modules-path';

import { append } from './append.js';
import { restore } from './restore.js';

export function executeWithCommandLIneArgs(){
  yargs(process.argv.slice(2))
  .scriptName("nodeappender")
  .usage('$0 <cmd> [args]')
  .command('append [source] [target] [size]', 'append files into volumes', (yargs) => {
      yargs.positional('source', {
      type: 'string',
      default: nodeModulesPath(), //'./node_modules',
      describe: 'folder of the files to append.'
      });

      yargs.positional('target', {
          type: 'string',
          default: './appended',
          describe: 'destination folder'
      })

      yargs.positional('size', {
          type: 'number',
          default: 5,
          describe: 'approximate text volume size in megabytes'
      })
  }, (argv) => {
        //fix windows backslashes to slashes
        const source = argv.source.replace(/\\/gi, '/');
        const target = argv.target.replace(/\\/gi, '/');
        append(source, target, argv.size);
  })

  .command('restore [source] [target]', 'restore volumes to file system', (yargs) => {
      yargs.positional('source', {
      type: 'string',
      default: path.join(process.cwd(), 'appended'),
      describe: 'appended folder'
      });

      yargs.positional('target', {
          type: 'string',
          default: './node_modules',
          describe: 'target folder'
      })
  }, (argv) => {
        const source = argv.source.replace(/\\/gi, '/');
        const target = argv.target.replace(/\\/gi, '/');
        restore(source, target);
  })
  .help()
  .argv;
}
2
const logo = `
███    ██  ██████  ██████  ███████  █████  ██████  ██████  ███████ ███    ██ ██████  ███████ ██████  
████   ██ ██    ██ ██   ██ ██      ██   ██ ██   ██ ██   ██ ██      ████   ██ ██   ██ ██      ██   ██ 
██ ██  ██ ██    ██ ██   ██ █████   ███████ ██████  ██████  █████   ██ ██  ██ ██   ██ █████   ██████  
██  ██ ██ ██    ██ ██   ██ ██      ██   ██ ██      ██      ██      ██  ██ ██ ██   ██ ██      ██   ██ 
██   ████  ██████  ██████  ███████ ██   ██ ██      ██      ███████ ██   ████ ██████  ███████ ██   ██ 
`;

import commandLineUsage from 'command-line-usage'

const sections = [
  {
    header: logo,
    content: 'Append the text contents of node_modules or any other directory into volumes. This helps antivirus software to scan remove large volumes of '
  },
  {
    header: 'Options',
    optionList: [
      { //insert options list limited to action type
        name: 'action',
        alias: 'a',
        type: 'string',
        typeLabel: '{underline file}',
        description: 'The action to perform, could be "append" or "restore".',
      },
      {
        name: 'source',
        alias: 's',
        type: 'string',
        typeLabel: '{underline file}',
        description: 'Source folder. When the action is "append" the default is the closest "node_modules" folder, if the action is restore, the default will be "./appended".'
      },
      {
        name: 'target',
        alias: 't',
        type: 'string',
        typeLabel: '{underline file}',
        description: 'Target folder. When the action is "append" the default is "./appended", if the action is restore, the default will be "./node_modules".'
      },
      {
        name: 'volume',
        alias: 'v',
        type: 'number',
        typeLabel: '{underline file}',
        description: 'Volume size, by default it is ~5 megabytes'
      },
      {
        name: 'help',
        description: 'Print this usage guide.'
      }
    ]
  }
]
const usage = commandLineUsage(sections)
console.log(usage)