import yargs from 'yargs/yargs';

import { append } from './append.js';
import { restore } from './restore.js';

export function execute(){
  yargs(process.argv.slice(2))
  .scriptName("nodeappender")
  .usage('$0 <cmd> [args]')
  .command('append [source] [target] [size]', 'append files into volumes', (yargs) => {
      yargs.positional('source', {
      type: 'string',
      default: './node_modules',
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
          describe: 'volume size'
      })
  }, (argv) => {
      append(argv.source, argv.target, argv.size)
  })

  .command('restore [source] [target]', 'restore volumes to file system', (yargs) => {
      yargs.positional('source', {
      type: 'string',
      default: './appended',
      describe: 'appended folder'
      });

      yargs.positional('target', {
          type: 'string',
          default: './node_modules',
          describe: 'target folder'
      })
  }, (argv) => {
      restore(argv.source, argv.target);
  })
  .help()
  .argv;
}