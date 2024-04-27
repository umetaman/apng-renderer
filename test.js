const fs = require('fs');
const path = require('path');
const APngStream = require('./dist/main.js');
const crc32 = require('./dist/crc32.js');

const file = fs.readFileSync('./apng.png');
console.log(file);
const buffer = new Uint8Array(file);
const chunks = APngStream.readChunks(buffer);

console.log(chunks);

const message = 'hello';
const data = Uint8Array.from(message, (c) => c.charCodeAt(0));

console.log(crc32.crc32fast(data));
