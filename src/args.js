import commandLineUsage from 'command-line-usage'

const logo = `

███    ██  ██████  ██████  ███████  █████  ██████  ██████  ███████ ███    ██ ██████  ███████ ██████  
████   ██ ██    ██ ██   ██ ██      ██   ██ ██   ██ ██   ██ ██      ████   ██ ██   ██ ██      ██   ██ 
██ ██  ██ ██    ██ ██   ██ █████   ███████ ██████  ██████  █████   ██ ██  ██ ██   ██ █████   ██████  
██  ██ ██ ██    ██ ██   ██ ██      ██   ██ ██      ██      ██      ██  ██ ██ ██   ██ ██      ██   ██ 
██   ████  ██████  ██████  ███████ ██   ██ ██      ██      ███████ ██   ████ ██████  ███████ ██   ██ 
`;

const sections = [
  {
    header: logo,
    content: `
    Append the text contents of node_modules or any other directory into volumes of made of plain text files. Binary files are kept in side folder. 
    This reduce the load from antivirus software when scanning the archive.`
  },
  {
    header: 'Options',
    optionList: [
      { //insert options list limited to action type
        name: 'action',
        alias: 'a',
        type: String,
        typeLabel: '{underline file}',
        description: 'The action to perform, could be "append" or "restore".',
      },
      {
        name: 'source',
        alias: 's',
        type: String,
        typeLabel: '{underline file}',
        description: 'Source folder. When the action is "append" the default is the closest "node_modules" folder, if the action is restore, the default will be "./appended".'
      },
      {
        name: 'target',
        alias: 't',
        type: String,
        typeLabel: '{underline file}',
        description: 'Target folder. When the action is "append" the default is "./appended", if the action is restore, the default will be "./node_modules".'
      },
      {
        name: 'volume',
        alias: 'v',
        type: Number,
        default: 5,
        typeLabel: '{underline file}',
        description: 'Volume size, by default it is ~5 MB, relevant only for the "append" action.'
      },
      {
        name: 'help',
        description: 'Print this usage guide.'
      }
    ]
  }
];

const usage = commandLineUsage(sections);

// usage.source = usage.source ? usage.source.replace(/\\/gi, '/') : null;
// usage.target = usage.target ? usage.target.replace(/\\/gi, '/') : null;

if(usage.action === 'append' && !usage.source){
    usage.source = nodeModulesPath();
}

if(usage.action === 'append' && !usage.target){
    usage.taget = path.join(process.cwd(), 'appended');
}

if(usage.action === 'restore' && !usage.source){
    usage.taget = path.join(process.cwd(), 'appended');
}

if(usage.action === 'restore' && !usage.target){
    usage.taget = path.join(process.cwd(), 'node_modules');
}

export default usage;