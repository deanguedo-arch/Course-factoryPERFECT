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
  resource_list: {
    type: 'resource_list',
    label: 'Resource List',
    createDefaultData() {
      return {
        title: 'Resources',
        items: [{ label: 'Resource link', url: '' }],
      };
    },
    compileToHtml({ data = {} } = {}) {
      const items = Array.isArray(data.items) ? data.items : [];
      const rows = items
        .filter((item) => item && (item.label || item.url))
        .map((item) => {
          const safeUrl = toSafeUrl(item.url);
          const label = escapeHtml(item.label || item.url || 'Resource');
          if (!safeUrl) {
            return `<li class="text-slate-400 text-sm">${label}</li>`;
          }
          return `<li><a href="${escapeHtml(safeUrl)}" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300 underline">${label}</a></li>`;
        });
      return `
        <article class="rounded-xl border border-slate-700 bg-slate-900/70 p-6">
          <h3 class="text-lg font-bold text-white mb-3">${escapeHtml(data.title || 'Resources')}</h3>
          ${rows.length ? `<ul class="space-y-2 text-sm">${rows.join('\n')}</ul>` : '<p class="text-slate-400 text-sm">No resources added yet.</p>'}
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
    label: 'Submission Builder',
    createDefaultData() {
      return {
        title: 'Submission Builder',
        buttonLabel: 'Generate Submission',
      };
    },
    compileToHtml({ data = {} } = {}) {
      return `
        <article class="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-6">
          <h3 class="text-lg font-bold text-emerald-300 mb-3">${escapeHtml(data.title || 'Submission Builder')}</h3>
          <div class="flex flex-wrap gap-3">
            <button type="button" class="px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-wide" data-submission-generate>
              ${escapeHtml(data.buttonLabel || 'Generate Submission')}
            </button>
            <button type="button" class="px-4 py-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-bold uppercase tracking-wide" data-submission-copy>
              Copy to Clipboard
            </button>
          </div>
          <pre class="mt-4 p-4 rounded bg-slate-950/70 border border-slate-700 text-xs text-slate-200 whitespace-pre-wrap" data-submission-output>Generate your submission to view a summary here.</pre>
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
