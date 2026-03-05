const MIN_TEXT_PER_PAGE = 40;

export const detectScannedPdf = ({ text = '', pageCount = 0 } = {}) => {
  const normalizedText = String(text || '').replace(/\s+/g, ' ').trim();
  const safePageCount = Number.isFinite(pageCount) && pageCount > 0 ? pageCount : 0;
  const textLength = normalizedText.length;

  if (!safePageCount) {
    return {
      isLikelyScanned: false,
      reason: '',
    };
  }

  if (textLength === 0) {
    return {
      isLikelyScanned: true,
      reason: 'No readable text was extracted. This PDF may be scanned or image-based.',
    };
  }

  if ((textLength / safePageCount) < MIN_TEXT_PER_PAGE) {
    return {
      isLikelyScanned: true,
      reason: 'Very little readable text was extracted for the number of PDF pages.',
    };
  }

  return {
    isLikelyScanned: false,
    reason: '',
  };
};
