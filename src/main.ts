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
