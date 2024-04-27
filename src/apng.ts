// https://wiki.mozilla.org/APNG_Specification

const SIGNATURE_PNG = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

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

const isPNG = (buffer: Uint8Array): boolean => {
  const signature = buffer.slice(0, SIGNATURE_PNG.length);
  return signature.every((value, index) => value === SIGNATURE_PNG[index]);
};

export const readChunks = (buffer: Uint8Array): IChunk<unknown>[] => {
  if (isPNG(buffer) == false) {
    throw new Error('This is not PNG');
  }

  const dataView = new DataView(buffer.buffer);

  const chunks: IChunk<unknown>[] = [];

  let offset = SIGNATURE_PNG.length;
  while (offset < buffer.length) {
    // 4Bytes, chunk data size
    const length = dataView.getUint32(offset);
    offset += 4;
    // 4Bytes, chunk type
    const typeBuffer = dataView.buffer.slice(offset, offset + 4);
    const type = String.fromCharCode(...new Uint8Array(typeBuffer));
    offset += 4;
    // data (content)
    const data = buffer.slice(offset, offset + length);
    offset += length;
    // crc32
    const crc = buffer.slice(offset, offset + 4);
    offset += 4;

    switch (type) {
      case 'IHDR':
        const ihdr = readIHDR(data);
        chunks.push({ length, type, content: ihdr, crc });
        break;
      case 'IDAT':
        const idat = { data };
        chunks.push({ length, type, content: idat, crc });
        break;
      case 'acTL':
        const actl = readacTL(data);
        chunks.push({ length, type, content: actl, crc });
        break;
      case 'fcTL':
        const fctl = readfcTL(data);
        chunks.push({ length, type, content: fctl, crc });
        break;
      case 'fdAT':
        const fdat = readfdAT(data);
        chunks.push({ length, type, content: fdat, crc });
        break;
      default:
        chunks.push({ length, type, content: data, crc });
    }
  }

  return chunks;
};

export const readIHDR = (data: Uint8Array): IHDR => {
  const dataView = new DataView(data.buffer);

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

export const readacTL = (data: Uint8Array): acTL => {
  const dataView = new DataView(data.buffer);

  const numFrames = dataView.getUint32(0);
  const numPlays = dataView.getUint32(4);

  return { numFrames, numPlays };
};

export const readfcTL = (data: Uint8Array): fcTL => {
  const dataView = new DataView(data.buffer);

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

export const readfdAT = (data: Uint8Array): fdAT => {
  const dataView = new DataView(data.buffer);

  const sequenceNumber = dataView.getUint32(0);

  return { sequenceNumber, data: data.slice(4) };
};
