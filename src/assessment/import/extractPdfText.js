import { getDocument, GlobalWorkerOptions, VerbosityLevel } from 'pdfjs-dist/legacy/build/pdf.mjs';
import { normalizeExtractedText, readBinaryInput } from './readBinaryInput.js';

const pageItemsToText = (items) => items
  .map((item) => {
    if (!item || typeof item.str !== 'string') {
      return '';
    }

    return item.hasEOL ? `${item.str}\n` : `${item.str} `;
  })
  .join('');

export const configurePdfWorker = ({
  workerSrc = '',
  globalWorkerOptions = GlobalWorkerOptions,
} = {}) => {
  if (!workerSrc || !globalWorkerOptions) {
    return '';
  }

  if (!globalWorkerOptions.workerSrc) {
    globalWorkerOptions.workerSrc = workerSrc;
  }

  return globalWorkerOptions.workerSrc;
};

export const extractPdfText = async (input) => {
  let loadingTask;

  try {
    const arrayBuffer = await readBinaryInput(input);

    loadingTask = getDocument({
      data: new Uint8Array(arrayBuffer),
      verbosity: VerbosityLevel.ERRORS,
    });

    const pdf = await loadingTask.promise;
    const pages = [];

    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      const page = await pdf.getPage(pageNumber);
      const content = await page.getTextContent();
      pages.push(normalizeExtractedText(pageItemsToText(content.items)));
      page.cleanup();
    }

    return {
      text: normalizeExtractedText(pages.filter(Boolean).join('\n\n')),
      pageCount: pdf.numPages,
      warnings: [],
    };
  } catch (error) {
    throw new Error(`PDF extraction failed: ${error.message}`);
  } finally {
    if (loadingTask) {
      await loadingTask.destroy();
    }
  }
};
