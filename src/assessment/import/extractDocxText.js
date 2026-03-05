import mammoth from 'mammoth';
import { normalizeExtractedText, readBinaryInput } from './readBinaryInput.js';

const toMammothInput = (arrayBuffer) => {
  if (typeof window === 'undefined' && typeof globalThis.Buffer !== 'undefined') {
    return { buffer: globalThis.Buffer.from(arrayBuffer) };
  }

  return { arrayBuffer };
};

export const extractDocxText = async (input) => {
  try {
    const arrayBuffer = await readBinaryInput(input);
    const result = await mammoth.extractRawText(toMammothInput(arrayBuffer));

    return {
      text: normalizeExtractedText(result.value),
      warnings: result.messages.map((message) => message.message || String(message)),
    };
  } catch (error) {
    throw new Error(`DOCX extraction failed: ${error.message}`);
  }
};
