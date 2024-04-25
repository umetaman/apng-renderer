const fs = require('fs');
const path = require('path');
const APngStream = require('./dist/main.js');

const file = fs.readFileSync('./apng.png');
console.log(file);
const buffer = new Uint8Array(file);
const chunks = APngStream.readChunks(buffer);

for (const chunk of chunks) {
  try {
    const type = chunk.type;
    console.log(type);
    const ihdr = APngStream.readIHDR(chunk);
    console.log(ihdr);
  } catch (e) {
    // console.error(e);
  }
}
