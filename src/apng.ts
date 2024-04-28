// https://wiki.mozilla.org/APNG_Specification

export const SIGNATURE_PNG: Readonly<number[]> = [
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
];

export interface IChunk<T> {
  length: number;
  type: string;
  content: T;
  crc: Uint8Array;
}

export interface IHDR {
  width: number;
  height: number;
  bitDepth: number;
  colorType: number;
  compressionMethod: number;
  filterMethod: number;
  interlaceMethod: number;
}

export interface IDAT {
  data: Uint8Array;
}
export interface acTL {
  numFrames: number;
  numPlays: number;
}

export interface fcTL {
  sequenceNumber: number;
  width: number;
  height: number;
  xOffset: number;
  yOffset: number;
  delayNum: number;
  delayDen: number;
  disposeOp: number;
  blendOp: number;
}

export interface fdAT {
  sequenceNumber: number;
  data: Uint8Array;
}

export const isPNG = (buffer: Uint8Array): boolean => {
  const signature = buffer.slice(0, SIGNATURE_PNG.length);
  return signature.every((value, index) => value === SIGNATURE_PNG[index]);
};
