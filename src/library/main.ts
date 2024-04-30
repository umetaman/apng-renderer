import { IChunk, IHDR, acTL, fcTL, fdAT, IDAT } from './apng';
import { readChunks } from './decoder';
import {
  createBuffer,
  mergeIHDRAndfcTL,
  writeIDAT,
  writeIEND,
  writeIHDR,
  writeSignature,
} from './encoder';

export interface Frame {
  control: fcTL;
  content: fdAT | IDAT;
  image: HTMLImageElement | null;
}

export class Renderer {
  private chunks: IChunk<unknown>[];
  private numFrames: number = 0;
  private numPlays: number = 0;
  private ihdr: IHDR;
  private frames: Frame[] = [];

  get playCount() {
    return this.numPlays;
  }

  get frameCount() {
    return this.numFrames;
  }

  constructor(buffer: Uint8Array) {
    this.chunks = readChunks(buffer);
    if (!this.chunks) {
      throw new Error('Failed to read chunks');
    }

    // first chunk must be IHDR
    if (this.chunks[0].type !== 'IHDR') {
      throw new Error('IHDR not found');
    }
    this.ihdr = this.chunks[0].content as IHDR;

    const acTLChunk = this.chunks.find((chunk) => chunk.type === 'acTL');
    if (!acTLChunk) {
      throw new Error('acTL not found');
    }
    const actl = acTLChunk.content as acTL;
    this.numFrames = actl.numFrames;
    this.numPlays = actl.numPlays;

    // frames
    let frame: Partial<Frame> = { control: undefined, content: undefined };
    for (let i = 0; this.chunks[i].type !== 'IEND'; i++) {
      const chunk = this.chunks[i];
      if (chunk.type == 'fcTL') {
        frame.control = chunk.content as fcTL;
      }
      if (chunk.type == 'fdAT') {
        frame.content = chunk.content as fdAT;
      }
      if (chunk.type == 'IDAT') {
        frame.content = chunk.content as IDAT;
      }
      if (frame.control && frame.content) {
        this.frames.push(frame as Frame);
        frame = {};
      }
    }

    console.assert(this.frames.length == this.numFrames);
  }

  createCanvasElement(): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = this.ihdr.width;
    canvas.height = this.ihdr.height;
    return canvas;
  }

  renderFrame(index: number, canvasElement: HTMLCanvasElement) {
    const frame = this.frames[index];
    const image = frame.image;
    if (!image) {
      throw new Error('Image not loaded');
    }

    const ctx = canvasElement.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to get 2d context');
    }

    ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    ctx.drawImage(image, frame.control.xOffset, frame.control.yOffset);
  }

  async loadAsync() {
    const promises: Promise<void>[] = [];
    for (let i = 0; i < this.frames.length; i++) {
      const frame = this.frames[i];
      if (frame.content) {
        const png = this.buildPNG(frame.control, frame.content);
        const blob = new Blob([png], { type: 'image/png' });
        const url = URL.createObjectURL(blob);
        const image = new Image();
        image.src = url;
        const promise = new Promise<void>((resolve) => {
          image.onload = () => {
            frame.image = image;
            resolve();
          };
        });
        promises.push(promise);
      }
    }

    await Promise.all(promises);
  }

  buildPNG(control: fcTL, content: IDAT | fdAT): Uint8Array {
    const buffer = createBuffer(content);
    const ihdr = mergeIHDRAndfcTL(this.ihdr, control);

    let offset = 0;
    writeSignature(buffer);
    offset += 8;
    writeIHDR(buffer, ihdr, offset);
    offset += 25;
    writeIDAT(buffer, content.data, offset);
    // length, type, data, crc
    offset += 4 + 4 + content.data.length + 4;
    writeIEND(buffer, offset);
    return buffer;
  }
}