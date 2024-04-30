import { Renderer } from '../dist/apng-renderer.js';
import png from './apng.png?url';
import './style.css';

const response = await fetch(png);
const buffer = new Uint8Array(await response.arrayBuffer());

const renderer = new Renderer(buffer);
await renderer.loadAsync();

const app = document.getElementById('app');

const canvas = renderer.createCanvasElement();
app?.appendChild(canvas);

// slider
const slider = document.createElement('input');
slider.type = 'range';
slider.min = '0';
slider.max = (renderer.numFrames - 1).toString();
slider.value = '0';
app?.appendChild(slider);

slider.addEventListener('input', () => {
  renderer.renderFrame(parseInt(slider.value), canvas);
});

renderer.renderFrame(0, canvas);

const imgElement = document.createElement('img');
imgElement.src = png;
app?.appendChild(imgElement);
