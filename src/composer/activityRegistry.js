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

function sanitizeRichHtml(rawHtml) {
  const input = String(rawHtml || '');
  if (!input.trim()) return '';
  // Remove scripts and inline event handlers from authored rich text.
  return input
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/\son[a-z]+\s*=\s*(['"]).*?\1/gi, '')
    .replace(/\shref\s*=\s*(['"])\s*javascript:.*?\1/gi, ' href="#"');
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
        bodyMode: 'rich',
        bodyHtml: '<p>Write your lesson content here.</p>',
      };
    },
    compileToHtml({ data = {} } = {}) {
      const richBody = sanitizeRichHtml(data.bodyHtml || '');
      const bodyHtml = data.bodyMode === 'plain' || !richBody ? renderSimpleBody(data.body) : richBody;
      return `
        <article class="rounded-xl border border-slate-700 bg-slate-900/70 p-6">
          <style>
            .cf-rich-content p { margin: 0.6rem 0; }
            .cf-rich-content ul { list-style: disc; padding-left: 1.5rem; margin: 0.75rem 0; }
            .cf-rich-content ol { list-style: decimal; padding-left: 1.5rem; margin: 0.75rem 0; }
            .cf-rich-content li { margin: 0.35rem 0; }
            .cf-rich-content h1 { font-size: 1.875rem; line-height: 2.25rem; font-weight: 700; margin: 1rem 0 0.5rem; }
            .cf-rich-content h2 { font-size: 1.5rem; line-height: 2rem; font-weight: 700; margin: 0.9rem 0 0.45rem; }
            .cf-rich-content h3 { font-size: 1.25rem; line-height: 1.75rem; font-weight: 700; margin: 0.8rem 0 0.4rem; }
            .cf-rich-content a { color: #7dd3fc; text-decoration: underline; }
            .cf-rich-content blockquote { border-left: 3px solid #475569; margin: 0.9rem 0; padding-left: 0.8rem; opacity: 0.95; }
          </style>
          ${data.title ? `<h3 class="text-xl font-bold text-white mb-3">${escapeHtml(data.title)}</h3>` : ''}
          <div class="text-slate-200 leading-relaxed cf-rich-content">${bodyHtml}</div>
        </article>
      `;
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
          class="rounded-xl border border-dashed border-slate-700/60 bg-transparent"
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
        tip: {
          card: 'border-emerald-500/40 bg-emerald-950/20',
          label: 'TIP',
          title: 'text-emerald-300',
          body: 'text-emerald-100/90',
        },
        warning: {
          card: 'border-amber-500/40 bg-amber-950/20',
          label: 'WARNING',
          title: 'text-amber-300',
          body: 'text-amber-100/90',
        },
        example: {
          card: 'border-sky-500/40 bg-sky-950/20',
          label: 'EXAMPLE',
          title: 'text-sky-300',
          body: 'text-sky-100/90',
        },
        myth: {
          card: 'border-rose-500/40 bg-rose-950/20',
          label: 'MYTH',
          title: 'text-rose-300',
          body: 'text-rose-100/90',
        },
        note: {
          card: 'border-violet-500/40 bg-violet-950/20',
          label: 'NOTE',
          title: 'text-violet-300',
          body: 'text-violet-100/90',
        },
      };
      const selectedTone = toneMap[tone] || toneMap.tip;
      return `
        <article class="rounded-xl border p-5 ${selectedTone.card}">
          <p class="text-[10px] font-bold uppercase tracking-widest ${selectedTone.title}">${selectedTone.label}</p>
          <h3 class="mt-2 text-lg font-bold ${selectedTone.title}">${escapeHtml(data.title || 'Callout')}</h3>
          <p class="mt-2 text-sm leading-relaxed ${selectedTone.body}">${renderSimpleBody(data.body || '')}</p>
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
        <article class="rounded-xl border border-slate-700 bg-slate-900/70 p-6">
          <h3 class="text-lg font-bold text-white mb-3">${escapeHtml(data.title || 'Accordion')}</h3>
          <div class="space-y-2">
            ${
              items.length
                ? items
                    .map(
                      (item, idx) => `
                      <details class="rounded-lg border border-slate-700 bg-slate-950/70 p-3" ${idx === 0 ? 'open' : ''}>
                        <summary class="cursor-pointer text-sm font-bold text-slate-100">${escapeHtml(item.question || `Item ${idx + 1}`)}</summary>
                        <div class="mt-2 text-sm text-slate-300 leading-relaxed">${renderSimpleBody(item.answer || '')}</div>
                      </details>
                    `,
                    )
                    .join('\n')
                : '<p class="text-sm text-slate-400">No accordion items yet.</p>'
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
        <article class="rounded-xl border border-slate-700 bg-slate-900/70 p-6">
          <h3 class="text-lg font-bold text-white mb-3">${escapeHtml(data.title || 'Tabs')}</h3>
          <div class="grid md:grid-cols-12 gap-3">
            ${
              tabs.length
                ? tabs
                    .map(
                      (tab, idx) => `
                      <div class="md:col-span-4 rounded-lg border border-slate-700 bg-slate-950/70 p-3">
                        <p class="text-xs font-bold uppercase tracking-widest text-indigo-300">Tab ${idx + 1}</p>
                        <h4 class="text-sm font-bold text-white mt-1">${escapeHtml(tab.label || `Tab ${idx + 1}`)}</h4>
                        <p class="text-sm text-slate-300 mt-2 leading-relaxed">${renderSimpleBody(tab.content || '')}</p>
                      </div>
                    `,
                    )
                    .join('\n')
                : '<p class="text-sm text-slate-400">No tabs configured yet.</p>'
            }
          </div>
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
        <article class="rounded-xl border border-slate-700 bg-slate-900/70 p-6">
          <h3 class="text-lg font-bold text-white mb-4">${escapeHtml(data.title || 'Steps')}</h3>
          ${
            steps.length
              ? `
              <ol class="space-y-3">
                ${steps
                  .map(
                    (step, idx) => `
                    <li class="rounded-lg border border-slate-700 bg-slate-950/70 p-4">
                      <div class="flex items-start gap-3">
                        <div class="w-7 h-7 rounded-full bg-indigo-600/20 border border-indigo-500/50 text-indigo-300 text-xs font-bold flex items-center justify-center">${idx + 1}</div>
                        <div>
                          <h4 class="text-sm font-bold text-white">${escapeHtml(step.title || `Step ${idx + 1}`)}</h4>
                          <p class="text-sm text-slate-300 mt-1 leading-relaxed">${renderSimpleBody(step.detail || '')}</p>
                        </div>
                      </div>
                    </li>
                  `,
                  )
                  .join('\n')}
              </ol>
            `
              : '<p class="text-sm text-slate-400">No steps added yet.</p>'
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
        <article class="rounded-xl border border-slate-700 bg-slate-900/70 p-6" data-checklist-block data-checklist-id="${escapeHtml(activityId)}">
          <div class="flex items-center justify-between gap-3 mb-3">
            <h3 class="text-lg font-bold text-white">${escapeHtml(data.title || 'Checklist')}</h3>
            <p class="text-xs font-semibold uppercase tracking-widest text-slate-400" data-checklist-progress>${items.length ? `0 / ${items.length}` : '0 / 0'} done</p>
          </div>
          ${
            items.length
              ? `
              <div class="space-y-2">
                ${items
                  .map(
                    (item, idx) => `
                    <label class="flex items-center gap-3 rounded-lg border border-slate-700 bg-slate-950/70 p-3">
                      <input type="checkbox" class="w-4 h-4" data-checklist-input data-checklist-index="${idx}" />
                      <span class="text-sm text-slate-200">${escapeHtml(item)}</span>
                    </label>
                  `,
                  )
                  .join('\n')}
              </div>
            `
              : '<p class="text-sm text-slate-400">No checklist items yet.</p>'
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
      return `
        <article class="rounded-xl border border-slate-700 bg-slate-900/70 p-6">
          <h3 class="text-lg font-bold text-white">${escapeHtml(data.title || 'Scenario Branch')}</h3>
          <p class="mt-2 text-sm text-slate-300">${renderSimpleBody(data.prompt || '')}</p>
          <div class="mt-4 space-y-2">
            ${
              choices.length
                ? choices
                    .map(
                      (choice, idx) => `
                      <details class="rounded-lg border border-slate-700 bg-slate-950/70 p-3">
                        <summary class="cursor-pointer text-sm font-bold text-slate-100">${escapeHtml(choice.label || `Choice ${idx + 1}`)}</summary>
                        <p class="text-sm text-slate-300 mt-2 leading-relaxed">${renderSimpleBody(choice.outcome || '')}</p>
                      </details>
                    `,
                    )
                    .join('\n')
                : '<p class="text-sm text-slate-400">No branches added yet.</p>'
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
        <article class="rounded-xl border border-slate-700 bg-slate-900/70 p-6">
          <h3 class="text-lg font-bold text-white">${escapeHtml(data.title || 'Sort')}</h3>
          <p class="text-sm text-slate-300 mt-2">${renderSimpleBody(data.instructions || '')}</p>
          ${
            items.length
              ? `
              <ol class="mt-4 space-y-2">
                ${items
                  .map(
                    (item, idx) => `
                    <li class="rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-200">
                      <span class="text-slate-500 mr-2 font-mono">${idx + 1}.</span>${escapeHtml(item)}
                    </li>
                  `,
                  )
                  .join('\n')}
              </ol>
            `
              : '<p class="text-sm text-slate-400 mt-3">No sort items yet.</p>'
          }
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
        <article class="rounded-xl border border-slate-700 bg-slate-900/70 p-6">
          <h3 class="text-lg font-bold text-white mb-3">${escapeHtml(data.title || 'Flashcards')}</h3>
          <div class="grid gap-3 md:grid-cols-2">
            ${
              cards.length
                ? cards
                    .map(
                      (card) => `
                      <div class="rounded-lg border border-slate-700 bg-slate-950/70 p-4">
                        <p class="text-[10px] font-bold uppercase tracking-widest text-slate-400">Front</p>
                        <p class="text-sm text-white mt-1">${renderSimpleBody(card.front || '')}</p>
                        <p class="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-3">Back</p>
                        <p class="text-sm text-slate-300 mt-1">${renderSimpleBody(card.back || '')}</p>
                      </div>
                    `,
                    )
                    .join('\n')
                : '<p class="text-sm text-slate-400">No cards yet.</p>'
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
        <article class="rounded-xl border border-slate-700 bg-slate-900/70 p-6">
          <h3 class="text-lg font-bold text-white">${escapeHtml(data.title || 'Reflection')}</h3>
          <p class="text-sm text-slate-300 mt-2">${renderSimpleBody(data.prompt || '')}</p>
          <textarea class="mt-4 w-full min-h-32 rounded-lg border border-slate-700 bg-slate-950/70 p-3 text-sm text-slate-200" placeholder="${escapeHtml(data.placeholder || 'Write here...')}"></textarea>
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
        fields: [
          { label: 'Goal', type: 'text', placeholder: 'Enter goal...' },
          { label: 'Plan', type: 'textarea', placeholder: 'Describe your plan...' },
        ],
      };
    },
    compileToHtml({ data = {} } = {}) {
      const fields = Array.isArray(data.fields) ? data.fields : [];
      return `
        <article class="rounded-xl border border-slate-700 bg-slate-900/70 p-6">
          <h3 class="text-lg font-bold text-white mb-3">${escapeHtml(data.title || 'Worksheet')}</h3>
          <div class="space-y-3">
            ${
              fields.length
                ? fields
                    .map((field, idx) => {
                      const label = escapeHtml(field?.label || `Field ${idx + 1}`);
                      const type = String(field?.type || 'text').toLowerCase();
                      const placeholder = escapeHtml(field?.placeholder || '');
                      if (type === 'textarea') {
                        return `
                          <div>
                            <label class="block text-xs font-bold uppercase tracking-wide text-slate-400 mb-1">${label}</label>
                            <textarea class="w-full min-h-24 rounded border border-slate-700 bg-slate-950/70 p-3 text-sm text-slate-200" placeholder="${placeholder}"></textarea>
                          </div>
                        `;
                      }
                      if (type === 'number') {
                        return `
                          <div>
                            <label class="block text-xs font-bold uppercase tracking-wide text-slate-400 mb-1">${label}</label>
                            <input type="number" class="w-full rounded border border-slate-700 bg-slate-950/70 p-2 text-sm text-slate-200" placeholder="${placeholder}" />
                          </div>
                        `;
                      }
                      return `
                        <div>
                          <label class="block text-xs font-bold uppercase tracking-wide text-slate-400 mb-1">${label}</label>
                          <input type="text" class="w-full rounded border border-slate-700 bg-slate-950/70 p-2 text-sm text-slate-200" placeholder="${placeholder}" />
                        </div>
                      `;
                    })
                    .join('\n')
                : '<p class="text-sm text-slate-400">No worksheet fields yet.</p>'
            }
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
        <article class="rounded-xl border border-slate-700 bg-slate-900/70 p-6">
          <h3 class="text-lg font-bold text-white">${escapeHtml(data.title || 'Portfolio')}</h3>
          <p class="text-sm text-slate-300 mt-2">${renderSimpleBody(data.instructions || '')}</p>
          <div class="mt-4 space-y-3">
            <div>
              <label class="block text-xs font-bold uppercase tracking-wide text-slate-400 mb-1">Artifact URL</label>
              <input type="text" class="w-full rounded border border-slate-700 bg-slate-950/70 p-2 text-sm text-slate-200" placeholder="https://..." />
            </div>
            <div>
              <label class="block text-xs font-bold uppercase tracking-wide text-slate-400 mb-1">Evidence Summary</label>
              <textarea class="w-full min-h-28 rounded border border-slate-700 bg-slate-950/70 p-3 text-sm text-slate-200" placeholder="Explain what this artifact proves..."></textarea>
            </div>
            ${
              criteria.length
                ? `
                <div class="rounded-lg border border-slate-700 bg-slate-950/70 p-3">
                  <p class="text-xs font-bold uppercase tracking-wide text-slate-400 mb-2">Self-Check</p>
                  <div class="space-y-2">
                    ${criteria
                      .map(
                        (item) => `
                        <label class="flex items-center gap-2 text-sm text-slate-200">
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
        <article class="rounded-xl border border-slate-700 bg-slate-900/70 p-6">
          <h3 class="text-lg font-bold text-white mb-3">${escapeHtml(data.title || 'Path Map')}</h3>
          ${
            nodes.length
              ? `
              <div class="grid gap-3 md:grid-cols-12">
                <div class="md:col-span-4 space-y-2">
                  ${nodes
                    .map(
                      (node, idx) => `
                      <div class="rounded-lg border border-slate-700 bg-slate-950/70 p-3">
                        <p class="text-xs font-bold uppercase tracking-widest text-slate-500">Path ${idx + 1}</p>
                        <p class="text-sm font-bold text-white mt-1">${escapeHtml(node.title || `Path ${idx + 1}`)}</p>
                      </div>
                    `,
                    )
                    .join('\n')}
                </div>
                <div class="md:col-span-8 space-y-2">
                  ${nodes
                    .map(
                      (node) => `
                      <div class="rounded-lg border border-slate-700 bg-slate-950/70 p-4">
                        <h4 class="text-sm font-bold text-indigo-300">${escapeHtml(node.title || 'Path')}</h4>
                        <p class="text-sm text-slate-300 mt-1 leading-relaxed">${renderSimpleBody(node.description || '')}</p>
                      </div>
                    `,
                    )
                    .join('\n')}
                </div>
              </div>
            `
              : '<p class="text-sm text-slate-400">No paths added yet.</p>'
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
        <article class="rounded-xl border border-slate-700 bg-slate-900/70 p-6">
          <h3 class="text-lg font-bold text-white mb-3">${escapeHtml(data.title || 'Interactive Image')}</h3>
          ${
            safeUrl
              ? `
              <figure class="rounded-lg border border-slate-700 bg-black overflow-hidden">
                <img src="${escapeHtml(safeUrl)}" alt="${escapeHtml(data.alt || 'Interactive image')}" class="w-full h-auto" loading="lazy" />
              </figure>
              ${
                hotspots.length
                  ? `
                  <div class="mt-3 grid md:grid-cols-2 gap-2">
                    ${hotspots
                      .map(
                        (spot, idx) => `
                        <div class="rounded border border-slate-700 bg-slate-950/70 p-2 text-xs text-slate-300">
                          <p class="font-bold text-slate-100">${escapeHtml(spot.label || `Hotspot ${idx + 1}`)} (${Number(spot.x) || 0}%, ${Number(spot.y) || 0}%)</p>
                          <p class="mt-1">${renderSimpleBody(spot.content || '')}</p>
                        </div>
                      `,
                      )
                      .join('\n')}
                  </div>
                `
                  : ''
              }
            `
              : '<p class="text-sm text-slate-400">Add an image URL to render hotspot content.</p>'
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
        <article class="rounded-xl border border-slate-700 bg-slate-900/70 p-6">
          <h3 class="text-lg font-bold text-white mb-4">${escapeHtml(data.title || 'Timeline')}</h3>
          ${
            events.length
              ? `
              <ol class="space-y-4 border-l border-slate-700 ml-2 pl-4">
                ${events
                  .map(
                    (event) => `
                    <li class="relative">
                      <span class="absolute -left-[23px] top-1.5 w-2 h-2 rounded-full bg-indigo-400"></span>
                      <p class="text-xs uppercase tracking-widest text-slate-500">${escapeHtml(event.date || '')}</p>
                      <h4 class="text-sm font-bold text-white mt-1">${escapeHtml(event.title || '')}</h4>
                      <p class="text-sm text-slate-300 mt-1 leading-relaxed">${renderSimpleBody(event.description || '')}</p>
                    </li>
                  `,
                  )
                  .join('\n')}
              </ol>
            `
              : '<p class="text-sm text-slate-400">No timeline events yet.</p>'
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
        <article class="rounded-xl border border-slate-700 bg-slate-900/70 p-6">
          <h3 class="text-lg font-bold text-white mb-3">${escapeHtml(data.title || 'Before / After')}</h3>
          <div class="grid md:grid-cols-2 gap-3">
            <div class="rounded-lg border border-rose-500/30 bg-rose-950/20 p-4">
              <p class="text-xs font-bold uppercase tracking-widest text-rose-300">${escapeHtml(data.beforeLabel || 'Before')}</p>
              <p class="text-sm text-rose-100/90 mt-2 leading-relaxed">${renderSimpleBody(data.beforeText || '')}</p>
            </div>
            <div class="rounded-lg border border-emerald-500/30 bg-emerald-950/20 p-4">
              <p class="text-xs font-bold uppercase tracking-widest text-emerald-300">${escapeHtml(data.afterLabel || 'After')}</p>
              <p class="text-sm text-emerald-100/90 mt-2 leading-relaxed">${renderSimpleBody(data.afterText || '')}</p>
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
        <article class="rounded-xl border border-slate-700 bg-slate-900/70 p-6">
          <h3 class="text-lg font-bold text-white">${escapeHtml(data.title || 'Roleplay Simulator')}</h3>
          <p class="text-sm text-slate-300 mt-2">${renderSimpleBody(data.scenario || '')}</p>
          <div class="mt-4 space-y-2">
            ${
              messages.length
                ? messages
                    .map(
                      (msg, idx) => `
                      <div class="rounded-lg border border-slate-700 bg-slate-950/70 p-3">
                        <p class="text-[10px] uppercase tracking-widest text-slate-500">${escapeHtml(msg.speaker || `Speaker ${idx + 1}`)}</p>
                        <p class="text-sm text-slate-200 mt-1">${renderSimpleBody(msg.line || '')}</p>
                      </div>
                    `,
                    )
                    .join('\n')
                : '<p class="text-sm text-slate-400">No dialogue turns yet.</p>'
            }
          </div>
          <div class="mt-4">
            <label class="block text-xs font-bold uppercase tracking-wide text-slate-400 mb-1">${escapeHtml(data.responsePrompt || 'Your response')}</label>
            <textarea class="w-full min-h-28 rounded border border-slate-700 bg-slate-950/70 p-3 text-sm text-slate-200" placeholder="Draft your response..."></textarea>
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
      const scored = variables.map((variable) => {
        const min = Number(variable?.min);
        const max = Number(variable?.max);
        const value = Number(variable?.value);
        const weight = Number(variable?.weight);
        const safeMin = Number.isFinite(min) ? min : 0;
        const safeMax = Number.isFinite(max) ? max : 10;
        const clampedValue = Number.isFinite(value) ? Math.max(safeMin, Math.min(safeMax, value)) : safeMin;
        const safeWeight = Number.isFinite(weight) && weight > 0 ? weight : 1;
        const normalized = safeMax === safeMin ? 0 : (clampedValue - safeMin) / (safeMax - safeMin);
        return {
          name: String(variable?.name || 'Variable'),
          value: clampedValue,
          weight: safeWeight,
          normalized,
        };
      });
      const totalWeight = scored.reduce((sum, variable) => sum + variable.weight, 0);
      const weightedSum = scored.reduce((sum, variable) => sum + variable.normalized * variable.weight, 0);
      const score = totalWeight > 0 ? Math.round((weightedSum / totalWeight) * 100) : 0;
      return `
        <article class="rounded-xl border border-slate-700 bg-slate-900/70 p-6">
          <h3 class="text-lg font-bold text-white">${escapeHtml(data.title || 'Decision Lab')}</h3>
          <p class="text-sm text-slate-300 mt-2">${renderSimpleBody(data.description || '')}</p>
          <div class="mt-4 grid gap-2 md:grid-cols-2">
            ${
              scored.length
                ? scored
                    .map(
                      (variable) => `
                      <div class="rounded-lg border border-slate-700 bg-slate-950/70 p-3">
                        <p class="text-xs uppercase tracking-widest text-slate-500">${escapeHtml(variable.name)}</p>
                        <p class="text-sm text-slate-200 mt-1">Value: <span class="font-bold text-white">${variable.value}</span></p>
                        <p class="text-xs text-slate-400 mt-1">Weight: ${variable.weight}</p>
                      </div>
                    `,
                    )
                    .join('\n')
                : '<p class="text-sm text-slate-400">No decision variables yet.</p>'
            }
          </div>
          <div class="mt-4 rounded-lg border border-indigo-500/30 bg-indigo-950/20 p-3">
            <p class="text-xs uppercase tracking-widest text-indigo-300">${escapeHtml(data.resultLabel || 'Outcome score')}</p>
            <p class="text-2xl font-black text-white mt-1">${score}</p>
          </div>
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
