const fs = require('fs');
const path = require('path');
const APngStream = require('./dist/main.js');
const crc32 = require('./dist/crc32.js');
const { Renderer } = require('./dist/main.js');

const file = fs.readFileSync('./apng.png');
const buffer = new Uint8Array(file);

const renderer = new Renderer(buffer);
console.log(renderer);

const frame = renderer.frames[renderer.frames.length - 1];
console.log(frame);
const pngBuffer = renderer.buildPNG(frame.control, frame.content);
fs.writeFileSync('./test.png', pngBuffer);
