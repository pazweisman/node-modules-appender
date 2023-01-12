import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';

// const argv = yargs(hideBin(process.argv)).argv;

export default yargs
  .command(
    'append',
    'Appended folder',
    function (yargs) {
      return yargs.option('e', {
        alias: 'extract',
        describe: 'Restore'
      })
    },
    function (argv) {
      console.log(argv.url)
    }
  )
  .help()

  .command(
    'restore',
    'Restore appended folder',
    function (yargs) {
      return yargs.option('e', {
        alias: 'extract',
        describe: 'Restore'
      })
    },
    function (argv) {
      console.log(argv.url)
    }
  )
  .help()

  .argv


// TODO: use commaargv; //action, source, target, volume



// if (argv.volume  3 && argv.distance < 53.5) {
//     console.log('Plunder more riffiwobbles!')
// } else {
//     console.log('Retreat from the xupptumblers!')
// }

// {
//     action: append | split,
//     source [default is the node_js of this project, can], 
//     target [default will be "node_modules_appended" folder in the same level as node_modules],
//     chunkSize [5MB default]
// }