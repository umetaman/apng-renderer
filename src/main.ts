import { Renderer, Player } from '../dist/apng-renderer.js';
import png from './apng.png?url';
import './style.css';

const response = await fetch(png);
const buffer = new Uint8Array(await response.arrayBuffer());

const renderer = new Renderer(buffer);
await renderer.loadAsync();

const app = document.getElementById('app');

const canvas = renderer.createCanvasElement();
app?.appendChild(canvas);

let player: Player | null = new Player(renderer, canvas);
player.play(60);

// slider
const slider = document.createElement('input');
slider.type = 'range';
slider.min = '10';
slider.max = '90';
slider.value = '0';
app?.appendChild(slider);

slider.addEventListener('change', () => {
  player?.stop();
  player = null;
  player = new Player(renderer, canvas);
  requestAnimationFrame(() => {
    player?.play(parseInt(slider.value, 10));
    console.log(parseInt(slider.value, 10));
  });
});

const imgElement = document.createElement('img');
imgElement.src = png;
app?.appendChild(imgElement);
