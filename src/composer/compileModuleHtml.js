import { getActivityDefinition } from './activityRegistry.js';

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function normalizeActivities(activities) {
  if (!Array.isArray(activities)) return [];
  return activities.map((activity, idx) => {
    const type = activity?.type || 'content_block';
    const id = activity?.id || `activity-${idx + 1}`;
    const data = activity?.data && typeof activity.data === 'object' ? activity.data : {};
    return { type, id, data };
  });
}

function buildComposerRuntimeScript() {
  return `
    (function() {
      function closest(el, selector) {
        while (el) {
          if (el.matches && el.matches(selector)) return el;
          el = el.parentElement;
        }
        return null;
      }

      document.addEventListener('click', function(event) {
        var checkBtn = closest(event.target, '[data-kc-check]');
        if (checkBtn) {
          var block = closest(checkBtn, '[data-kc-block]');
          if (!block) return;
          var correct = parseInt(block.getAttribute('data-kc-correct') || '0', 10);
          var chosen = block.querySelector('input[type="radio"]:checked');
          var resultEl = block.querySelector('[data-kc-result]');
          if (!chosen) {
            if (resultEl) resultEl.textContent = 'Select an option first.';
            return;
          }
          var selected = parseInt(chosen.value, 10);
          var isCorrect = selected === correct;
          if (resultEl) {
            resultEl.textContent = isCorrect ? 'Correct.' : 'Try again.';
            resultEl.className = isCorrect ? 'text-xs text-emerald-300' : 'text-xs text-rose-300';
          }
          return;
        }

        var generateBtn = closest(event.target, '[data-submission-generate]');
        if (generateBtn) {
          var output = document.querySelector('[data-submission-output]');
          if (!output) return;
          var lines = [];
          var blocks = document.querySelectorAll('[data-kc-block]');
          blocks.forEach(function(block, idx) {
            var prompt = block.querySelector('h3') ? block.querySelector('h3').innerText.trim() : ('Knowledge Check ' + (idx + 1));
            var selected = block.querySelector('input[type="radio"]:checked');
            var selectedLabel = '';
            if (selected) {
              var label = selected.closest('label');
              selectedLabel = label ? label.innerText.replace(/\\s+/g, ' ').trim() : ('Option ' + selected.value);
            } else {
              selectedLabel = '[No selection]';
            }
            lines.push((idx + 1) + '. ' + prompt);
            lines.push('Answer: ' + selectedLabel);

            var shortAnswer = block.querySelector('[data-kc-short-answer]');
            if (shortAnswer) {
              var text = (shortAnswer.value || '').trim();
              lines.push('Reflection: ' + (text || '[No response]'));
            }
            lines.push('');
          });
          output.textContent = lines.length ? lines.join('\\n') : 'No knowledge checks found.';
          return;
        }

        var copyBtn = closest(event.target, '[data-submission-copy]');
        if (copyBtn) {
          var out = document.querySelector('[data-submission-output]');
          if (!out) return;
          var text = out.textContent || '';
          if (!text.trim()) return;
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).catch(function() {});
          } else {
            var ta = document.createElement('textarea');
            ta.value = text;
            document.body.appendChild(ta);
            ta.select();
            try { document.execCommand('copy'); } catch (e) {}
            document.body.removeChild(ta);
          }
        }
      });
    })();
  `;
}

export function compileComposerModule(module) {
  const activities = normalizeActivities(module?.activities);
  const sections = activities.map((activity, idx) => {
    const def = getActivityDefinition(activity.type);
    if (!def) {
      return `
        <section class="rounded-xl border border-rose-500/30 bg-rose-950/20 p-5">
          <p class="text-rose-300 text-sm font-semibold">Unknown activity type: ${escapeHtml(activity.type)}</p>
        </section>
      `;
    }
    const compiled = def.compileToHtml({
      data: activity.data,
      index: idx,
      activityId: activity.id,
    });
    return `
      <section data-activity-type="${escapeHtml(activity.type)}" data-activity-id="${escapeHtml(activity.id)}">
        ${compiled}
      </section>
    `;
  });

  const html = `
    <div class="space-y-6" data-composer-root>
      ${sections.length ? sections.join('\n') : '<p class="text-slate-400">No composer activities added yet.</p>'}
    </div>
  `;

  return {
    html,
    css: '',
    script: buildComposerRuntimeScript(),
  };
}
