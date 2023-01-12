import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';

const argv = yargs(hideBin(process.argv)).argv;


if (argv.ships > 3 && argv.distance < 53.5) {
    console.log('Plunder more riffiwobbles!')
} else {
    console.log('Retreat from the xupptumblers!')
}

// {
//     action: append | split,
//     source [default is the node_js of this project, can], 
//     target [default will be "node_modules_appended" folder in the same level as node_modules],
//     chunkSize [5MB default]
// }