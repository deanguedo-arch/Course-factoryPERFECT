const isBlobLike = (value) => (
  value
  && typeof value === 'object'
  && typeof value.arrayBuffer === 'function'
);

export const readBinaryInput = async (input) => {
  if (input instanceof ArrayBuffer) {
    return input;
  }

  if (ArrayBuffer.isView(input)) {
    return input.buffer.slice(input.byteOffset, input.byteOffset + input.byteLength);
  }

  if (isBlobLike(input)) {
    return input.arrayBuffer();
  }

  throw new TypeError('Expected an ArrayBuffer, TypedArray, Buffer, Blob, or File.');
};

export const normalizeExtractedText = (value) => String(value || '')
  .replace(/\r\n?/g, '\n')
  .replace(/\u00a0/g, ' ')
  .replace(/[ \t]+\n/g, '\n')
  .replace(/\n{3,}/g, '\n\n')
  .trim();
