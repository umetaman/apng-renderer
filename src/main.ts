import { Renderer, Player } from './library/main';
import png from './apng.png?url';
import './style.scss';

const response = await fetch(png);
const buffer = new Uint8Array(await response.arrayBuffer());

const renderer = new Renderer(buffer);
await renderer.loadAsync();

// Show APNG
const sampleAPNG = document.getElementById('sample-apng') as HTMLImageElement;
sampleAPNG.src = png;

// Player
const playerCanvas = document.getElementById(
  'renderer-fps',
) as HTMLCanvasElement;
let player: Player | null = new Player(renderer, playerCanvas);
player.play(30);

let fps = 30;

const buttonPlay = document.getElementById(
  'renderer-play',
) as HTMLButtonElement;
const buttonPause = document.getElementById(
  'renderer-pause',
) as HTMLButtonElement;
const buttonStop = document.getElementById(
  'renderer-stop',
) as HTMLButtonElement;
const buttonRestart = document.getElementById(
  'renderer-restart',
) as HTMLButtonElement;

buttonPlay.addEventListener('click', () => {
  player?.play(fps);
});
buttonPause.addEventListener('click', () => {
  player?.pause();
});
buttonStop.addEventListener('click', () => {
  player?.stop();
});
buttonRestart.addEventListener('click', () => {
  player?.pause();
  player = null;
  player = new Player(renderer, playerCanvas);
  player?.play(fps);
});

const slider = document.getElementById(
  'renderer-slider-fps',
) as HTMLInputElement;
slider.min = '1';
slider.max = '120';
slider.value = fps.toString();
const fpsText = document.getElementById('renderer-fps-text') as HTMLSpanElement;
fpsText.textContent = `FPS: ${fps}`;
slider.addEventListener('input', () => {
  fps = parseInt(slider.value, 10);
  fpsText.textContent = `FPS: ${fps}`;
});
slider.addEventListener('change', () => {
  player?.pause();
  player = null;
  player = new Player(renderer, playerCanvas);
  player.play(fps);
});

// const app = document.getElementById('app');

// const canvas = renderer.createCanvasElement();
// app?.appendChild(canvas);

// // Control FPS
// const INIT_FPS = 30;
// let player: Player | null = new Player(renderer, canvas);
// player.play(30);

// // display fps
// const fps = document.createElement('span');
// fps.textContent = `FPS: ${INIT_FPS}`;
// app?.appendChild(fps);

// // slider
// const slider = document.createElement('input');
// slider.type = 'range';
// slider.min = '10';
// slider.max = '90';
// slider.value = INIT_FPS.toString();
// app?.appendChild(slider);

// slider.addEventListener('input', () => {
//   fps.textContent = `FPS: ${slider.value}`;
// });
// slider.addEventListener('change', () => {
//   player?.stop();
//   player = null;
//   player = new Player(renderer, canvas);
//   requestAnimationFrame(() => {
//     player?.play(parseInt(slider.value, 10));
//     console.log(parseInt(slider.value, 10));
//   });
// });

// // Control Frame
// let frameCanvas = renderer.createCanvasElement();
// app?.appendChild(frameCanvas);

// const frame = document.createElement('span');
// frame.textContent = `Frame: 0`;
// app?.appendChild(frame);

// // slider
// const frameSlider = document.createElement('input');
// frameSlider.type = 'range';
// frameSlider.min = '0';
// frameSlider.max = `${renderer.frameCount - 1}`;
// frameSlider.value = '0';
// app?.appendChild(frameSlider);

// frameSlider.addEventListener('input', () => {
//   frame.textContent = `Frame: ${frameSlider.value}`;
//   renderer.renderFrame(parseInt(frameSlider.value, 10), frameCanvas);
// });
// frameSlider.addEventListener('change', () => {
//   frame.textContent = `Frame: ${frameSlider.value}`;
//   renderer.renderFrame(parseInt(frameSlider.value, 10), frameCanvas);
// });

// const imgElement = document.createElement('img');
// imgElement.src = png;
// app?.appendChild(imgElement);
