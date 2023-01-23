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