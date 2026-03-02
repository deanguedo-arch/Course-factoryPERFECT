function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function toSafeUrl(url) {
  const raw = String(url || '').trim();
  if (!raw) return '';
  if (/^https?:\/\//i.test(raw) || raw.startsWith('/')) return raw;
  if (/^materials\//i.test(raw)) return `/${raw}`;
  return '';
}

function renderSimpleBody(body) {
  return escapeHtml(body || '').replace(/\n/g, '<br>');
}

function wrapCard({
  bodyHtml = '',
  title = '',
  subtitle = '',
  footerHtml = '',
  tone = '',
  elevated = true,
  flat = false,
  attrs = '',
} = {}) {
  const classes = ['cf-card'];
  if (flat) {
    classes.push('cf-card--flat');
  } else if (elevated) {
    classes.push('cf-card--elevated');
  }
  if (tone) classes.push(tone);
  return `
    <article class="${classes.join(' ')}" ${attrs}>
      ${title ? `<h3 class="text-lg font-bold">${escapeHtml(title)}</h3>` : ''}
      ${subtitle ? `<p class="text-sm cf-muted mt-2">${escapeHtml(subtitle)}</p>` : ''}
      ${bodyHtml || ''}
      ${footerHtml || ''}
    </article>
  `;
}

function sanitizeRichHtml(rawHtml) {
  const input = String(rawHtml || '');
  if (!input.trim()) return '';
  // Remove scripts and inline event handlers from authored rich text.
  return input
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/\son[a-z]+\s*=\s*(['"]).*?\1/gi, '')
    .replace(/\shref\s*=\s*(['"])\s*javascript:.*?\1/gi, ' href="#"');
}

function sanitizeCssColor(value) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  return /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(raw) ? raw : '';
}

const RICH_WEB_FONT_IMPORT_CSS = "@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&family=Roboto:wght@400;700;900&family=Open+Sans:wght@400;700;800&family=Lato:wght@400;700;900&family=Montserrat:wght@400;700;900&family=Poppins:wght@400;700;900&family=Raleway:wght@400;700;900&family=Nunito:wght@400;700;900&family=Playfair+Display:wght@400;700;900&family=Merriweather:wght@400;700;900&family=Oswald:wght@400;700&family=Bebas+Neue&display=swap');";

function escapeInlineScript(value) {
  return String(value || '').replace(/<\/script/gi, '<\\/script');
}

function encodeDataAttrJson(value) {
  try {
    return encodeURIComponent(JSON.stringify(value));
  } catch {
    return '';
  }
}

const RUBRIC_MIN_SIZE = 2;
const RUBRIC_MAX_SIZE = 5;

function clampRubricSize(value, fallback = 3) {
  const parsed = Number.parseInt(value, 10);
  const base = Number.isFinite(parsed) ? parsed : Number.parseInt(fallback, 10);
  const normalized = Number.isFinite(base) ? base : 3;
  return Math.max(RUBRIC_MIN_SIZE, Math.min(RUBRIC_MAX_SIZE, normalized));
}

function normalizeRubricScore(value, fallback = 0) {
  const parsed = Number.parseFloat(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.round(parsed * 100) / 100;
}

function formatRubricScore(value) {
  return Number.isInteger(value) ? String(value) : String(Math.round(value * 100) / 100);
}

function buildDefaultRubricColumns(count = 3) {
  const safeCount = clampRubricSize(count, 3);
  const presets = {
    2: [
      { label: 'Strong', score: 2 },
      { label: 'Needs Work', score: 1 },
    ],
    3: [
      { label: 'Exceeds', score: 3 },
      { label: 'Meets', score: 2 },
      { label: 'Developing', score: 1 },
    ],
    4: [
      { label: 'Exemplary', score: 4 },
      { label: 'Proficient', score: 3 },
      { label: 'Developing', score: 2 },
      { label: 'Beginning', score: 1 },
    ],
    5: [
      { label: 'Mastery', score: 5 },
      { label: 'Advanced', score: 4 },
      { label: 'Proficient', score: 3 },
      { label: 'Developing', score: 2 },
      { label: 'Beginning', score: 1 },
    ],
  };
  return (presets[safeCount] || presets[3]).map((column) => ({ ...column }));
}

function buildDefaultRubricRows(count = 3) {
  const safeCount = clampRubricSize(count, 3);
  return Array.from({ length: safeCount }, (_, idx) => ({
    label: `Criterion ${idx + 1}`,
  }));
}

function buildDefaultRubricCells(rows, columns) {
  return rows.map((row) =>
    columns.map((column) => `Describe "${column.label}" for ${row.label.toLowerCase()}.`),
  );
}

function normalizeWorksheetFieldType(value) {
  const raw = String(value || '').trim().toLowerCase();
  if (raw === 'textarea' || raw === 'number') return raw;
  return 'text';
}

function normalizeWorksheetHelperMode(value, block = null) {
  const raw = String(value || '').trim().toLowerCase();
  if (raw === 'rich') return 'rich';
  if (raw === 'plain') return 'plain';
  if (block && String(block?.helperHtml || block?.promptHtml || '').trim()) return 'rich';
  return 'plain';
}

function hasOwn(obj, key) {
  return Boolean(obj && typeof obj === 'object' && Object.prototype.hasOwnProperty.call(obj, key));
}

function normalizeWorksheetBlockKind(value) {
  const raw = String(value || '').trim().toLowerCase();
  return raw === 'title' ? 'title' : 'field';
}

export function createWorksheetBuilderBlock(kind = 'field') {
  const normalizedKind = normalizeWorksheetBlockKind(kind);
  if (normalizedKind === 'title') {
    return {
      kind: 'title',
      title: 'Section Title',
      showContent: false,
      content: '',
    };
  }
  return {
    kind: 'field',
    label: 'Field Label',
    fieldType: 'text',
    placeholder: '',
    helperMode: 'plain',
    helperText: '',
    helperHtml: '',
  };
}

function normalizeWorksheetTitleBlock(block) {
  const titleSource = hasOwn(block, 'title') ? block.title : block?.text;
  const contentSource = hasOwn(block, 'content') ? block.content : block?.instructions;
  const title = titleSource == null ? '' : String(titleSource);
  const content = contentSource == null ? '' : String(contentSource);
  const showContent = Boolean(block?.showContent === true || (content && block?.showContent !== false));
  return {
    kind: 'title',
    title,
    showContent,
    content,
  };
}

function normalizeWorksheetFieldBlock(block) {
  const label = block?.label == null ? '' : String(block.label);
  const placeholder = block?.placeholder == null ? '' : String(block.placeholder);
  const rawFieldType = block?.fieldType || block?.inputType || (block?.type !== 'field' ? block?.type : '');
  const helperTextSource = Object.prototype.hasOwnProperty.call(block || {}, 'helperText') ? block?.helperText : block?.prompt;
  const helperHtmlSource = Object.prototype.hasOwnProperty.call(block || {}, 'helperHtml') ? block?.helperHtml : block?.promptHtml;
  const helperText = helperTextSource == null ? '' : String(helperTextSource);
  const helperHtml = sanitizeRichHtml(helperHtmlSource == null ? '' : String(helperHtmlSource));
  const helperMode = normalizeWorksheetHelperMode(block?.helperMode, block);
  return {
    kind: 'field',
    label,
    fieldType: normalizeWorksheetFieldType(rawFieldType),
    placeholder,
    helperMode,
    helperText,
    helperHtml,
  };
}

const FILLABLE_CHART_MIN_SIZE = 1;
const FILLABLE_CHART_MAX_SIZE = 8;

function clampFillableChartSize(value, fallback = 2) {
  const parsed = Number.parseInt(value, 10);
  const base = Number.isFinite(parsed) ? parsed : Number.parseInt(fallback, 10);
  const normalized = Number.isFinite(base) ? base : 2;
  return Math.max(FILLABLE_CHART_MIN_SIZE, Math.min(FILLABLE_CHART_MAX_SIZE, normalized));
}

function normalizeFillableChartCell(cell) {
  if (cell && typeof cell === 'object' && !Array.isArray(cell)) {
    return {
      label: cell.label == null ? '' : String(cell.label),
      editable: cell.editable !== false,
      placeholder: cell.placeholder == null ? '' : String(cell.placeholder),
    };
  }
  const text = cell == null ? '' : String(cell);
  if (text.trim()) {
    return {
      label: text,
      editable: false,
      placeholder: '',
    };
  }
  return {
    label: '',
    editable: true,
    placeholder: 'Type your response...',
  };
}

export function normalizeFillableChartData(data = {}) {
  const rowCount = clampFillableChartSize(data.rowCount, Array.isArray(data.rows) ? data.rows.length : 2);
  const colCount = clampFillableChartSize(data.colCount, Array.isArray(data.columns) ? data.columns.length : 2);
  const showRowLabels = data?.showRowLabels !== false;
  const hasRowLabelHeader = Object.prototype.hasOwnProperty.call(data || {}, 'rowLabelHeader');
  const rowLabelHeader = hasRowLabelHeader ? String(data?.rowLabelHeader ?? '') : 'Rows';
  const rows = Array.from({ length: rowCount }, (_, rowIdx) => {
    const raw = Array.isArray(data.rows) ? data.rows[rowIdx] : null;
    const fallbackLabel = `Row ${rowIdx + 1}`;
    const hasLabel = Boolean(raw && typeof raw === 'object' && Object.prototype.hasOwnProperty.call(raw, 'label'));
    return {
      id: String(raw?.id || `row-${rowIdx + 1}`),
      label: hasLabel ? String(raw?.label ?? '') : fallbackLabel,
    };
  });
  const columns = Array.from({ length: colCount }, (_, colIdx) => {
    const raw = Array.isArray(data.columns) ? data.columns[colIdx] : null;
    const fallbackLabel = `Column ${colIdx + 1}`;
    const hasLabel = Boolean(raw && typeof raw === 'object' && Object.prototype.hasOwnProperty.call(raw, 'label'));
    return {
      id: String(raw?.id || `col-${colIdx + 1}`),
      label: hasLabel ? String(raw?.label ?? '') : fallbackLabel,
    };
  });
  const cells = rows.map((_, rowIdx) =>
    columns.map((__, colIdx) => {
      const raw = Array.isArray(data.cells) && Array.isArray(data.cells[rowIdx]) ? data.cells[rowIdx][colIdx] : null;
      return normalizeFillableChartCell(raw);
    }),
  );
  return {
    rowCount,
    colCount,
    showRowLabels,
    rowLabelHeader,
    rows,
    columns,
    cells,
  };
}

export function normalizeWorksheetBuilderBlocks(data = {}) {
  const hasBlocksProp = hasOwn(data, 'blocks');
  const rawBlocks = Array.isArray(data.blocks) ? data.blocks : [];
  if (hasBlocksProp) {
    return rawBlocks.map((block, idx) => {
      const kind = normalizeWorksheetBlockKind(block?.kind || block?.blockType || block?.type || 'field');
      return kind === 'title' ? normalizeWorksheetTitleBlock(block, idx) : normalizeWorksheetFieldBlock(block, idx);
    });
  }

  const legacyBlocks = [];
  const legacyTitle = String(data.title || '').trim();
  if (legacyTitle) {
    legacyBlocks.push(
      normalizeWorksheetTitleBlock(
        {
          title: legacyTitle,
          showContent: false,
          content: '',
        },
        0,
      ),
    );
  }
  const legacyFields = Array.isArray(data.fields) ? data.fields : [];
  legacyFields.forEach((field, idx) => {
    legacyBlocks.push(normalizeWorksheetFieldBlock(field, idx));
  });
  return legacyBlocks;
}

function normalizeKnowledgeQuestionType(value) {
  const raw = String(value || '').trim().toLowerCase();
  return raw === 'short_answer' || raw === 'short-answer' || raw === 'short' ? 'short_answer' : 'multiple_choice';
}

function normalizeKnowledgeQuestionOptions(options, { ensureMinimum = false } = {}) {
  const list = (Array.isArray(options) ? options : []).map((option) => (option == null ? '' : String(option)));
  if (!ensureMinimum) return list;
  const nonEmpty = list.map((option) => option.trim()).filter(Boolean);
  if (nonEmpty.length >= 2) return nonEmpty;
  if (nonEmpty.length === 1) return [nonEmpty[0], 'Option B'];
  return ['Option A', 'Option B'];
}

export function createKnowledgeCheckBuilderQuestion(kind = 'multiple_choice') {
  const normalizedType = normalizeKnowledgeQuestionType(kind);
  if (normalizedType === 'short_answer') {
    return {
      type: 'short_answer',
      prompt: 'Add a short-answer prompt.',
      placeholder: 'Write your response...',
    };
  }
  return {
    type: 'multiple_choice',
    prompt: 'Add your question prompt here.',
    options: ['Option A', 'Option B', 'Option C'],
    correctIndex: 0,
  };
}

function normalizeKnowledgeQuestion(question = {}) {
  const type = normalizeKnowledgeQuestionType(question?.type || question?.kind);
  if (type === 'short_answer') {
    return {
      type: 'short_answer',
      prompt: question?.prompt == null ? '' : String(question.prompt),
      placeholder: question?.placeholder == null ? '' : String(question.placeholder),
    };
  }
  const options = normalizeKnowledgeQuestionOptions(question?.options);
  const rawCorrect = Number.parseInt(question?.correctIndex, 10);
  const maxOptionIndex = Math.max(options.length - 1, 0);
  const correctIndex = Number.isFinite(rawCorrect) ? Math.max(0, Math.min(rawCorrect, maxOptionIndex)) : 0;
  return {
    type: 'multiple_choice',
    prompt: question?.prompt == null ? '' : String(question.prompt),
    options,
    correctIndex,
  };
}

export function normalizeKnowledgeCheckBuilderQuestions(data = {}) {
  const hasQuestionsProp = hasOwn(data, 'questions');
  const rawQuestions = Array.isArray(data.questions) ? data.questions : [];
  if (hasQuestionsProp) {
    return rawQuestions.map((question, idx) => normalizeKnowledgeQuestion(question, idx));
  }

  const legacyQuestions = [];
  const legacyPrompt = String(data.prompt || '').trim();
  const legacyOptions = Array.isArray(data.options) ? data.options : [];
  const hasLegacyMultipleChoice = Boolean(legacyPrompt || legacyOptions.some((option) => String(option || '').trim()));
  if (hasLegacyMultipleChoice || !String(data.shortAnswerPrompt || '').trim()) {
    legacyQuestions.push(
      normalizeKnowledgeQuestion(
        {
          type: 'multiple_choice',
          prompt: data.prompt,
          options: data.options,
          correctIndex: data.correctIndex,
        },
        0,
      ),
    );
  }
  const shortPrompt = String(data.shortAnswerPrompt || '').trim();
  if (shortPrompt) {
    legacyQuestions.push(
      normalizeKnowledgeQuestion(
        {
          type: 'short_answer',
          prompt: shortPrompt,
          placeholder: data.shortAnswerPlaceholder,
        },
        legacyQuestions.length,
      ),
    );
  }
  if (!legacyQuestions.length) {
    legacyQuestions.push(createKnowledgeCheckBuilderQuestion('multiple_choice'));
  }
  return legacyQuestions;
}

export const ACTIVITY_REGISTRY = {
  content_block: {
    type: 'content_block',
    label: 'Content Block',
    createDefaultData() {
      return {
        title: 'New Section',
        body: 'Write your lesson content here.',
        bodyMode: 'rich',
        bodyHtml: '<p>Write your lesson content here.</p>',
        blockContainerBg: '',
        bodyContainerBg: '',
      };
    },
    compileToHtml({ data = {} } = {}) {
      const richBody = sanitizeRichHtml(data.bodyHtml || '');
      const bodyHtml = data.bodyMode === 'plain' || !richBody ? renderSimpleBody(data.body) : richBody;
      const containerBg = sanitizeCssColor(data.bodyContainerBg || data.blockContainerBg || data.containerBg);
      const containerStyle = containerBg ? ` style="background:${escapeHtml(containerBg)};"` : '';
      const styleTag = `
        <style>
          ${RICH_WEB_FONT_IMPORT_CSS}
          .cf-rich-content p { margin: 0.6rem 0; }
          .cf-rich-content ul { list-style: disc; padding-left: 1.5rem; margin: 0.75rem 0; }
          .cf-rich-content ol { list-style: decimal; padding-left: 1.5rem; margin: 0.75rem 0; }
          .cf-rich-content li { margin: 0.35rem 0; }
          .cf-rich-content h1 { font-size: 1.875rem; line-height: 2.25rem; font-weight: 700; margin: 1rem 0 0.5rem; }
          .cf-rich-content h2 { font-size: 1.5rem; line-height: 2rem; font-weight: 700; margin: 0.9rem 0 0.45rem; }
          .cf-rich-content h3 { font-size: 1.25rem; line-height: 1.75rem; font-weight: 700; margin: 0.8rem 0 0.4rem; }
          .cf-rich-content a { text-decoration: underline; }
          .cf-rich-content blockquote { border-left: 3px solid color-mix(in srgb, var(--cf-border) 70%, var(--cf-accent) 30%); margin: 0.9rem 0; padding-left: 0.8rem; opacity: 0.95; }
          .cf-rich-content div { margin: 0.45rem 0; }
          .cf-rich-content font[size='1'] { font-size: 0.75rem; }
          .cf-rich-content font[size='2'] { font-size: 0.875rem; }
          .cf-rich-content font[size='3'] { font-size: 1rem; }
          .cf-rich-content font[size='4'] { font-size: 1.125rem; }
          .cf-rich-content font[size='5'] { font-size: 1.25rem; }
          .cf-rich-content font[size='6'] { font-size: 1.5rem; }
          .cf-rich-content font[size='7'] { font-size: 1.875rem; }
        </style>
      `;
      return wrapCard({
        title: data.title || '',
        attrs: containerStyle,
        bodyHtml: `${styleTag}<div class="leading-relaxed cf-rich-content">${bodyHtml}</div>`,
      });
    },
  },
  title_block: {
    type: 'title_block',
    label: 'Title Block',
    createDefaultData() {
      return {
        text: 'Module Title',
        textMode: 'rich',
        textHtml: '<h2>Module Title</h2>',
        align: 'left',
        blockContainerBg: '',
        bodyContainerBg: '',
      };
    },
    compileToHtml({ data = {} } = {}) {
      const richText = sanitizeRichHtml(data.textHtml || '');
      const textHtml = data.textMode === 'plain' || !richText ? renderSimpleBody(data.text || '') : richText;
      const align = String(data.align || 'left').toLowerCase();
      const alignClass = align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left';
      const containerBg = sanitizeCssColor(data.bodyContainerBg || data.blockContainerBg || data.containerBg);
      const containerStyle = containerBg ? ` style="background:${escapeHtml(containerBg)};"` : '';
      const styleTag = `
        <style>
          ${RICH_WEB_FONT_IMPORT_CSS}
          .cf-title-content p { margin: 0.45rem 0; }
          .cf-title-content h1 { font-size: 2.5rem; line-height: 1.1; font-weight: 900; margin: 0.4rem 0; }
          .cf-title-content h2 { font-size: 2rem; line-height: 1.15; font-weight: 850; margin: 0.35rem 0; }
          .cf-title-content h3 { font-size: 1.5rem; line-height: 1.2; font-weight: 800; margin: 0.3rem 0; }
          .cf-title-content h4 { font-size: 1.25rem; line-height: 1.25; font-weight: 750; margin: 0.3rem 0; }
          .cf-title-content ul { list-style: disc; padding-left: 1.5rem; margin: 0.65rem 0; }
          .cf-title-content ol { list-style: decimal; padding-left: 1.5rem; margin: 0.65rem 0; }
          .cf-title-content li { margin: 0.2rem 0; }
          .cf-title-content a { text-decoration: underline; }
          .cf-title-content blockquote { border-left: 3px solid color-mix(in srgb, var(--cf-accent2) 65%, var(--cf-border) 35%); margin: 0.75rem 0; padding-left: 0.8rem; opacity: 0.95; }
          .cf-title-content font[size='1'] { font-size: 0.75rem; }
          .cf-title-content font[size='2'] { font-size: 0.875rem; }
          .cf-title-content font[size='3'] { font-size: 1rem; }
          .cf-title-content font[size='4'] { font-size: 1.125rem; }
          .cf-title-content font[size='5'] { font-size: 1.25rem; }
          .cf-title-content font[size='6'] { font-size: 1.5rem; }
          .cf-title-content font[size='7'] { font-size: 1.875rem; }
        </style>
      `;
      return wrapCard({
        attrs: `data-title-block ${containerStyle}`.trim(),
        bodyHtml: `${styleTag}<div class="cf-title-content leading-tight ${alignClass}">${textHtml}</div>`,
      });
    },
  },
  spacer_block: {
    type: 'spacer_block',
    label: 'Spacer (Empty)',
    createDefaultData() {
      return {
        height: 48,
      };
    },
    compileToHtml({ data = {} } = {}) {
      const rawHeight = Number.parseInt(data.height, 10);
      const height = Number.isFinite(rawHeight) ? Math.max(0, Math.min(600, rawHeight)) : 48;
      return `
        <div
          aria-hidden="true"
          data-spacer-block
          class="rounded-xl border border-dashed  bg-transparent"
          style="min-height: ${height}px;"
        ></div>
      `;
    },
  },
  embed_block: {
    type: 'embed_block',
    label: 'Embed Block',
    createDefaultData() {
      return {
        url: '',
        caption: '',
      };
    },
    compileToHtml({ data = {} } = {}) {
      const safeUrl = toSafeUrl(data.url);
      const caption = escapeHtml(data.caption || '');
      if (!safeUrl) {
        return `
          <article class="cf-card cf-card--elevated tone-warning">
            <p class="text-sm font-semibold uppercase tracking-wider">Embed missing URL</p>
          </article>
        `;
      }
      return `
        <article class="cf-card cf-card--elevated">
          <div class="aspect-video rounded-lg overflow-hidden border  bg-black">
            <iframe src="${escapeHtml(safeUrl)}" title="${caption || 'Embedded content'}" class="w-full h-full" frameborder="0" allowfullscreen loading="lazy"></iframe>
          </div>
          ${caption ? `<p class="text-xs cf-muted mt-3">${caption}</p>` : ''}
          <p class="text-xs mt-2"><a href="${escapeHtml(safeUrl)}" target="_blank" rel="noopener noreferrer" class="underline">Open in new tab</a></p>
        </article>
      `;
    },
  },
  image_block: {
    type: 'image_block',
    label: 'Image',
    createDefaultData() {
      return {
        url: '',
        alt: '',
        caption: '',
        width: 'full',
      };
    },
    compileToHtml({ data = {} } = {}) {
      const safeUrl = toSafeUrl(data.url);
      const alt = escapeHtml(data.alt || 'Image');
      const caption = escapeHtml(data.caption || '');
      const width = String(data.width || 'full');
      const widthClassMap = {
        full: 'w-full',
        wide: 'w-full md:w-5/6 mx-auto',
        medium: 'w-full md:w-2/3 mx-auto',
        small: 'w-full md:w-1/2 mx-auto',
      };
      const widthClass = widthClassMap[width] || widthClassMap.full;
      if (!safeUrl) {
        return `
          <article class="cf-card cf-card--elevated tone-warning">
            <p class="text-sm font-semibold uppercase tracking-wider">Image URL missing</p>
          </article>
        `;
      }
      return `
        <figure class="cf-card cf-card--elevated ${widthClass}">
          <img src="${escapeHtml(safeUrl)}" alt="${alt}" class="w-full h-auto rounded-lg border " loading="lazy" />
          ${caption ? `<figcaption class="text-xs cf-muted mt-3">${caption}</figcaption>` : ''}
        </figure>
      `;
    },
  },
  resource_list: {
    type: 'resource_list',
    label: 'Resource List',
    createDefaultData() {
      return {
        title: 'Resources',
        items: [{ label: 'Resource link', viewUrl: '', downloadUrl: '' }],
      };
    },
    compileToHtml({ data = {} } = {}) {
      const items = Array.isArray(data.items) ? data.items : [];
      const rows = items
        .filter((item) => item && (item.label || item.url || item.viewUrl || item.downloadUrl || item.digitalContent))
        .map((item) => {
          const safeViewUrl = toSafeUrl(item.viewUrl || item.url);
          const safeDownloadUrl = toSafeUrl(item.downloadUrl || item.url);
          const label = escapeHtml(item.label || item.viewUrl || item.downloadUrl || item.url || 'Resource');
          const desc = escapeHtml(item.description || '');
          const encodedDigitalContent = item && item.digitalContent ? encodeDataAttrJson(item.digitalContent) : '';
          const viewButton = safeViewUrl
            ? `<button type="button" class="px-3 py-2 rounded cf-btn cf-btn--primary  text-[11px] font-bold uppercase tracking-wide" data-resource-view data-resource-url="${escapeHtml(safeViewUrl)}" data-resource-title="${label}">View</button>`
            : '';
          const downloadButton = safeDownloadUrl
            ? `<button type="button" class="px-3 py-2 rounded cf-btn cf-btn--ghost  text-[11px] font-bold uppercase tracking-wide text-center" data-resource-download data-resource-download-url="${escapeHtml(safeDownloadUrl)}" data-resource-download-name="${label}">Download</button>`
            : '';
          const readButton = encodedDigitalContent
            ? `<button type="button" class="px-3 py-2 rounded cf-btn cf-btn--primary  text-[11px] font-bold uppercase tracking-wide text-center" data-resource-read data-resource-read-title="${label}" data-resource-read-content="${escapeHtml(encodedDigitalContent)}">Read</button>`
            : '';
          if (!viewButton && !downloadButton && !readButton) {
            return `<li class="cf-card cf-card--flat p-4"><p class=" text-sm font-semibold">${label}</p>${desc ? `<p class="text-xs cf-muted mt-1">${desc}</p>` : ''}</li>`;
          }
          return `
            <li class="cf-card cf-card--flat p-4">
              <p class=" text-sm font-semibold">${label}</p>
              ${desc ? `<p class="text-xs cf-muted mt-1">${desc}</p>` : ''}
              <div class="mt-3 flex flex-wrap gap-2">
                ${viewButton}
                ${downloadButton}
                ${readButton}
              </div>
            </li>
          `;
        });
      return `
        <article class="cf-card cf-card--elevated">
          <h3 class="text-lg font-bold  mb-3">${escapeHtml(data.title || 'Resources')}</h3>
          <div class="is-hidden mb-4 rounded-lg border overflow-hidden bg-black" data-resource-viewer>
            <div class="flex items-center justify-between cf-card cf-card--flat px-3 py-2">
              <p class="text-xs font-bold uppercase tracking-widest " data-resource-viewer-title>Resource Viewer</p>
              <button type="button" class="cf-btn cf-btn--ghost text-xs font-bold uppercase tracking-widest" data-resource-viewer-close>Close</button>
            </div>
            <iframe src="" title="Resource viewer" class="w-full border-0" style="height: 70vh;" data-resource-viewer-frame></iframe>
          </div>
          <div class="is-hidden mb-4 rounded-lg border border-emerald-500/30 overflow-hidden bg-transparent" data-resource-reader>
            <div class="flex items-center justify-between cf-card cf-card--flat px-3 py-2">
              <p class="text-xs font-bold uppercase tracking-widest tone-success" data-resource-reader-title>Digital Resource</p>
              <button type="button" class="cf-btn cf-btn--ghost text-xs font-bold uppercase tracking-widest" data-resource-reader-close>Close</button>
            </div>
            <div class="flex" style="height: 70vh;">
              <aside class="hidden md:block w-64 border-r bg-transparent p-3 overflow-y-auto custom-scroll">
                <p class="text-[10px] font-bold uppercase tracking-widest cf-muted mb-2">Contents</p>
                <div class="space-y-1" data-resource-reader-toc></div>
              </aside>
              <div class="flex-1 p-4 md:p-6 overflow-y-auto custom-scroll">
                <div data-resource-reader-body></div>
                <div class="mt-6 pt-4 border-t  flex items-center justify-between gap-3">
                  <button type="button" class="px-3 py-2 rounded cf-btn cf-btn--ghost  text-[11px] font-bold uppercase tracking-wide disabled:opacity-40" data-resource-reader-prev>Previous</button>
                  <p class="text-[11px] font-bold uppercase tracking-widest cf-muted" data-resource-reader-progress></p>
                  <button type="button" class="px-3 py-2 rounded cf-btn cf-btn--ghost  text-[11px] font-bold uppercase tracking-wide disabled:opacity-40" data-resource-reader-next>Next</button>
                </div>
              </div>
            </div>
          </div>
          ${rows.length ? `<ul class="space-y-3 text-sm">${rows.join('\n')}</ul>` : '<p class="cf-muted text-sm">No resources added yet.</p>'}
        </article>
      `;
    },
  },
  assessment_embed: {
    type: 'assessment_embed',
    label: 'Assessment Block',
    createDefaultData() {
      return {
        title: 'Assessments',
        items: [],
      };
    },
    compileToHtml({ data = {} } = {}) {
      const items = Array.isArray(data.items) ? data.items : [];
      const cards = items.map((item, idx) => {
        const title = escapeHtml(item?.title || `Assessment ${idx + 1}`);
        const html = String(item?.html || '');
        const script = escapeInlineScript(item?.script || '');
        return `
          <div class="cf-card cf-card--elevated bg-transparent p-4">
            <h4 class="text-base font-bold ">${title}</h4>
            <div class="mt-4 space-y-3">
              ${html || '<p class="cf-muted text-sm">No assessment HTML found for this item.</p>'}
            </div>
            ${script ? `<script>(function(){\n${script}\n})();<\\/script>` : ''}
          </div>
        `;
      });
      return `
        <article class="cf-card cf-card--elevated tone-info">
          <h3 class="text-lg font-bold mb-3">${escapeHtml(data.title || 'Assessments')}</h3>
          ${cards.length ? `<div class="space-y-4">${cards.join('\n')}</div>` : '<p class="cf-muted text-sm">No assessments linked yet.</p>'}
        </article>
      `;
    },
  },
  rubric_creator: {
    type: 'rubric_creator',
    label: 'Rubric Creator',
    createDefaultData() {
      const rowCount = 3;
      const colCount = 3;
      const rows = buildDefaultRubricRows(rowCount);
      const columns = buildDefaultRubricColumns(colCount);
      return {
        title: 'Performance Rubric',
        instructions: 'Review each criterion and choose one level per row.',
        rowCount,
        colCount,
        selfScoringEnabled: true,
        totalLabel: 'Self Score Total',
        rows,
        columns,
        cells: buildDefaultRubricCells(rows, columns),
      };
    },
    compileToHtml({ data = {}, activityId = '' } = {}) {
      const rowCount = clampRubricSize(data.rowCount, Array.isArray(data.rows) ? data.rows.length : 3);
      const colCount = clampRubricSize(data.colCount, Array.isArray(data.columns) ? data.columns.length : 3);
      const rows = Array.from({ length: rowCount }, (_, rowIdx) => {
        const raw = Array.isArray(data.rows) ? data.rows[rowIdx] : null;
        const fallback = `Criterion ${rowIdx + 1}`;
        const label = String(raw?.label || fallback).trim() || fallback;
        return { label };
      });
      const columns = Array.from({ length: colCount }, (_, colIdx) => {
        const raw = Array.isArray(data.columns) ? data.columns[colIdx] : null;
        const fallbackLabel = `Level ${colIdx + 1}`;
        const fallbackScore = colCount - colIdx;
        const label = String(raw?.label || fallbackLabel).trim() || fallbackLabel;
        const score = normalizeRubricScore(raw?.score, fallbackScore);
        return { label, score };
      });
      const cells = rows.map((row, rowIdx) =>
        columns.map((column, colIdx) => {
          const raw = Array.isArray(data.cells) && Array.isArray(data.cells[rowIdx]) ? data.cells[rowIdx][colIdx] : '';
          const fallback = `Describe "${column.label}" for ${row.label.toLowerCase()}.`;
          return String(raw || fallback).trim() || fallback;
        }),
      );
      const selfScoringEnabled = data.selfScoringEnabled !== false;
      const rubricKey = String(activityId || 'rubric').replace(/[^a-z0-9_-]/gi, '-').toLowerCase();
      const maxColumnScore = columns.reduce((max, column) => Math.max(max, Number(column.score) || 0), 0);
      const maxTotalScore = normalizeRubricScore(maxColumnScore * rows.length, 0);
      return `
        <article class="cf-card cf-card--elevated tone-success" data-rubric-block data-rubric-id="${escapeHtml(rubricKey)}">
          <h3 class="text-lg font-bold">${escapeHtml(data.title || 'Rubric')}</h3>
          ${
            data.instructions
              ? `<p class="text-sm cf-muted mt-2">${renderSimpleBody(data.instructions || '')}</p>`
              : ''
          }
          <div class="mt-4 overflow-x-auto rounded-lg border ">
            <table class="min-w-full border-collapse text-xs">
              <thead class="bg-transparent">
                <tr>
                  <th class="p-3 border-b  text-left font-bold uppercase tracking-wider cf-muted">Criteria</th>
                  ${columns
                    .map(
                      (column) => `
                        <th class="p-3 border-b  text-left font-bold uppercase tracking-wider cf-muted">
                          <div>${escapeHtml(column.label)}</div>
                          <div class="text-[10px] font-semibold tone-info mt-1">Score: ${escapeHtml(formatRubricScore(column.score))}</div>
                        </th>
                      `,
                    )
                    .join('\n')}
                </tr>
              </thead>
              <tbody>
                ${rows
                  .map(
                    (row, rowIdx) => `
                    <tr data-rubric-row="${rowIdx}">
                      <th class="align-top p-3 border-b  bg-transparent text-left  font-bold" data-rubric-row-label>${escapeHtml(row.label)}</th>
                      ${columns
                        .map(
                          (column, colIdx) => `
                          <td class="align-top p-3 border-b  bg-transparent transition-colors" data-rubric-cell data-rubric-row="${rowIdx}" data-rubric-col="${colIdx}" data-rubric-score="${escapeHtml(formatRubricScore(column.score))}">
                            <p class="text-xs cf-muted leading-relaxed">${escapeHtml(cells[rowIdx][colIdx])}</p>
                            ${
                              selfScoringEnabled
                                ? `
                                  <label class="mt-3 inline-flex items-center gap-2 rounded border  bg-transparent px-2 py-1 cursor-pointer">
                                    <input
                                      type="radio"
                                      name="rubric-${escapeHtml(rubricKey)}-row-${rowIdx}"
                                      value="${escapeHtml(formatRubricScore(column.score))}"
                                      data-rubric-choice
                                      data-rubric-row="${rowIdx}"
                                      data-rubric-col="${colIdx}"
                                      data-rubric-score="${escapeHtml(formatRubricScore(column.score))}"
                                      class="w-3.5 h-3.5"
                                    />
                                    <span class="text-[10px] font-semibold uppercase tracking-wide ">Select</span>
                                  </label>
                                `
                                : ''
                            }
                          </td>
                        `,
                        )
                        .join('\n')}
                    </tr>
                  `,
                  )
                  .join('\n')}
              </tbody>
            </table>
          </div>
          ${
            selfScoringEnabled
              ? `
                <div class="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3 tone-success">
                  <p class="text-xs font-bold uppercase tracking-wider">${escapeHtml(data.totalLabel || 'Self Score Total')}</p>
                  <div class="flex items-center gap-2">
                    <p class="text-lg font-black ">
                      <span data-rubric-total>0</span>
                      <span class="text-xs font-semibold cf-muted"> / <span data-rubric-max>${escapeHtml(formatRubricScore(maxTotalScore))}</span></span>
                    </p>
                    <button type="button" class="px-2 py-1 rounded cf-btn cf-btn--ghost text-[10px] font-bold uppercase tracking-wide " data-rubric-clear>
                      Clear
                    </button>
                  </div>
                </div>
              `
              : '<p class="mt-4 text-[11px] cf-muted">Self-scoring is disabled for this rubric.</p>'
          }
        </article>
      `;
    },
  },
  knowledge_check: {
    type: 'knowledge_check',
    label: 'Knowledge Check',
    createDefaultData() {
      return {
        title: 'Knowledge Check',
        questions: [createKnowledgeCheckBuilderQuestion('multiple_choice')],
      };
    },
    compileToHtml({ data = {}, index = 0, activityId = '' } = {}) {
      const questions = normalizeKnowledgeCheckBuilderQuestions(data);
      const blockTitle = hasOwn(data, 'title') ? String(data.title ?? '').trim() : 'Knowledge Check';
      return `
        <article class="cf-card cf-card--elevated" data-kc-block data-kc-id="${escapeHtml(activityId)}">
          ${blockTitle ? `<h3 class="text-lg font-bold  mb-4">${escapeHtml(blockTitle)}</h3>` : ''}
          <div class="space-y-4">
            ${questions
              .map((question, questionIdx) => {
                const prompt = escapeHtml(question.prompt == null ? '' : String(question.prompt));
                if (question.type === 'short_answer') {
                  const placeholder = escapeHtml(question.placeholder == null ? 'Write your response...' : String(question.placeholder));
                  return `
                    <section class="rounded-lg border p-4 tone-info" data-kc-question data-kc-kind="short_answer" data-kc-question-index="${questionIdx}">
                      <p class="text-[10px] font-bold uppercase tracking-widest mb-2">Question ${questionIdx + 1}</p>
                      <label class="text-xs font-semibold uppercase tracking-wide cf-muted block mb-2" data-kc-prompt>${prompt}</label>
                      <textarea
                        class="w-full min-h-28 cf-card cf-card--flat p-3 "
                        data-kc-short-answer
                        placeholder="${placeholder}"
                      ></textarea>
                    </section>
                  `;
                }
                const questionName = `kc-${index}-${activityId}-${questionIdx}`;
                const options = normalizeKnowledgeQuestionOptions(question.options);
                const maxOptionIndex = Math.max(options.length - 1, 0);
                const normalizedCorrect = Number.isInteger(question.correctIndex) ? Math.max(0, Math.min(question.correctIndex, maxOptionIndex)) : 0;
                return `
                  <section class="cf-card cf-card--flat p-4" data-kc-question data-kc-kind="multiple_choice" data-kc-question-index="${questionIdx}" data-kc-correct="${normalizedCorrect}">
                    <p class="text-[10px] font-bold uppercase tracking-widest cf-muted mb-2">Question ${questionIdx + 1}</p>
                    <h4 class="text-sm font-bold  mb-3" data-kc-prompt>${prompt}</h4>
                    <div class="space-y-2">
                      ${
                        options.length
                          ? options
                              .map(
                                (opt, optIdx) => `
                                  <label class="flex items-center gap-3 cf-card cf-card--flat p-3 ">
                                    <input type="radio" name="${escapeHtml(questionName)}" value="${optIdx}" class="w-4 h-4" />
                                    <span>${escapeHtml(opt)}</span>
                                  </label>
                                `,
                              )
                              .join('\n')
                          : '<p class="text-xs cf-muted">No options added yet.</p>'
                      }
                    </div>
                    <div class="mt-4 flex items-center gap-3">
                      <button type="button" class="px-3 py-2 rounded cf-btn cf-btn--primary  text-xs font-bold uppercase tracking-wide" data-kc-check>
                        Check Answer
                      </button>
                      <p class="text-xs cf-muted" data-kc-result></p>
                    </div>
                  </section>
                `;
              })
              .join('\n')}
          </div>
        </article>
      `;
    },
  },
  submission_builder: {
    type: 'submission_builder',
    label: 'Generate Report',
    createDefaultData() {
      return {
        title: 'Report Generator',
        buttonLabel: 'Generate Report',
      };
    },
    compileToHtml({ data = {} } = {}) {
      return `
        <article class="cf-card cf-card--elevated tone-success" data-submission-block>
          <h3 class="text-lg font-bold mb-3">${escapeHtml(data.title || 'Report Generator')}</h3>
          <div class="flex flex-wrap gap-3">
            <button type="button" class="px-4 py-2 rounded cf-btn cf-btn--primary  text-xs font-bold uppercase tracking-wide" data-submission-generate>
              ${escapeHtml(data.buttonLabel || 'Generate Report')}
            </button>
            <button type="button" class="px-4 py-2 rounded cf-btn cf-btn--ghost  text-xs font-bold uppercase tracking-wide" data-submission-copy>
              Copy to Clipboard
            </button>
            <button type="button" class="px-4 py-2 rounded cf-btn cf-btn--ghost  text-xs font-bold uppercase tracking-wide" data-submission-download>
              Download TXT
            </button>
            <button type="button" class="px-4 py-2 rounded cf-btn cf-btn--ghost  text-xs font-bold uppercase tracking-wide" data-submission-print>
              Print
            </button>
          </div>
          <pre class="mt-4 p-4 rounded bg-transparent border  text-xs  whitespace-pre-wrap" data-submission-output>Generate your report to view a summary here.</pre>
        </article>
      `;
    },
  },
  save_load_block: {
    type: 'save_load_block',
    label: 'Save / Load Progress',
    createDefaultData() {
      return {
        title: 'Save or Restore Progress',
        description: 'Download a JSON backup of current responses, then upload it later to restore the module state.',
        fileName: 'module-progress',
      };
    },
    compileToHtml({ data = {} } = {}) {
      const safeName = String(data.fileName || 'module-progress').replace(/[^a-z0-9._-]/gi, '-').trim() || 'module-progress';
      return `
        <article class="cf-card cf-card--elevated tone-info" data-save-load-block data-save-load-file-name="${escapeHtml(safeName)}">
          <h3 class="text-lg font-bold mb-2">${escapeHtml(data.title || 'Save or Restore Progress')}</h3>
          <p class="text-xs leading-relaxed">${renderSimpleBody(data.description || '')}</p>
          <input type="file" accept=".json,application/json" class="is-hidden" data-save-load-upload-input />
          <div class="mt-3 flex flex-wrap gap-2">
            <button type="button" class="px-3 py-2 rounded cf-btn cf-btn--primary  text-xs font-bold uppercase tracking-wide" data-save-load-download>
              Download JSON
            </button>
            <button type="button" class="px-3 py-2 rounded cf-btn cf-btn--ghost  text-xs font-bold uppercase tracking-wide" data-save-load-upload-trigger>
              Upload JSON
            </button>
          </div>
          <p class="mt-3 text-xs" data-save-load-status>No backup loaded yet.</p>
        </article>
      `;
    },
  },
  callout_block: {
    type: 'callout_block',
    label: 'Callout / Admonition',
    createDefaultData() {
      return {
        tone: 'tip',
        title: 'Helpful tip',
        body: 'Add a concise note, warning, example, or myth-buster here.',
      };
    },
    compileToHtml({ data = {} } = {}) {
      const tone = String(data.tone || 'tip').toLowerCase();
      const toneMap = {
        tip: { tone: 'tone-success', label: 'TIP' },
        warning: { tone: 'tone-warning', label: 'WARNING' },
        example: { tone: 'tone-info', label: 'EXAMPLE' },
        myth: { tone: 'tone-danger', label: 'MYTH' },
        note: { tone: 'tone-info', label: 'NOTE' },
      };
      const selectedTone = toneMap[tone] || toneMap.tip;
      return `
        <article class="cf-card cf-card--elevated ${selectedTone.tone}">
          <p class="text-[10px] font-bold uppercase tracking-widest">${selectedTone.label}</p>
          <h3 class="mt-2 text-lg font-bold">${escapeHtml(data.title || 'Callout')}</h3>
          <p class="mt-2 text-sm leading-relaxed">${renderSimpleBody(data.body || '')}</p>
        </article>
      `;
    },
  },
  accordion_block: {
    type: 'accordion_block',
    label: 'Accordion / FAQ',
    createDefaultData() {
      return {
        title: 'Frequently Asked Questions',
        items: [
          { question: 'Question one?', answer: 'Answer one.' },
          { question: 'Question two?', answer: 'Answer two.' },
        ],
      };
    },
    compileToHtml({ data = {} } = {}) {
      const items = (Array.isArray(data.items) ? data.items : []).filter((item) => item && (item.question || item.answer));
      return `
        <article class="cf-card cf-card--elevated">
          <h3 class="text-lg font-bold  mb-3">${escapeHtml(data.title || 'Accordion')}</h3>
          <div class="space-y-2">
            ${
              items.length
                ? items
                    .map(
                      (item, idx) => `
                      <details class="cf-card cf-card--flat p-3" ${idx === 0 ? 'open' : ''}>
                        <summary class="cursor-pointer text-sm font-bold ">${escapeHtml(item.question || `Item ${idx + 1}`)}</summary>
                        <div class="mt-2 text-sm cf-muted leading-relaxed">${renderSimpleBody(item.answer || '')}</div>
                      </details>
                    `,
                    )
                    .join('\n')
                : '<p class="text-sm cf-muted">No accordion items yet.</p>'
            }
          </div>
        </article>
      `;
    },
  },
  tabs_block: {
    type: 'tabs_block',
    label: 'Tabs',
    createDefaultData() {
      return {
        title: 'Compare',
        tabs: [
          { label: 'Option A', content: 'Details for option A.' },
          { label: 'Option B', content: 'Details for option B.' },
          { label: 'Option C', content: 'Details for option C.' },
        ],
      };
    },
    compileToHtml({ data = {} } = {}) {
      const tabs = (Array.isArray(data.tabs) ? data.tabs : []).filter((tab) => tab && (tab.label || tab.content));
      return `
        <article class="cf-card cf-card--elevated" data-tabs-block>
          <h3 class="text-lg font-bold  mb-3">${escapeHtml(data.title || 'Tabs')}</h3>
          <div class="flex flex-wrap gap-2" role="tablist" aria-label="${escapeHtml(data.title || 'Tabs')}">
            ${
              tabs.length
                ? tabs
                    .map(
                      (tab, idx) => `
                      <button
                        type="button"
                        role="tab"
                        data-tabs-trigger
                        data-tab-index="${idx}"
                        class="cf-chip ${idx === 0 ? 'is-active' : ''}"
                      >
                        ${escapeHtml(tab.label || `Tab ${idx + 1}`)}
                      </button>
                    `,
                    )
                    .join('\n')
                : '<p class="text-sm cf-muted">No tabs configured yet.</p>'
            }
          </div>
          ${
            tabs.length
              ? `
              <div class="mt-3 space-y-2">
                ${tabs
                  .map(
                    (tab, idx) => `
                    <div
                      role="tabpanel"
                      data-tabs-panel
                      data-tab-index="${idx}"
                      class="cf-card cf-card--flat p-3 ${idx === 0 ? '' : 'is-hidden'}"
                    >
                      <h4 class="text-sm font-bold ">${escapeHtml(tab.label || `Tab ${idx + 1}`)}</h4>
                      <p class="text-sm cf-muted mt-2 leading-relaxed">${renderSimpleBody(tab.content || '')}</p>
                    </div>
                  `,
                  )
                  .join('\n')}
              </div>
            `
              : ''
          }
        </article>
      `;
    },
  },
  tab_group: {
    type: 'tab_group',
    label: 'Tab Group (Container)',
    createDefaultData() {
      return {
        title: 'Tab Group',
        tabs: [
          { id: 'activities', label: 'Activities', activityIds: [], activities: [] },
          { id: 'additional', label: 'Additional Learning', activityIds: [], activities: [] },
        ],
        defaultTabId: 'activities',
      };
    },
    compileToHtml({ data = {} } = {}) {
      const tabs = Array.isArray(data.tabs) ? data.tabs : [];
      const title = String(data.title || '').trim();
      const rows = tabs
        .map((tab, idx) => {
          const label = escapeHtml(String(tab?.label || tab?.id || `Tab ${idx + 1}`));
          const refs = Array.isArray(tab?.activityIds) ? tab.activityIds.filter(Boolean) : [];
          const inline = Array.isArray(tab?.activities) ? tab.activities.filter(Boolean) : [];
          return `<li class="cf-card cf-card--flat px-3 py-2 text-xs cf-muted">${label} <span class="cf-muted">(${refs.length} refs, ${inline.length} inline)</span></li>`;
        })
        .join('\n');
      return `
        <article class="cf-card cf-card--elevated" data-tab-group>
          ${title ? `<h3 class="text-lg font-bold  mb-3">${escapeHtml(title)}</h3>` : ''}
          ${rows ? `<ul class="space-y-2">${rows}</ul>` : '<p class="text-sm cf-muted">No tabs configured.</p>'}
        </article>
      `;
    },
  },
  card_list: {
    type: 'card_list',
    label: 'Card List (Container)',
    createDefaultData() {
      return {
        title: 'Card List',
        cards: [
          {
            title: 'New Card',
            subtitle: '',
            icon: '',
            targetActivityId: '',
            activity: null,
            activities: [],
            openMode: 'expand',
          },
        ],
      };
    },
    compileToHtml({ data = {} } = {}) {
      const title = String(data.title || '').trim();
      const cards = Array.isArray(data.cards) ? data.cards : [];
      const rows = cards
        .map((card, idx) => {
          const openModeRaw = String(card?.openMode || 'expand').trim().toLowerCase();
          const openMode =
            openModeRaw === 'modal' ||
            openModeRaw === 'navigate_section' ||
            openModeRaw === 'navigate_page'
              ? openModeRaw
              : 'expand';
          const label = escapeHtml(String(card?.title || `Card ${idx + 1}`));
          return `<li class="cf-card cf-card--flat px-3 py-2 text-xs cf-muted">${label} <span class="cf-muted">(${openMode})</span></li>`;
        })
        .join('\n');
      return `
        <article class="cf-card cf-card--elevated" data-card-list>
          ${title ? `<h3 class="text-lg font-bold  mb-3">${escapeHtml(title)}</h3>` : ''}
          ${rows ? `<ul class="space-y-2">${rows}</ul>` : '<p class="text-sm cf-muted">No cards configured.</p>'}
        </article>
      `;
    },
  },
  step_sequence: {
    type: 'step_sequence',
    label: 'Step Sequence',
    createDefaultData() {
      return {
        title: 'Step-by-Step Flow',
        steps: [
          { title: 'Step 1', detail: 'Describe the first step.' },
          { title: 'Step 2', detail: 'Describe the second step.' },
          { title: 'Step 3', detail: 'Describe the third step.' },
        ],
      };
    },
    compileToHtml({ data = {} } = {}) {
      const steps = (Array.isArray(data.steps) ? data.steps : []).filter((step) => step && (step.title || step.detail));
      return `
        <article class="cf-card cf-card--elevated">
          <h3 class="text-lg font-bold  mb-4">${escapeHtml(data.title || 'Steps')}</h3>
          ${
            steps.length
              ? `
              <ol class="space-y-3">
                ${steps
                  .map(
                    (step, idx) => `
                    <li class="cf-card cf-card--flat p-4">
                      <div class="flex items-start gap-3">
                        <div class="cf-chip tone-info w-7 h-7 p-0 text-xs font-bold flex items-center justify-center">${idx + 1}</div>
                        <div>
                          <h4 class="text-sm font-bold ">${escapeHtml(step.title || `Step ${idx + 1}`)}</h4>
                          <p class="text-sm cf-muted mt-1 leading-relaxed">${renderSimpleBody(step.detail || '')}</p>
                        </div>
                      </div>
                    </li>
                  `,
                  )
                  .join('\n')}
              </ol>
            `
              : '<p class="text-sm cf-muted">No steps added yet.</p>'
          }
        </article>
      `;
    },
  },
  checklist_block: {
    type: 'checklist_block',
    label: 'Checklist',
    createDefaultData() {
      return {
        title: 'Action Checklist',
        items: ['Complete task one', 'Complete task two', 'Complete task three'],
      };
    },
    compileToHtml({ data = {}, activityId = '' } = {}) {
      const items = (Array.isArray(data.items) ? data.items : []).map((item) => String(item || '').trim()).filter(Boolean);
      return `
        <article class="cf-card cf-card--elevated" data-checklist-block data-checklist-id="${escapeHtml(activityId || data.title || 'checklist')}" data-checklist-total="${items.length}">
          <div class="flex items-center justify-between gap-3 mb-3">
            <h3 class="text-lg font-bold ">${escapeHtml(data.title || 'Checklist')}</h3>
            <p class="text-xs font-semibold uppercase tracking-widest cf-muted" data-checklist-progress>${items.length ? `0 / ${items.length}` : '0 / 0'} done</p>
          </div>
          ${
            items.length
              ? `
              <div class="space-y-2">
                ${items
                  .map(
                    (item, idx) => `
                    <label class="flex items-center gap-3 cf-card cf-card--flat p-3">
                      <input type="checkbox" class="w-4 h-4" data-checklist-input data-checklist-index="${idx}" />
                      <span class="text-sm ">${escapeHtml(item)}</span>
                    </label>
                  `,
                  )
                  .join('\n')}
              </div>
            `
              : '<p class="text-sm cf-muted">No checklist items yet.</p>'
          }
        </article>
      `;
    },
  },
  scenario_branch: {
    type: 'scenario_branch',
    label: 'Scenario Branch',
    createDefaultData() {
      return {
        title: 'Scenario Lab',
        prompt: 'A key decision appears. What do you do next?',
        choices: [
          { label: 'Choice A', outcome: 'Outcome for choice A.', tone: 'good' },
          { label: 'Choice B', outcome: 'Outcome for choice B.', tone: 'caution' },
          { label: 'Choice C', outcome: 'Outcome for choice C.', tone: 'neutral' },
        ],
      };
    },
    compileToHtml({ data = {} } = {}) {
      const choices = (Array.isArray(data.choices) ? data.choices : []).filter((choice) => choice && (choice.label || choice.outcome));
      const toneMap = {
        good: 'border-emerald-500/30 bg-emerald-950/20',
        caution: 'border-amber-500/30 bg-amber-950/20',
        risk: 'border-rose-500/30 bg-rose-950/20',
        neutral: ' bg-transparent',
      };
      return `
        <article class="cf-card cf-card--elevated">
          <h3 class="text-lg font-bold ">${escapeHtml(data.title || 'Scenario Branch')}</h3>
          <p class="mt-2 text-sm cf-muted">${renderSimpleBody(data.prompt || '')}</p>
          <div class="mt-4 space-y-2">
            ${
              choices.length
                ? choices
                    .map(
                      (choice, idx) => `
                      <details class="rounded-lg border p-3 ${toneMap[String(choice.tone || 'neutral').toLowerCase()] || toneMap.neutral}">
                        <summary class="cursor-pointer text-sm font-bold ">${escapeHtml(choice.label || `Choice ${idx + 1}`)}</summary>
                        <p class="text-sm cf-muted mt-2 leading-relaxed">${renderSimpleBody(choice.outcome || '')}</p>
                      </details>
                    `,
                    )
                    .join('\n')
                : '<p class="text-sm cf-muted">No branches added yet.</p>'
            }
          </div>
        </article>
      `;
    },
  },
  drag_sort_block: {
    type: 'drag_sort_block',
    label: 'Drag / Sort',
    createDefaultData() {
      return {
        title: 'Sort Challenge',
        instructions: 'Order these items from first to last.',
        items: ['Item A', 'Item B', 'Item C'],
      };
    },
    compileToHtml({ data = {} } = {}) {
      const items = (Array.isArray(data.items) ? data.items : []).map((item) => String(item || '').trim()).filter(Boolean);
      return `
        <article class="cf-card cf-card--elevated" data-sort-block>
          <h3 class="text-lg font-bold ">${escapeHtml(data.title || 'Sort')}</h3>
          <p class="text-sm cf-muted mt-2">${renderSimpleBody(data.instructions || '')}</p>
          ${
            items.length
              ? `
              <ol class="mt-4 space-y-2" data-sort-list>
                ${items
                  .map(
                    (item, idx) => `
                    <li class="cf-card cf-card--flat px-3 py-2 text-sm  flex items-center justify-between gap-3" data-sort-item draggable="true">
                      <div class="flex items-center gap-2 min-w-0">
                        <span class="cf-muted font-mono" data-sort-rank>${idx + 1}.</span>
                        <span class="truncate">${escapeHtml(item)}</span>
                      </div>
                      <div class="flex items-center gap-1">
                        <button type="button" class="px-2 py-1 rounded cf-btn cf-btn--ghost text-[10px] font-bold " data-sort-move="-1" title="Move up">Up</button>
                        <button type="button" class="px-2 py-1 rounded cf-btn cf-btn--ghost text-[10px] font-bold " data-sort-move="1" title="Move down">Down</button>
                      </div>
                    </li>
                  `,
                  )
                  .join('\n')}
              </ol>
            `
              : '<p class="text-sm cf-muted mt-3">No sort items yet.</p>'
          }
          <p class="text-[11px] cf-muted mt-3">Tip: drag rows or use Up/Down to reorder.</p>
        </article>
      `;
    },
  },
  flashcard_deck: {
    type: 'flashcard_deck',
    label: 'Flashcards',
    createDefaultData() {
      return {
        title: 'Flashcards',
        cards: [
          { front: 'Front 1', back: 'Back 1' },
          { front: 'Front 2', back: 'Back 2' },
        ],
      };
    },
    compileToHtml({ data = {} } = {}) {
      const cards = (Array.isArray(data.cards) ? data.cards : []).filter((card) => card && (card.front || card.back));
      return `
        <article class="cf-card cf-card--elevated" data-flashcards-block>
          <h3 class="text-lg font-bold  mb-3">${escapeHtml(data.title || 'Flashcards')}</h3>
          <div class="grid gap-3 md:grid-cols-2">
            ${
              cards.length
                ? cards
                    .map(
                      (card, idx) => `
                      <div class="cf-card cf-card--flat p-4" data-flashcard data-flashcard-index="${idx}">
                        <div data-flashcard-front>
                          <p class="text-[10px] font-bold uppercase tracking-widest cf-muted">Front</p>
                          <p class="text-sm  mt-1">${renderSimpleBody(card.front || '')}</p>
                        </div>
                        <div data-flashcard-back class="is-hidden">
                          <p class="text-[10px] font-bold uppercase tracking-widest cf-muted">Back</p>
                          <p class="text-sm cf-muted mt-1">${renderSimpleBody(card.back || '')}</p>
                        </div>
                        <button type="button" class="mt-3 px-3 py-1.5 rounded cf-btn cf-btn--primary text-[11px] font-bold  uppercase tracking-wide" data-flashcard-toggle>
                          Flip
                        </button>
                      </div>
                    `,
                    )
                    .join('\n')
                : '<p class="text-sm cf-muted">No cards yet.</p>'
            }
          </div>
        </article>
      `;
    },
  },
  reflection_journal: {
    type: 'reflection_journal',
    label: 'Reflection Journal',
    createDefaultData() {
      return {
        title: 'Reflection',
        prompt: 'What stood out from this lesson?',
        placeholder: 'Write your reflection...',
      };
    },
    compileToHtml({ data = {} } = {}) {
      return `
        <article class="cf-card cf-card--elevated">
          <h3 class="text-lg font-bold ">${escapeHtml(data.title || 'Reflection')}</h3>
          <p class="text-sm cf-muted mt-2">${renderSimpleBody(data.prompt || '')}</p>
          <textarea class="mt-4 w-full min-h-32 cf-card cf-card--flat p-3 text-sm " placeholder="${escapeHtml(data.placeholder || 'Write here...')}"></textarea>
        </article>
      `;
    },
  },
  worksheet_form: {
    type: 'worksheet_form',
    label: 'Template / Worksheet',
    createDefaultData() {
      return {
        title: 'Worksheet',
        blocks: [
          {
            kind: 'title',
            title: 'Section 1',
            showContent: true,
            content: 'Add instructions for this section.',
          },
          { kind: 'field', label: 'Goal', fieldType: 'text', placeholder: 'Enter goal...' },
          { kind: 'field', label: 'Plan', fieldType: 'textarea', placeholder: 'Describe your plan...' },
        ],
      };
    },
    compileToHtml({ data = {} } = {}) {
      const blocks = normalizeWorksheetBuilderBlocks(data);
      const header = String(data.title || '').trim();
      return `
        <article class="cf-card cf-card--elevated" data-worksheet-block>
          ${header ? `<h3 class="text-lg font-bold  mb-3">${escapeHtml(header)}</h3>` : ''}
          <div class="space-y-3">
            ${
              blocks.length
                ? blocks
                    .map((block, idx) => {
                      if (block.kind === 'title') {
                        const titleText = block.title == null ? '' : String(block.title);
                        return `
                          <section class="cf-card cf-card--flat tone-info p-4" data-worksheet-segment data-worksheet-kind="title">
                            ${titleText ? `<h4 class="text-sm font-bold uppercase tracking-wide">${escapeHtml(titleText)}</h4>` : ''}
                            ${
                              block.showContent && block.content
                                ? `<p class="mt-2 text-sm leading-relaxed">${renderSimpleBody(block.content)}</p>`
                                : ''
                            }
                          </section>
                        `;
                      }
                      const labelValue = block?.label == null ? `Field ${idx + 1}` : String(block.label);
                      const label = escapeHtml(labelValue);
                      const type = normalizeWorksheetFieldType(block?.fieldType || block?.inputType || block?.type);
                      const placeholder = escapeHtml(block?.placeholder || '');
                      const helperMode = normalizeWorksheetHelperMode(block?.helperMode, block);
                      const helperText = block?.helperText == null ? '' : String(block.helperText);
                      const helperHtml = sanitizeRichHtml(block?.helperHtml || '');
                      const helperMarkup =
                        helperMode === 'rich' && helperHtml
                          ? `<div class="cf-rich-editor text-sm cf-muted leading-relaxed mb-2">${helperHtml}</div>`
                          : helperText
                            ? `<p class="text-xs cf-muted leading-relaxed mb-2">${renderSimpleBody(helperText)}</p>`
                            : '';
                      if (type === 'textarea') {
                        return `
                          <div data-worksheet-segment data-worksheet-kind="field">
                            <label class="block text-xs font-bold uppercase tracking-wide cf-muted mb-1">${label}</label>
                            ${helperMarkup}
                            <textarea class="w-full min-h-24 cf-card cf-card--flat p-3 text-sm " placeholder="${placeholder}"></textarea>
                          </div>
                        `;
                      }
                      if (type === 'number') {
                        return `
                          <div data-worksheet-segment data-worksheet-kind="field">
                            <label class="block text-xs font-bold uppercase tracking-wide cf-muted mb-1">${label}</label>
                            ${helperMarkup}
                            <input type="number" class="w-full cf-card cf-card--flat p-2 text-sm " placeholder="${placeholder}" />
                          </div>
                        `;
                      }
                      return `
                        <div data-worksheet-segment data-worksheet-kind="field">
                          <label class="block text-xs font-bold uppercase tracking-wide cf-muted mb-1">${label}</label>
                          ${helperMarkup}
                          <input type="text" class="w-full cf-card cf-card--flat p-2 text-sm " placeholder="${placeholder}" />
                        </div>
                      `;
                    })
                    .join('\n')
                : '<p class="text-sm cf-muted">No worksheet blocks yet.</p>'
            }
          </div>
        </article>
      `;
    },
  },
  fillable_chart: {
    type: 'fillable_chart',
    label: 'Fillable Chart',
    createDefaultData() {
      return {
        title: 'Fillable Chart',
        description: 'Label each cell and choose whether students can edit it.',
        rowCount: 2,
        colCount: 2,
        showRowLabels: true,
        rowLabelHeader: 'Rows',
        rows: [
          { id: 'row-1', label: 'Row 1' },
          { id: 'row-2', label: 'Row 2' },
        ],
        columns: [
          { id: 'col-1', label: 'Column 1' },
          { id: 'col-2', label: 'Column 2' },
        ],
        cells: [
          [
            { label: '', editable: true, placeholder: 'Type your response...' },
            { label: '', editable: true, placeholder: 'Type your response...' },
          ],
          [
            { label: '', editable: true, placeholder: 'Type your response...' },
            { label: '', editable: true, placeholder: 'Type your response...' },
          ],
        ],
      };
    },
    compileToHtml({ data = {} } = {}) {
      const chart = normalizeFillableChartData(data);
      const title = String(data.title || '').trim();
      const description = String(data.description || '').trim();
      const rowHeaderHtml = chart.showRowLabels
        ? `
            <th class="p-3 border-b  text-left font-bold uppercase tracking-wide cf-muted w-40">
              ${escapeHtml(chart.rowLabelHeader || '') || '&nbsp;'}
            </th>
          `
        : '';
      const headHtml = chart.columns
        .map(
          (column) => `
            <th class="p-3 border-b border-l  text-left font-bold uppercase tracking-wide cf-muted">
              ${escapeHtml(column.label || '') || '&nbsp;'}
            </th>
          `,
        )
        .join('\n');
      const rowsHtml = chart.rows
        .map((row, rowIdx) => {
          const cellsHtml = chart.columns
            .map((_, colIdx) => {
              const cell = chart.cells[rowIdx][colIdx];
              if (cell.editable) {
                return `
                  <td class="p-3 border-b border-l  align-top">
                    ${cell.label ? `<p class="text-xs cf-muted mb-2">${renderSimpleBody(cell.label)}</p>` : ''}
                    <textarea
                      class="w-full min-h-24 cf-card cf-card--flat p-2 text-sm "
                      placeholder="${escapeHtml(cell.placeholder || 'Type your response...')}"
                    ></textarea>
                  </td>
                `;
              }
              return `
                <td class="p-3 border-b border-l  align-top">
                  <div class="text-sm  leading-relaxed">${renderSimpleBody(cell.label || '')}</div>
                </td>
              `;
            })
            .join('\n');
          const rowLabelCellHtml = chart.showRowLabels
            ? `
                <th class="p-3 border-b  bg-transparent text-left  font-bold uppercase tracking-wide">
                  ${escapeHtml(row.label || '') || '&nbsp;'}
                </th>
              `
            : '';
          return `
            <tr>
              ${rowLabelCellHtml}
              ${cellsHtml}
            </tr>
          `;
        })
        .join('\n');
      return `
        <article class="cf-card cf-card--elevated" data-fillable-chart-block>
          ${title ? `<h3 class="text-lg font-bold ">${escapeHtml(title)}</h3>` : ''}
          ${description ? `<p class="text-sm cf-muted mt-2">${renderSimpleBody(description)}</p>` : ''}
          <div class="mt-4 overflow-x-auto rounded-lg border ">
            <table class="min-w-full border-collapse text-xs">
              <thead class="bg-transparent">
                <tr>
                  ${rowHeaderHtml}
                  ${headHtml}
                </tr>
              </thead>
              <tbody>
                ${rowsHtml}
              </tbody>
            </table>
          </div>
        </article>
      `;
    },
  },
  portfolio_evidence: {
    type: 'portfolio_evidence',
    label: 'Portfolio / Evidence',
    createDefaultData() {
      return {
        title: 'Evidence Submission',
        instructions: 'Capture proof of your work and a short reflection.',
        criteria: ['Quality', 'Completeness', 'Clarity'],
      };
    },
    compileToHtml({ data = {} } = {}) {
      const criteria = (Array.isArray(data.criteria) ? data.criteria : []).map((item) => String(item || '').trim()).filter(Boolean);
      return `
        <article class="cf-card cf-card--elevated">
          <h3 class="text-lg font-bold ">${escapeHtml(data.title || 'Portfolio')}</h3>
          <p class="text-sm cf-muted mt-2">${renderSimpleBody(data.instructions || '')}</p>
          <div class="mt-4 space-y-3">
            <div>
              <label class="block text-xs font-bold uppercase tracking-wide cf-muted mb-1">Artifact URL</label>
              <input type="text" class="w-full cf-card cf-card--flat p-2 text-sm " placeholder="https://..." />
            </div>
            <div>
              <label class="block text-xs font-bold uppercase tracking-wide cf-muted mb-1">Evidence Summary</label>
              <textarea class="w-full min-h-28 cf-card cf-card--flat p-3 text-sm " placeholder="Explain what this artifact proves..."></textarea>
            </div>
            ${
              criteria.length
                ? `
                <div class="cf-card cf-card--flat p-3">
                  <p class="text-xs font-bold uppercase tracking-wide cf-muted mb-2">Self-Check</p>
                  <div class="space-y-2">
                    ${criteria
                      .map(
                        (item) => `
                        <label class="flex items-center gap-2 text-sm ">
                          <input type="checkbox" class="w-4 h-4" />
                          <span>${escapeHtml(item)}</span>
                        </label>
                      `,
                      )
                      .join('\n')}
                  </div>
                </div>
              `
                : ''
            }
          </div>
        </article>
      `;
    },
  },
  path_map: {
    type: 'path_map',
    label: 'Choose-Your-Path Map',
    createDefaultData() {
      return {
        title: 'Learning Paths',
        nodes: [
          { title: 'Path A', description: 'Description for path A.' },
          { title: 'Path B', description: 'Description for path B.' },
          { title: 'Path C', description: 'Description for path C.' },
        ],
      };
    },
    compileToHtml({ data = {} } = {}) {
      const nodes = (Array.isArray(data.nodes) ? data.nodes : []).filter((node) => node && (node.title || node.description));
      return `
        <article class="cf-card cf-card--elevated" data-path-map-block>
          <h3 class="text-lg font-bold  mb-3">${escapeHtml(data.title || 'Path Map')}</h3>
          ${
            nodes.length
              ? `
              <div class="grid gap-3 md:grid-cols-12">
                <div class="md:col-span-4 space-y-2">
                  ${nodes
                    .map(
                      (node, idx) => `
                      <button
                        type="button"
                        data-path-node
                        data-path-index="${idx}"
                        class="w-full text-left cf-card cf-card--flat p-3 transition-colors ${idx === 0 ? 'is-active' : ''}"
                      >
                        <p class="text-xs font-bold uppercase tracking-widest cf-muted">Path ${idx + 1}</p>
                        <p class="text-sm font-bold  mt-1">${escapeHtml(node.title || `Path ${idx + 1}`)}</p>
                      </button>
                    `,
                    )
                    .join('\n')}
                </div>
                <div class="md:col-span-8 space-y-2">
                  ${nodes
                    .map(
                      (node, idx) => `
                      <div class="cf-card cf-card--flat p-4">
                        <div data-path-panel data-path-index="${idx}" class="${idx === 0 ? '' : 'is-hidden'}">
                        <h4 class="text-sm font-bold text-indigo-300">${escapeHtml(node.title || 'Path')}</h4>
                        <p class="text-sm cf-muted mt-1 leading-relaxed">${renderSimpleBody(node.description || '')}</p>
                        </div>
                      </div>
                    `,
                    )
                    .join('\n')}
                </div>
              </div>
            `
              : '<p class="text-sm cf-muted">No paths added yet.</p>'
          }
        </article>
      `;
    },
  },
  hotspot_image: {
    type: 'hotspot_image',
    label: 'Interactive Image / Hotspots',
    createDefaultData() {
      return {
        title: 'Interactive Image',
        url: '',
        alt: 'Interactive visual',
        hotspots: [
          { label: 'Point A', x: 25, y: 35, content: 'Explain this area.' },
          { label: 'Point B', x: 60, y: 55, content: 'Explain this area.' },
        ],
      };
    },
    compileToHtml({ data = {} } = {}) {
      const safeUrl = toSafeUrl(data.url);
      const hotspots = Array.isArray(data.hotspots) ? data.hotspots : [];
      return `
        <article class="cf-card cf-card--elevated" data-hotspot-block>
          <h3 class="text-lg font-bold  mb-3">${escapeHtml(data.title || 'Interactive Image')}</h3>
          ${
            safeUrl
              ? `
              <figure class="relative rounded-lg border bg-black overflow-hidden" data-hotspot-figure>
                <img src="${escapeHtml(safeUrl)}" alt="${escapeHtml(data.alt || 'Interactive image')}" class="w-full h-auto" loading="lazy" />
                ${
                  hotspots.length
                    ? hotspots
                        .map((spot, idx) => {
                          const x = Math.max(0, Math.min(100, Number.parseFloat(spot?.x) || 0));
                          const y = Math.max(0, Math.min(100, Number.parseFloat(spot?.y) || 0));
                          return `
                        <button
                          type="button"
                          data-hotspot-btn
                          data-hotspot-index="${idx}"
                          style="left:${x}%;top:${y}%;"
                          class="absolute -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full border text-[11px] font-black transition-colors ${
                            idx === 0
                              ? 'is-active'
                              : 'cf-card cf-card--flat'
                          }"
                          title="${escapeHtml(spot?.label || `Hotspot ${idx + 1}`)}"
                          aria-label="${escapeHtml(spot?.label || `Hotspot ${idx + 1}`)}"
                        >
                          ${idx + 1}
                        </button>
                      `;
                        })
                        .join('\n')
                    : ''
                }
              </figure>
              ${
                hotspots.length
                  ? `
                  <div class="mt-3 grid md:grid-cols-2 gap-2">
                    ${hotspots
                      .map(
                        (spot, idx) => `
                        <div data-hotspot-panel data-hotspot-index="${idx}" class="cf-card cf-card--flat p-2 text-xs cf-muted ${idx === 0 ? '' : 'is-hidden'}">
                          <p class="font-bold ">${escapeHtml(spot.label || `Hotspot ${idx + 1}`)}</p>
                          <p class="mt-1">${renderSimpleBody(spot?.content || '')}</p>
                        </div>
                      `,
                      )
                      .join('\n')}
                  </div>
                `
                  : ''
              }
            `
              : '<p class="text-sm cf-muted">Add an image URL to render hotspot content.</p>'
          }
        </article>
      `;
    },
  },
  timeline_story: {
    type: 'timeline_story',
    label: 'Timeline Story',
    createDefaultData() {
      return {
        title: 'Timeline',
        events: [
          { date: 'Phase 1', title: 'Start', description: 'Describe what begins here.' },
          { date: 'Phase 2', title: 'Middle', description: 'Describe what happens next.' },
          { date: 'Phase 3', title: 'Finish', description: 'Describe the final outcome.' },
        ],
      };
    },
    compileToHtml({ data = {} } = {}) {
      const events = (Array.isArray(data.events) ? data.events : []).filter((event) => event && (event.date || event.title || event.description));
      return `
        <article class="cf-card cf-card--elevated">
          <h3 class="text-lg font-bold  mb-4">${escapeHtml(data.title || 'Timeline')}</h3>
          ${
            events.length
              ? `
              <ol class="space-y-4 border-l  ml-2 pl-4">
                ${events
                  .map(
                    (event) => `
                    <li class="relative">
                      <span class="absolute -left-[23px] top-1.5 w-2 h-2 rounded-full bg-indigo-400"></span>
                      <p class="text-xs uppercase tracking-widest cf-muted">${escapeHtml(event.date || '')}</p>
                      <h4 class="text-sm font-bold  mt-1">${escapeHtml(event.title || '')}</h4>
                      <p class="text-sm cf-muted mt-1 leading-relaxed">${renderSimpleBody(event.description || '')}</p>
                    </li>
                  `,
                  )
                  .join('\n')}
              </ol>
            `
              : '<p class="text-sm cf-muted">No timeline events yet.</p>'
          }
        </article>
      `;
    },
  },
  before_after: {
    type: 'before_after',
    label: 'Before / After',
    createDefaultData() {
      return {
        title: 'Before vs After',
        beforeLabel: 'Before',
        beforeText: 'Describe the initial state.',
        afterLabel: 'After',
        afterText: 'Describe the transformed state.',
      };
    },
    compileToHtml({ data = {} } = {}) {
      return `
        <article class="cf-card cf-card--elevated" data-before-after-block>
          <h3 class="text-lg font-bold  mb-3">${escapeHtml(data.title || 'Before / After')}</h3>
          <p class="text-xs cf-muted">Move the slider to compare emphasis between both states.</p>
          <div class="grid md:grid-cols-2 gap-3">
            <div class="rounded-lg border border-rose-500/30 bg-rose-950/20 p-4 transition-opacity" data-before-panel>
              <p class="text-xs font-bold uppercase tracking-widest text-rose-300">${escapeHtml(data.beforeLabel || 'Before')}</p>
              <p class="text-sm text-rose-100/90 mt-2 leading-relaxed">${renderSimpleBody(data.beforeText || '')}</p>
            </div>
            <div class="rounded-lg border p-4 transition-opacity tone-success" data-after-panel>
              <p class="text-xs font-bold uppercase tracking-widest">${escapeHtml(data.afterLabel || 'After')}</p>
              <p class="text-sm mt-2 leading-relaxed">${renderSimpleBody(data.afterText || '')}</p>
            </div>
          </div>
          <div class="mt-4">
            <input type="range" min="0" max="100" value="50" class="w-full" data-before-after-slider />
            <div class="mt-1 flex items-center justify-between text-[11px] cf-muted">
              <span>${escapeHtml(data.beforeLabel || 'Before')}</span>
              <span data-before-after-value>50 / 50</span>
              <span>${escapeHtml(data.afterLabel || 'After')}</span>
            </div>
          </div>
        </article>
      `;
    },
  },
  roleplay_simulator: {
    type: 'roleplay_simulator',
    label: 'Roleplay Simulator',
    createDefaultData() {
      return {
        title: 'Roleplay',
        scenario: 'Set up a realistic interaction scenario.',
        messages: [
          { speaker: 'Person A', line: 'Opening line from person A.' },
          { speaker: 'Person B', line: 'Response from person B.' },
        ],
        responsePrompt: 'What would you say next?',
      };
    },
    compileToHtml({ data = {} } = {}) {
      const messages = Array.isArray(data.messages) ? data.messages : [];
      return `
        <article class="cf-card cf-card--elevated">
          <h3 class="text-lg font-bold ">${escapeHtml(data.title || 'Roleplay Simulator')}</h3>
          <p class="text-sm cf-muted mt-2">${renderSimpleBody(data.scenario || '')}</p>
          <div class="mt-4 space-y-2">
            ${
              messages.length
                ? messages
                    .map(
                      (msg, idx) => `
                      <div class="cf-card cf-card--flat p-3">
                        <p class="text-[10px] uppercase tracking-widest cf-muted">${escapeHtml(msg.speaker || `Speaker ${idx + 1}`)}</p>
                        <p class="text-sm  mt-1">${renderSimpleBody(msg.line || '')}</p>
                      </div>
                    `,
                    )
                    .join('\n')
                : '<p class="text-sm cf-muted">No dialogue turns yet.</p>'
            }
          </div>
          <div class="mt-4">
            <label class="block text-xs font-bold uppercase tracking-wide cf-muted mb-1">${escapeHtml(data.responsePrompt || 'Your response')}</label>
            <textarea class="w-full min-h-28 cf-card cf-card--flat p-3 text-sm " placeholder="Draft your response..."></textarea>
          </div>
        </article>
      `;
    },
  },
  decision_lab: {
    type: 'decision_lab',
    label: 'Decision Lab',
    createDefaultData() {
      return {
        title: 'Decision Lab',
        description: 'Adjust the levers below to test outcomes.',
        resultLabel: 'Projected outcome score',
        variables: [
          { name: 'Cost', min: 0, max: 10, value: 5, weight: 1 },
          { name: 'Impact', min: 0, max: 10, value: 7, weight: 2 },
          { name: 'Risk', min: 0, max: 10, value: 3, weight: 2 },
        ],
      };
    },
    compileToHtml({ data = {} } = {}) {
      const variables = Array.isArray(data.variables) ? data.variables : [];
      const scored = variables.map((variable, idx) => {
        const min = Number(variable?.min);
        const max = Number(variable?.max);
        const value = Number(variable?.value);
        const weight = Number(variable?.weight);
        const safeMin = Number.isFinite(min) ? min : 0;
        const safeMax = Number.isFinite(max) && max >= safeMin ? max : safeMin + 10;
        const clampedValue = Number.isFinite(value) ? Math.max(safeMin, Math.min(safeMax, value)) : safeMin;
        const safeWeight = Number.isFinite(weight) && weight > 0 ? weight : 1;
        const normalized = safeMax === safeMin ? 0 : (clampedValue - safeMin) / (safeMax - safeMin);
        return {
          key: `decision-${idx}`,
          name: String(variable?.name || 'Variable'),
          min: safeMin,
          max: safeMax,
          value: clampedValue,
          weight: safeWeight,
          normalized,
        };
      });
      const totalWeight = scored.reduce((sum, variable) => sum + variable.weight, 0);
      const weightedSum = scored.reduce((sum, variable) => sum + variable.normalized * variable.weight, 0);
      const score = totalWeight > 0 ? Math.round((weightedSum / totalWeight) * 100) : 0;
      return `
        <article class="cf-card cf-card--elevated" data-decision-block>
          <h3 class="text-lg font-bold ">${escapeHtml(data.title || 'Decision Lab')}</h3>
          <p class="text-sm cf-muted mt-2">${renderSimpleBody(data.description || '')}</p>
          <div class="mt-4 grid gap-2 md:grid-cols-2">
            ${
              scored.length
                ? scored
                    .map(
                      (variable) => `
                      <div class="cf-card cf-card--flat p-3">
                        <p class="text-xs uppercase tracking-widest cf-muted">${escapeHtml(variable.name)}</p>
                        <p class="text-xs cf-muted mt-1">Weight: ${variable.weight}</p>
                        <input
                          type="range"
                          min="${variable.min}"
                          max="${variable.max}"
                          step="1"
                          value="${variable.value}"
                          class="mt-2 w-full"
                          data-decision-input
                          data-decision-key="${escapeHtml(variable.key)}"
                          data-decision-min="${variable.min}"
                          data-decision-max="${variable.max}"
                          data-decision-weight="${variable.weight}"
                        />
                        <div class="mt-1 flex items-center justify-between text-[11px] cf-muted">
                          <span>${variable.min}</span>
                          <span class="font-bold " data-decision-current data-decision-key="${escapeHtml(variable.key)}">${variable.value}</span>
                          <span>${variable.max}</span>
                        </div>
                      </div>
                    `,
                    )
                    .join('\n')
                : '<p class="text-sm cf-muted">No decision variables yet.</p>'
            }
          </div>
          <div class="mt-4 cf-card cf-card--flat tone-info p-3">
            <p class="text-xs uppercase tracking-widest">${escapeHtml(data.resultLabel || 'Outcome score')}</p>
            <p class="text-2xl font-black  mt-1" data-decision-score>${score}</p>
          </div>
        </article>
      `;
    },
  },
};

export function getActivityDefinition(type) {
  return ACTIVITY_REGISTRY[type] || null;
}

const ACTIVITY_CATEGORY_LABELS = {
  content: 'Content & Media',
  assessment: 'Assessment & Knowledge',
  interactive: 'Interactive Activities',
  productivity: 'Reports & Save/Load',
  layout: 'Layout & Utility',
  general: 'Other',
};

const ACTIVITY_TYPE_CATEGORIES = {
  content_block: 'content',
  title_block: 'content',
  spacer_block: 'layout',
  embed_block: 'content',
  image_block: 'content',
  resource_list: 'content',
  assessment_embed: 'assessment',
  rubric_creator: 'assessment',
  knowledge_check: 'assessment',
  submission_builder: 'productivity',
  save_load_block: 'productivity',
  callout_block: 'content',
  accordion_block: 'content',
  tabs_block: 'content',
  tab_group: 'layout',
  card_list: 'layout',
  step_sequence: 'content',
  checklist_block: 'interactive',
  scenario_branch: 'interactive',
  drag_sort_block: 'interactive',
  flashcard_deck: 'interactive',
  reflection_journal: 'interactive',
  worksheet_form: 'assessment',
  fillable_chart: 'interactive',
  portfolio_evidence: 'assessment',
  path_map: 'interactive',
  hotspot_image: 'interactive',
  timeline_story: 'content',
  before_after: 'interactive',
  roleplay_simulator: 'interactive',
  decision_lab: 'interactive',
};

export function getActivityCategory(type) {
  return ACTIVITY_TYPE_CATEGORIES[type] || 'general';
}

export function getActivityCategoryLabel(category) {
  return ACTIVITY_CATEGORY_LABELS[category] || ACTIVITY_CATEGORY_LABELS.general;
}

export function listActivityTypes() {
  return Object.keys(ACTIVITY_REGISTRY);
}

export function listActivityTypeGroups() {
  const groups = {};
  Object.keys(ACTIVITY_REGISTRY).forEach((type) => {
    const category = getActivityCategory(type);
    if (!groups[category]) groups[category] = [];
    groups[category].push(type);
  });
  const categoryOrder = ['content', 'assessment', 'interactive', 'productivity', 'layout', 'general'];
  return categoryOrder
    .filter((category) => Array.isArray(groups[category]) && groups[category].length > 0)
    .map((category) => ({
      category,
      label: getActivityCategoryLabel(category),
      types: groups[category],
    }));
}

function stripValidationHtml(value = '') {
  return String(value || '')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&#39;/gi, "'")
    .replace(/&quot;/gi, '"')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

function slugifyValidation(value, fallback = 'item') {
  const raw = String(value || '').trim().toLowerCase();
  const slug = raw.replace(/<[^>]*>/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  return slug || fallback;
}

function collectHtmlLikeStrings(value, bucket = []) {
  if (typeof value === 'string') {
    if (/[<][a-z!/]/i.test(value) || /\bhref\s*=\s*["']#/i.test(value) || /\bid\s*=\s*["']/i.test(value)) {
      bucket.push(value);
    }
    return bucket;
  }
  if (Array.isArray(value)) {
    value.forEach((item) => collectHtmlLikeStrings(item, bucket));
    return bucket;
  }
  if (value && typeof value === 'object') {
    Object.values(value).forEach((entry) => collectHtmlLikeStrings(entry, bucket));
  }
  return bucket;
}

function extractHtmlIdTargets(html = '') {
  const ids = new Set();
  const pattern = /\sid\s*=\s*(['"])(.*?)\1/gi;
  let match = pattern.exec(String(html || ''));
  while (match) {
    const target = String(match[2] || '').trim();
    if (target) ids.add(target);
    match = pattern.exec(String(html || ''));
  }
  return ids;
}

function extractInternalHrefTargets(html = '') {
  const targets = new Set();
  const pattern = /\shref\s*=\s*(['"])#(.*?)\1/gi;
  let match = pattern.exec(String(html || ''));
  while (match) {
    const target = String(match[2] || '').trim();
    if (target) targets.add(target);
    match = pattern.exec(String(html || ''));
  }
  return targets;
}

function countEmptyHeadingTags(html = '') {
  let count = 0;
  const pattern = /<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/gi;
  let match = pattern.exec(String(html || ''));
  while (match) {
    if (!stripValidationHtml(match[2] || '')) count += 1;
    match = pattern.exec(String(html || ''));
  }
  return count;
}

function parseColorToRgb(value) {
  const raw = String(value || '').trim();
  if (!raw) return null;
  const hexMatch = raw.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (hexMatch) {
    const hex = hexMatch[1].length === 3
      ? hexMatch[1].split('').map((char) => `${char}${char}`).join('')
      : hexMatch[1];
    return {
      r: Number.parseInt(hex.slice(0, 2), 16),
      g: Number.parseInt(hex.slice(2, 4), 16),
      b: Number.parseInt(hex.slice(4, 6), 16),
    };
  }
  const rgbMatch = raw.match(/^rgba?\(\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})(?:\s*,\s*(0|0?\.\d+|1(?:\.0+)?))?\s*\)$/i);
  if (rgbMatch) {
    return {
      r: Math.max(0, Math.min(255, Number.parseInt(rgbMatch[1], 10) || 0)),
      g: Math.max(0, Math.min(255, Number.parseInt(rgbMatch[2], 10) || 0)),
      b: Math.max(0, Math.min(255, Number.parseInt(rgbMatch[3], 10) || 0)),
    };
  }
  return null;
}

function getRelativeLuminanceChannel(value) {
  const normalized = value / 255;
  return normalized <= 0.03928 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
}

function getContrastRatio(foreground, background) {
  if (!foreground || !background) return 0;
  const fgLuminance =
    0.2126 * getRelativeLuminanceChannel(foreground.r) +
    0.7152 * getRelativeLuminanceChannel(foreground.g) +
    0.0722 * getRelativeLuminanceChannel(foreground.b);
  const bgLuminance =
    0.2126 * getRelativeLuminanceChannel(background.r) +
    0.7152 * getRelativeLuminanceChannel(background.g) +
    0.0722 * getRelativeLuminanceChannel(background.b);
  const lighter = Math.max(fgLuminance, bgLuminance);
  const darker = Math.min(fgLuminance, bgLuminance);
  return (lighter + 0.05) / (darker + 0.05);
}

function collectActivityAnchorTargets(activity, index) {
  const activityId = String(activity?.id || '').trim();
  const anchors = new Set();
  const fallbackActivityId = `activity-${index + 1}`;
  if (activityId) {
    anchors.add(activityId);
    anchors.add(`cf-activity-${slugifyValidation(activityId, fallbackActivityId)}`);
    anchors.add(`cb-${slugifyValidation(activityId, `section-${index + 1}`)}`);
  }

  collectHtmlLikeStrings(activity?.data || {}).forEach((html) => {
    extractHtmlIdTargets(html).forEach((target) => anchors.add(target));
  });

  if (activity?.type === 'card_list') {
    const cards = Array.isArray(activity?.data?.cards) ? activity.data.cards : [];
    cards.forEach((_, cardIndex) => {
      anchors.add(`${slugifyValidation(activityId, 'card-list')}-panel-${cardIndex + 1}`);
    });
  }

  return anchors;
}

export function validateComposerActivity(activity) {
  const issues = [];
  const type = activity?.type || '';
  const data = activity?.data && typeof activity.data === 'object' ? activity.data : {};

  const looksLikeAssetPathOrUrl = (value) => {
    const raw = String(value || '').trim();
    if (!raw) return false;
    if (/^javascript:/i.test(raw)) return false;
    if (/^(https?:)?\/\//i.test(raw)) return true;
    if (/^(\/|\.\/|\.\.\/)/.test(raw)) return true;
    if (/^(blob:|data:)/i.test(raw)) return true;
    if (/^(assets|materials)\//i.test(raw)) return true;
    if (/\s/.test(raw)) return false;
    return raw.includes('/') || /\.[a-z0-9]{2,8}($|[?#])/i.test(raw);
  };

  const addIssue = (level, message) => {
    issues.push({ level: level === 'error' ? 'error' : 'warn', message: String(message || '').trim() });
  };

  if (!type || !getActivityDefinition(type)) {
    addIssue('error', `Unknown activity type: ${type || '(missing)'}`);
    return issues;
  }

  if (type === 'embed_block') {
    if (!String(data.url || '').trim()) addIssue('error', 'Embed URL is missing.');
    if (String(data.url || '').trim() && !looksLikeAssetPathOrUrl(data.url)) addIssue('warn', 'Embed URL format looks invalid.');
  }

  if (type === 'image_block') {
    if (!String(data.url || '').trim()) addIssue('error', 'Image URL is missing.');
    if (String(data.url || '').trim() && !looksLikeAssetPathOrUrl(data.url)) addIssue('warn', 'Image URL format looks invalid.');
    if (!String(data.alt || '').trim()) addIssue('warn', 'Alt text is empty (accessibility).');
  }

  if (type === 'title_block') {
    const titleText = stripValidationHtml(data.textHtml || data.text || '');
    if (!titleText) addIssue('warn', 'Title block content is empty.');
  }

  if (type === 'content_block') {
    const bodyText = stripValidationHtml(data.bodyHtml || data.body || '');
    if (!bodyText) addIssue('warn', 'Content block body is empty.');
  }

  if (type === 'resource_list') {
    const items = Array.isArray(data.items) ? data.items : [];
    if (!String(data.title || '').trim()) addIssue('warn', 'Resource list title is empty.');
    if (items.length === 0) addIssue('warn', 'No resources added yet.');
    items.forEach((item, idx) => {
      const label = String(item?.label || '').trim();
      const viewUrl = String(item?.viewUrl || item?.url || '').trim();
      const downloadUrl = String(item?.downloadUrl || item?.url || '').trim();
      const hasDigital = Boolean(item?.digitalContent);
      if (!label) addIssue('warn', `Resource #${idx + 1}: label is empty.`);
      if (!viewUrl && !downloadUrl && !hasDigital) addIssue('warn', `Resource #${idx + 1}: missing view/download/read source.`);
      if (viewUrl && !looksLikeAssetPathOrUrl(viewUrl)) addIssue('warn', `Resource #${idx + 1}: view URL format looks invalid.`);
      if (downloadUrl && !looksLikeAssetPathOrUrl(downloadUrl)) addIssue('warn', `Resource #${idx + 1}: download URL format looks invalid.`);
    });
  }

  if (type === 'rubric_creator') {
    const rowCount = clampRubricSize(data.rowCount, 3);
    const colCount = clampRubricSize(data.colCount, 3);
    if (!String(data.title || '').trim()) addIssue('warn', 'Rubric title is empty.');
    if (data.rowCount != null && clampRubricSize(data.rowCount, 3) !== Number.parseInt(data.rowCount, 10)) {
      addIssue('warn', `Rubric row count is clamped to ${rowCount} (allowed ${RUBRIC_MIN_SIZE}-${RUBRIC_MAX_SIZE}).`);
    }
    if (data.colCount != null && clampRubricSize(data.colCount, 3) !== Number.parseInt(data.colCount, 10)) {
      addIssue('warn', `Rubric column count is clamped to ${colCount} (allowed ${RUBRIC_MIN_SIZE}-${RUBRIC_MAX_SIZE}).`);
    }
    const rows = Array.isArray(data.rows) ? data.rows : [];
    const cols = Array.isArray(data.columns) ? data.columns : [];
    if (rows.length && rows.length !== rowCount) addIssue('warn', 'Rubric rows list does not match row count.');
    if (cols.length && cols.length !== colCount) addIssue('warn', 'Rubric columns list does not match column count.');
  }

  if (type === 'knowledge_check') {
    const rawQuestions = Array.isArray(data.questions) ? data.questions : [];
    if (rawQuestions.length) {
      rawQuestions.forEach((question, idx) => {
        const questionType = normalizeKnowledgeQuestionType(question?.type || question?.kind);
        if (!String(question?.prompt || '').trim()) addIssue('warn', `Knowledge check question #${idx + 1} prompt is empty.`);
        if (questionType === 'multiple_choice') {
          const options = (Array.isArray(question?.options) ? question.options : []).filter((option) => String(option || '').trim());
          if (options.length < 2) addIssue('warn', `Knowledge check question #${idx + 1} should have at least 2 options.`);
        }
      });
    } else {
      if (!String(data.prompt || '').trim()) addIssue('warn', 'Knowledge check prompt is empty.');
      const options = Array.isArray(data.options) ? data.options : [];
      if (options.length < 2) addIssue('warn', 'Knowledge check should have at least 2 options.');
    }
  }

  if (type === 'worksheet_form') {
    const blocks = normalizeWorksheetBuilderBlocks(data);
    if (!blocks.length) addIssue('warn', 'Worksheet has no blocks yet.');
    const fieldBlocks = blocks.filter((block) => block.kind === 'field');
    if (!fieldBlocks.length) addIssue('warn', 'Worksheet should include at least one input field.');
  }

  if (type === 'fillable_chart') {
    const chart = normalizeFillableChartData(data);
    if (!chart.rows.length) addIssue('warn', 'Fillable chart needs at least one row.');
    if (!chart.columns.length) addIssue('warn', 'Fillable chart needs at least one column.');
    const rawRows = Array.isArray(data.rows) ? data.rows : [];
    const rawColumns = Array.isArray(data.columns) ? data.columns : [];
    if (rawRows.length && rawRows.length !== chart.rowCount) addIssue('warn', 'Fillable chart rows list does not match row count.');
    if (rawColumns.length && rawColumns.length !== chart.colCount) addIssue('warn', 'Fillable chart columns list does not match column count.');
    const rawCells = Array.isArray(data.cells) ? data.cells : [];
    const hasCellRowMismatch = rawCells.length > 0 && rawCells.length !== chart.rowCount;
    const hasCellColumnMismatch = rawCells.some((row) => Array.isArray(row) && row.length !== chart.colCount);
    if (hasCellRowMismatch || hasCellColumnMismatch) {
      addIssue('warn', 'Fillable chart cells grid does not match row/column counts.');
    }
    const editableCount = chart.cells.flat().filter((cell) => cell.editable).length;
    if (!editableCount) addIssue('warn', 'Fillable chart has no editable cells for student responses.');
  }

  if (type === 'tab_group') {
    const tabs = Array.isArray(data.tabs) ? data.tabs : [];
    if (!tabs.length) addIssue('warn', 'Tab group has no tabs configured.');
    tabs.forEach((tab, idx) => {
      const ids = Array.isArray(tab?.activityIds) ? tab.activityIds.filter(Boolean) : [];
      const inline = Array.isArray(tab?.activities) ? tab.activities.filter(Boolean) : [];
      if (!ids.length && !inline.length) addIssue('warn', `Tab #${idx + 1} has no referenced or inline activities.`);
    });
  }

  if (type === 'card_list') {
    const cards = Array.isArray(data.cards) ? data.cards : [];
    if (!cards.length) addIssue('warn', 'Card list has no cards configured.');
    cards.forEach((card, idx) => {
      const hasRef = Boolean(String(card?.targetActivityId || '').trim());
      const hasInlineSingle = Boolean(card?.activity && typeof card.activity === 'object');
      const hasInlineMany = Array.isArray(card?.activities) && card.activities.some((item) => item && typeof item === 'object');
      if (!hasRef && !hasInlineSingle && !hasInlineMany) addIssue('warn', `Card #${idx + 1} has no target activity.`);
    });
  }

  if (type === 'hotspot_image') {
    if (!String(data.imageUrl || data.url || '').trim()) addIssue('warn', 'Hotspot image URL is empty.');
    if (String(data.imageUrl || data.url || '').trim() && !looksLikeAssetPathOrUrl(data.imageUrl || data.url)) {
      addIssue('warn', 'Hotspot image URL format looks invalid.');
    }
    const hotspots = Array.isArray(data.hotspots) ? data.hotspots : [];
    if (hotspots.length === 0) addIssue('warn', 'No hotspots defined yet.');
  }

  const htmlStrings = collectHtmlLikeStrings(data);
  const emptyHeadingCount = htmlStrings.reduce((total, html) => total + countEmptyHeadingTags(html), 0);
  if (emptyHeadingCount > 0) {
    addIssue('warn', `${emptyHeadingCount} heading tag${emptyHeadingCount === 1 ? '' : 's'} appear empty.`);
  }

  const explicitTextColor = parseColorToRgb(data.blockTextColor);
  const explicitBackgroundColor = parseColorToRgb(data.bodyContainerBg || data.blockContainerBg || data.containerBg);
  if (explicitTextColor && explicitBackgroundColor) {
    const ratio = getContrastRatio(explicitTextColor, explicitBackgroundColor);
    if (ratio > 0 && ratio < 3) {
      addIssue('error', `Text contrast is very low (${ratio.toFixed(2)}:1).`);
    } else if (ratio > 0 && ratio < 4.5) {
      addIssue('warn', `Text contrast may be hard to read (${ratio.toFixed(2)}:1).`);
    }
  }

  return issues.filter((issue) => issue && issue.message);
}

export function validateComposerActivities(activities) {
  const list = Array.isArray(activities) ? activities : [];
  const activityIds = list.map((activity) => String(activity?.id || '').trim());
  const validIds = new Set(activityIds.filter(Boolean));
  const duplicateIds = new Set(
    activityIds.filter((id, index) => id && activityIds.indexOf(id) !== index),
  );
  const availableAnchors = new Set();
  list.forEach((activity, index) => {
    collectActivityAnchorTargets(activity, index).forEach((target) => availableAnchors.add(target));
  });

  return list.map((activity, index) => {
    const id = String(activity?.id || '').trim();
    const type = activity?.type || '';
    const issues = validateComposerActivity(activity);
    const data = activity?.data && typeof activity.data === 'object' ? activity.data : {};
    const mobileOverride = activity?.layout?.breakpoints?.mobile;
    const hasMobileOverride =
      mobileOverride &&
      typeof mobileOverride === 'object' &&
      Object.keys(mobileOverride).some((key) => mobileOverride[key] !== '' && mobileOverride[key] != null);

    if (!id) {
      issues.push({ level: 'warn', message: 'Activity ID is missing.' });
    } else if (duplicateIds.has(id)) {
      issues.push({ level: 'error', message: 'Activity ID is duplicated. Duplicate IDs break references and preview selection.' });
    }

    if (!hasMobileOverride) {
      const colSpan = Math.max(1, Number.parseInt(activity?.layout?.colSpan, 10) || 1);
      const col = Math.max(1, Number.parseInt(activity?.layout?.col, 10) || 1);
      const x = Math.max(0, Number.parseInt(activity?.layout?.x, 10) || 0);
      const w = Math.max(1, Number.parseInt(activity?.layout?.w, 10) || colSpan);
      if (colSpan > 1 || col > 1 || x > 0 || w > 1) {
        issues.push({
          level: 'warn',
          message: 'No mobile override for this multi-column placement. It may overflow or feel cramped on small screens.',
        });
      }
    }

    const brokenAnchorTargets = new Set();
    collectHtmlLikeStrings(data).forEach((html) => {
      extractInternalHrefTargets(html).forEach((target) => {
        if (!availableAnchors.has(target)) {
          brokenAnchorTargets.add(target);
        }
      });
    });
    if (brokenAnchorTargets.size > 0) {
      issues.push({
        level: 'warn',
        message: `Internal anchor target${brokenAnchorTargets.size === 1 ? '' : 's'} missing: ${Array.from(brokenAnchorTargets).join(', ')}.`,
      });
    }

    if (type === 'tab_group') {
      const tabs = Array.isArray(data.tabs) ? data.tabs : [];
      tabs.forEach((tab, tabIndex) => {
        const missingIds = (Array.isArray(tab?.activityIds) ? tab.activityIds : [])
          .map((value) => String(value || '').trim())
          .filter((value) => value && !validIds.has(value));
        if (missingIds.length > 0) {
          issues.push({
            level: 'warn',
            message: `Tab #${tabIndex + 1} references missing activities: ${missingIds.join(', ')}.`,
          });
        }
      });
    }

    if (type === 'card_list') {
      const cards = Array.isArray(data.cards) ? data.cards : [];
      cards.forEach((card, cardIndex) => {
        const targetActivityId = String(card?.targetActivityId || '').trim();
        if (targetActivityId && !validIds.has(targetActivityId)) {
          issues.push({
            level: 'warn',
            message: `Card #${cardIndex + 1} references missing activity: ${targetActivityId}.`,
          });
        }
      });
    }

    return {
      index,
      id,
      type,
      issues: issues.filter((issue) => issue && issue.message),
    };
  });
}

export function countComposerValidationIssues(results) {
  return (Array.isArray(results) ? results : []).reduce(
    (totals, row) => {
      (Array.isArray(row?.issues) ? row.issues : []).forEach((issue) => {
        if (issue?.level === 'error') totals.error += 1;
        else totals.warn += 1;
      });
      return totals;
    },
    { error: 0, warn: 0 },
  );
}
