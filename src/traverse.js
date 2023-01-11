const { promisify } = require('util');
const { resolve } = require('path');
const fs = require('fs');
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);

//TODO figure how to return list of all folders and subfolders recursive
//TODO figure how to return list of all files recursive
async function getFiles(dir) {
  const subdirs = await readdir(dir);
  const files = await Promise.all(subdirs.map(async (subdir) => {
    const res = resolve(dir, subdir);
    return (await stat(res)).isDirectory() ? getFiles(res) : res;
  }));
  return files.reduce((a, f) => a.concat(f), []);
}

getFiles(__dirname)
  .then(files => console.log(files))
  .catch(e => console.error(e));

module.export = {
  getFiles
}

class AppenderTextFile{
  constructor(name, directory){
    this.name = name;
    this.directory = directory;
    this.base64Content = null;
  }

  encode(){

  }

  decode(){

  }

  save(){

  }
}

function parseMetadataRow(row){
  //[file name="" directory=""]
}

function splitIndexFile(fileName){
  const content = 
}

// function split(content){
//   const res = [];
//   let startRowIndex = 0;
//   let endRowIndex = 1;
//   let currentRow = 0;
//   const rows = content.split('\n')

//   while(currentRow !== rows.length){
//     if(rows[currentRow].startsWith('<file')){
//       startRowIndex = currentRow;
//     }

//     if(!rows[currentRow].startsWith('</file>')){
//       endRowIndex = currentRow;
//       res.push(rows.slice(startRowIndex,endRowIndex).join(''))
//     }
//     currentRow++;
//   }
// }