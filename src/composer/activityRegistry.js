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
  return '';
}

function renderSimpleBody(body) {
  return escapeHtml(body || '').replace(/\n/g, '<br>');
}

function escapeInlineScript(value) {
  return String(value || '').replace(/<\/script/gi, '<\\/script');
}

function encodeDataAttrJson(value) {
  try {
    return encodeURIComponent(JSON.stringify(value));
  } catch (e) {
    return '';
  }
}

export const ACTIVITY_REGISTRY = {
  content_block: {
    type: 'content_block',
    label: 'Content Block',
    createDefaultData() {
      return {
        title: 'New Section',
        body: 'Write your lesson content here.',
      };
    },
    compileToHtml({ data = {} } = {}) {
      return `
        <article class="rounded-xl border border-slate-700 bg-slate-900/70 p-6">
          ${data.title ? `<h3 class="text-xl font-bold text-white mb-3">${escapeHtml(data.title)}</h3>` : ''}
          <div class="text-slate-200 leading-relaxed">${renderSimpleBody(data.body)}</div>
        </article>
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
          <article class="rounded-xl border border-amber-500/30 bg-amber-950/20 p-6">
            <p class="text-amber-300 text-sm font-semibold uppercase tracking-wider">Embed missing URL</p>
          </article>
        `;
      }
      return `
        <article class="rounded-xl border border-slate-700 bg-slate-900/70 p-4">
          <div class="aspect-video rounded-lg overflow-hidden border border-slate-700 bg-black">
            <iframe src="${escapeHtml(safeUrl)}" title="${caption || 'Embedded content'}" class="w-full h-full" frameborder="0" allowfullscreen loading="lazy"></iframe>
          </div>
          ${caption ? `<p class="text-xs text-slate-400 mt-3">${caption}</p>` : ''}
          <p class="text-xs mt-2"><a href="${escapeHtml(safeUrl)}" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300 underline">Open in new tab</a></p>
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
          <article class="rounded-xl border border-amber-500/30 bg-amber-950/20 p-6">
            <p class="text-amber-300 text-sm font-semibold uppercase tracking-wider">Image URL missing</p>
          </article>
        `;
      }
      return `
        <figure class="rounded-xl border border-slate-700 bg-slate-900/70 p-4 ${widthClass}">
          <img src="${escapeHtml(safeUrl)}" alt="${alt}" class="w-full h-auto rounded-lg border border-slate-700" loading="lazy" />
          ${caption ? `<figcaption class="text-xs text-slate-400 mt-3">${caption}</figcaption>` : ''}
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
            ? `<button type="button" class="px-3 py-2 rounded bg-sky-600 hover:bg-sky-500 text-white text-[11px] font-bold uppercase tracking-wide" data-resource-view data-resource-url="${escapeHtml(safeViewUrl)}" data-resource-title="${label}">View</button>`
            : '';
          const downloadButton = safeDownloadUrl
            ? `<button type="button" class="px-3 py-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-100 text-[11px] font-bold uppercase tracking-wide text-center" data-resource-download data-resource-download-url="${escapeHtml(safeDownloadUrl)}" data-resource-download-name="${label}">Download</button>`
            : '';
          const readButton = encodedDigitalContent
            ? `<button type="button" class="px-3 py-2 rounded bg-emerald-700 hover:bg-emerald-600 text-white text-[11px] font-bold uppercase tracking-wide text-center" data-resource-read data-resource-read-title="${label}" data-resource-read-content="${escapeHtml(encodedDigitalContent)}">Read</button>`
            : '';
          if (!viewButton && !downloadButton && !readButton) {
            return `<li class="rounded-lg border border-slate-700 bg-slate-950/70 p-4"><p class="text-slate-200 text-sm font-semibold">${label}</p>${desc ? `<p class="text-xs text-slate-400 mt-1">${desc}</p>` : ''}</li>`;
          }
          return `
            <li class="rounded-lg border border-slate-700 bg-slate-950/70 p-4">
              <p class="text-slate-200 text-sm font-semibold">${label}</p>
              ${desc ? `<p class="text-xs text-slate-400 mt-1">${desc}</p>` : ''}
              <div class="mt-3 flex flex-wrap gap-2">
                ${viewButton}
                ${downloadButton}
                ${readButton}
              </div>
            </li>
          `;
        });
      return `
        <article class="rounded-xl border border-slate-700 bg-slate-900/70 p-6">
          <h3 class="text-lg font-bold text-white mb-3">${escapeHtml(data.title || 'Resources')}</h3>
          <div class="hidden mb-4 rounded-lg border border-slate-700 overflow-hidden bg-black" data-resource-viewer>
            <div class="flex items-center justify-between bg-slate-800 border-b border-slate-700 px-3 py-2">
              <p class="text-xs font-bold uppercase tracking-widest text-white" data-resource-viewer-title>Resource Viewer</p>
              <button type="button" class="text-xs font-bold uppercase tracking-widest text-rose-300 hover:text-white" data-resource-viewer-close>Close</button>
            </div>
            <iframe src="" title="Resource viewer" class="w-full border-0" style="height: 70vh;" data-resource-viewer-frame></iframe>
          </div>
          <div class="hidden mb-4 rounded-lg border border-emerald-500/30 overflow-hidden bg-slate-950" data-resource-reader>
            <div class="flex items-center justify-between bg-slate-800 border-b border-slate-700 px-3 py-2">
              <p class="text-xs font-bold uppercase tracking-widest text-emerald-300" data-resource-reader-title>Digital Resource</p>
              <button type="button" class="text-xs font-bold uppercase tracking-widest text-rose-300 hover:text-white" data-resource-reader-close>Close</button>
            </div>
            <div class="flex" style="height: 70vh;">
              <aside class="hidden md:block w-64 border-r border-slate-800 bg-slate-900/70 p-3 overflow-y-auto custom-scroll">
                <p class="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Contents</p>
                <div class="space-y-1" data-resource-reader-toc></div>
              </aside>
              <div class="flex-1 p-4 md:p-6 overflow-y-auto custom-scroll">
                <div data-resource-reader-body></div>
                <div class="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
                  <button type="button" class="px-3 py-2 rounded bg-slate-800 hover:bg-slate-700 text-white text-[11px] font-bold uppercase tracking-wide disabled:opacity-40" data-resource-reader-prev>Previous</button>
                  <p class="text-[11px] font-bold uppercase tracking-widest text-slate-400" data-resource-reader-progress></p>
                  <button type="button" class="px-3 py-2 rounded bg-slate-800 hover:bg-slate-700 text-white text-[11px] font-bold uppercase tracking-wide disabled:opacity-40" data-resource-reader-next>Next</button>
                </div>
              </div>
            </div>
          </div>
          ${rows.length ? `<ul class="space-y-3 text-sm">${rows.join('\n')}</ul>` : '<p class="text-slate-400 text-sm">No resources added yet.</p>'}
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
          <div class="rounded-xl border border-slate-700 bg-slate-950/70 p-4">
            <h4 class="text-base font-bold text-white">${title}</h4>
            <div class="mt-4 space-y-3">
              ${html || '<p class="text-slate-400 text-sm">No assessment HTML found for this item.</p>'}
            </div>
            ${script ? `<script>(function(){\n${script}\n})();<\/script>` : ''}
          </div>
        `;
      });
      return `
        <article class="rounded-xl border border-purple-500/30 bg-purple-950/20 p-6">
          <h3 class="text-lg font-bold text-purple-300 mb-3">${escapeHtml(data.title || 'Assessments')}</h3>
          ${cards.length ? `<div class="space-y-4">${cards.join('\n')}</div>` : '<p class="text-slate-400 text-sm">No assessments linked yet.</p>'}
        </article>
      `;
    },
  },
  knowledge_check: {
    type: 'knowledge_check',
    label: 'Knowledge Check',
    createDefaultData() {
      return {
        prompt: 'Add your question prompt here.',
        options: ['Option A', 'Option B', 'Option C'],
        correctIndex: 0,
        shortAnswerPrompt: 'Optional short-answer reflection',
      };
    },
    compileToHtml({ data = {}, index = 0, activityId = '' } = {}) {
      const options = (Array.isArray(data.options) ? data.options : []).filter((opt) => String(opt || '').trim().length > 0);
      const normalizedCorrect = Number.isInteger(data.correctIndex) ? data.correctIndex : 0;
      const questionName = `kc-${index}-${activityId}`;
      return `
        <article class="rounded-xl border border-slate-700 bg-slate-900/70 p-6" data-kc-block data-kc-id="${escapeHtml(activityId)}" data-kc-correct="${normalizedCorrect}">
          <h3 class="text-lg font-bold text-white mb-4">${escapeHtml(data.prompt || 'Knowledge Check')}</h3>
          <div class="space-y-2">
            ${options
              .map(
                (opt, optIdx) => `
                  <label class="flex items-center gap-3 rounded-lg border border-slate-700 bg-slate-950/70 p-3 text-slate-200">
                    <input type="radio" name="${questionName}" value="${optIdx}" class="w-4 h-4" />
                    <span>${escapeHtml(opt)}</span>
                  </label>
                `,
              )
              .join('\n')}
          </div>
          <div class="mt-4 flex items-center gap-3">
            <button type="button" class="px-3 py-2 rounded bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold uppercase tracking-wide" data-kc-check>
              Check Answer
            </button>
            <p class="text-xs text-slate-400" data-kc-result></p>
          </div>
          ${
            data.shortAnswerPrompt
              ? `
            <div class="mt-5">
              <label class="text-xs font-semibold uppercase tracking-wide text-slate-400 block mb-2">${escapeHtml(data.shortAnswerPrompt)}</label>
              <textarea class="w-full min-h-28 rounded-lg border border-slate-700 bg-slate-950/70 p-3 text-slate-200" data-kc-short-answer></textarea>
            </div>
          `
              : ''
          }
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
        <article class="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-6" data-submission-block>
          <h3 class="text-lg font-bold text-emerald-300 mb-3">${escapeHtml(data.title || 'Report Generator')}</h3>
          <div class="flex flex-wrap gap-3">
            <button type="button" class="px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-wide" data-submission-generate>
              ${escapeHtml(data.buttonLabel || 'Generate Report')}
            </button>
            <button type="button" class="px-4 py-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-bold uppercase tracking-wide" data-submission-copy>
              Copy to Clipboard
            </button>
            <button type="button" class="px-4 py-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-bold uppercase tracking-wide" data-submission-download>
              Download TXT
            </button>
            <button type="button" class="px-4 py-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-bold uppercase tracking-wide" data-submission-print>
              Print
            </button>
          </div>
          <pre class="mt-4 p-4 rounded bg-slate-950/70 border border-slate-700 text-xs text-slate-200 whitespace-pre-wrap" data-submission-output>Generate your report to view a summary here.</pre>
        </article>
      `;
    },
  },
};

export function getActivityDefinition(type) {
  return ACTIVITY_REGISTRY[type] || null;
}

export function listActivityTypes() {
  return Object.keys(ACTIVITY_REGISTRY);
}
