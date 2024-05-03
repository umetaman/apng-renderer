import { Renderer, Player } from './library/main';
import png from './apng.png?url';
import './style.css';

const response = await fetch(png);
const buffer = new Uint8Array(await response.arrayBuffer());

const renderer = new Renderer(buffer);
await renderer.loadAsync();

const app = document.getElementById('app');

const canvas = renderer.createCanvasElement();
app?.appendChild(canvas);

const INIT_FPS = 30;
let player: Player | null = new Player(renderer, canvas);
player.play(30);

// display fps
const fps = document.createElement('span');
fps.textContent = `FPS: ${INIT_FPS}`;
app?.appendChild(fps);

// slider
const slider = document.createElement('input');
slider.type = 'range';
slider.min = '10';
slider.max = '90';
slider.value = INIT_FPS.toString();
app?.appendChild(slider);

slider.addEventListener('input', () => {
  fps.textContent = `FPS: ${slider.value}`;
});
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
