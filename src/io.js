

async function readFile(){

}

async function writeFile(){

}

async function createDirectory(){

}

/*
'ascii' - for 7 bit ASCII data only. This encoding method is very fast, and will strip the high bit if set.

'utf8' - Multi byte encoded Unicode characters. Many web pages and other document formats use UTF-8.

'ucs2' - 2-bytes, little endian encoded Unicode characters. It can encode only BMP(Basic Multilingual Plane, U+0000 - U+FFFF).

'base64' - Base64 string encoding.

'binary' - A way of encoding raw binary data into strings by using only the first 8 bits of each character. This encoding method is deprecated and should be avoided in favor of Buffer objects where possible. This encoding will be removed in future versions of Node.
*/
function toBase64String(text){
    return Buffer.from(text).toString('base64');
}

function fromBase64String(base64String){
    try{
        return Buffer.from(base64String, 'base64').toString('utf8');
    }catch(e){
        return Buffer.from(base64String, 'base64').toString('ascii');
    }
}