import { SIGNATURE_PNG, IHDR, fcTL, IDAT, fdAT } from './apng';
import { crc32fast } from './crc32';

export const SIZE_TYPE = 4;
export const SIZE_IHDR = 13;
export const SIZE_IEND = 0;
export const SIZE_LENGTH = 4;
export const SIZE_CRC = 4;

export const mergeIHDRAndfcTL = (ihdr: IHDR, fctl: fcTL): IHDR => {
  const merged: IHDR = { ...ihdr };
  merged.width = fctl.width;
  merged.height = fctl.height;
  return merged;
};

export const writeSignature = (buffer: Uint8Array): void => {
  buffer.set(SIGNATURE_PNG, 0);
};

export const typeToArray = (type: string): Uint8Array => {
  // ascii
  return new Uint8Array(type.split('').map((char) => char.charCodeAt(0)));
};

export const writeIHDR = (
  buffer: Uint8Array,
  ihdr: IHDR,
  offset: number,
): void => {
  const dataView = new DataView(buffer.buffer);

  // chunk data size
  dataView.setUint32(offset, SIZE_IHDR);
  offset += 4;
  // chunk type
  buffer.set(typeToArray('IHDR'), offset);
  offset += 4;

  // content (13 bytes)
  dataView.setUint32(offset, ihdr.width);
  offset += 4;
  dataView.setUint32(offset, ihdr.height);
  offset += 4;
  dataView.setUint8(offset, ihdr.bitDepth);
  offset += 1;
  dataView.setUint8(offset, ihdr.colorType);
  offset += 1;
  dataView.setUint8(offset, ihdr.compressionMethod);
  offset += 1;
  dataView.setUint8(offset, ihdr.filterMethod);
  offset += 1;
  dataView.setUint8(offset, ihdr.interlaceMethod);
  offset += 1;

  // crc32
  const crc = crc32fast(buffer.slice(offset - SIZE_IHDR - SIZE_TYPE, offset));
  dataView.setUint32(offset, crc);
};

export const writeIDAT = (
  buffer: Uint8Array,
  data: Uint8Array,
  offset: number,
): void => {
  const dataView = new DataView(buffer.buffer);
  // chunk data size
  dataView.setUint32(offset, data.length);
  offset += 4;
  // chunk type
  buffer.set(typeToArray('IDAT'), offset);
  offset += 4;
  // content
  buffer.set(data, offset);
  offset += data.length;
  // crc32
  const crc = crc32fast(buffer.slice(offset - data.length - SIZE_TYPE, offset));
  dataView.setUint32(offset, crc);
};

export const writeIEND = (buffer: Uint8Array, offset: number): void => {
  const dataView = new DataView(buffer.buffer);
  // chunk data size
  dataView.setUint32(offset, 0);
  offset += 4;
  // chunk type
  buffer.set(typeToArray('IEND'), offset);
  offset += 4;
  // crc32
  const crc = crc32fast(buffer.slice(offset - SIZE_TYPE, offset));
  dataView.setUint32(offset, crc);
};

export const createBuffer = (content: IDAT | fdAT): Uint8Array => {
  /**
   * Signature: 8 bytes
   * IHDR: 25 bytes
   * IDAT: 12 + n bytes
   * IEND: 12 bytes
   */
  const bufferSize = 8 + 25 + 12 + content.data.length + 12;
  return new Uint8Array(bufferSize);
};
