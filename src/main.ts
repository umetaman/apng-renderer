// https://wiki.mozilla.org/APNG_Specification

const SIGNATURE_PNG = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

export interface IChunk<T> {
  length: number;
  type: string;
  data: T;
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

const isPNG = (buffer: Uint8Array): boolean => {
  const signature = buffer.slice(0, SIGNATURE_PNG.length);
  return signature.every((value, index) => value === SIGNATURE_PNG[index]);
};

export const readChunks = (buffer: Uint8Array): IChunk<Uint8Array>[] => {
  if (isPNG(buffer) == false) {
    throw new Error('This is not PNG');
  }

  const dataView = new DataView(buffer.buffer);

  const chunks: IChunk<Uint8Array>[] = [];

  let offset = SIGNATURE_PNG.length;
  while (offset < buffer.length) {
    // Chunkのデータの大きさ（4バイト）
    const length = dataView.getUint32(offset);
    offset += 4;
    // Chunkの型（4バイト）
    const typeBuffer = dataView.buffer.slice(offset, offset + 4);
    const type = String.fromCharCode(...new Uint8Array(typeBuffer));
    offset += 4;
    // 実データ
    const data = buffer.slice(offset, offset + length);
    offset += length;
    // CRC（4バイト）
    const crc = buffer.slice(offset, offset + 4);
    offset += 4;

    const chunk: IChunk<Uint8Array> = { length, type, data, crc };
    chunks.push(chunk);
  }

  return chunks;
};

export const readIHDR = (chunk: IChunk<Uint8Array>): IHDR => {
  if (chunk.type !== 'IHDR') {
    throw new Error('This is not IHDR');
  }

  const dataView = new DataView(chunk.data.buffer);

  const width = dataView.getUint32(0);
  const height = dataView.getUint32(4);
  const bitDepth = dataView.getUint8(8);
  const colorType = dataView.getUint8(9);
  const compressionMethod = dataView.getUint8(10);
  const filterMethod = dataView.getUint8(11);
  const interlaceMethod = dataView.getUint8(12);

  return {
    width,
    height,
    bitDepth,
    colorType,
    compressionMethod,
    filterMethod,
    interlaceMethod,
  };
};

export const readacTL = (chunk: IChunk<Uint8Array>): acTL => {
  if (chunk.type !== 'acTL') {
    throw new Error('This is not acTL');
  }

  const dataView = new DataView(chunk.data.buffer);

  const numFrames = dataView.getUint32(0);
  const numPlays = dataView.getUint32(4);

  return { numFrames, numPlays };
};

export const readfcTL = (chunk: IChunk<Uint8Array>): fcTL => {
  if (chunk.type !== 'fcTL') {
    throw new Error('This is not fcTL');
  }

  const dataView = new DataView(chunk.data.buffer);

  const sequenceNumber = dataView.getUint32(0);
  const width = dataView.getUint32(4);
  const height = dataView.getUint32(8);
  const xOffset = dataView.getUint32(12);
  const yOffset = dataView.getUint32(16);
  const delayNum = dataView.getUint16(20);
  const delayDen = dataView.getUint16(22);
  const disposeOp = dataView.getUint8(24);
  const blendOp = dataView.getUint8(25);

  return {
    sequenceNumber,
    width,
    height,
    xOffset,
    yOffset,
    delayNum,
    delayDen,
    disposeOp,
    blendOp,
  };
};

export const readfdAT = (chunk: IChunk<Uint8Array>): fdAT => {
  if (chunk.type !== 'fdAT') {
    throw new Error('This is not fdAT');
  }

  const dataView = new DataView(chunk.data.buffer);

  const sequenceNumber = dataView.getUint32(0);
  const data = chunk.data.slice(4);

  return { sequenceNumber, data };
};

export const readData = (chunks: IChunk<Uint8Array>[]): void => {
  for (const chunk of chunks) {
    console.log(chunk.type);
    if (chunk.type === 'IHDR') {
      const ihdr = readIHDR(chunk);
      console.log(ihdr);
    } else if (chunk.type === 'acTL') {
      const actl = readacTL(chunk);
      console.log(actl);
    } else if (chunk.type === 'fcTL') {
      const fctl = readfcTL(chunk);
      console.log(fctl);
    } else if (chunk.type === 'fdAT') {
      const fdat = readfdAT(chunk);
      console.log(fdat);
    }
  }
};
