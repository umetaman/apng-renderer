const POLYNORMAL = 0xedb88320;

export const crc32 = (buffer: Uint8Array): number => {
  let crc = 0xffffffff;

  for (let i = 0; i < buffer.length; i++) {
    // https://ja.wikipedia.org/wiki/%E5%B7%A1%E5%9B%9E%E5%86%97%E9%95%B7%E6%A4%9C%E6%9F%BB
    crc = crc ^ buffer[i];
    for (let j = 0; j < 8; j++) {
      // 入力ビットの左端が1のとき
      if ((crc & 1) === 1) {
        // 1ビットシフトして除数とXOR
        crc = (crc >>> 1) ^ POLYNORMAL;
      } else {
        // 1ビットシフトのみ
        crc = crc >>> 1;
      }
    }
  }
  crc = crc ^ 0xffffffff;
  return crc;
};

const table = new Uint32Array(256);

// create table
for (let i = 0; i < 256; i++) {
  let crc = i;
  for (let j = 0; j < 8; j++) {
    // 入力ビットの左端が1のとき
    if ((crc & 1) === 1) {
      // 1ビットシフトして除数とXOR
      crc = (crc >>> 1) ^ POLYNORMAL;
    } else {
      // 1ビットシフトのみ
      crc = crc >>> 1;
    }
  }
  table[i] = crc;
}

export const crc32fast = (buffer: Uint8Array): number => {
  let crc = 0xffffffff;

  for (let i = 0; i < buffer.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ buffer[i]) & 0xff];
  }
  crc = crc ^ 0xffffffff;
  return crc;
};
