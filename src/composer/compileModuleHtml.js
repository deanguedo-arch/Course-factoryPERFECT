import { getActivityDefinition } from './activityRegistry.js';
import { normalizeComposerActivities, normalizeComposerModuleConfig } from './layout.js';

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function normalizeActivities(activities, { maxColumns } = {}) {
  return normalizeComposerActivities(activities, { maxColumns });
}

function buildComposerRuntimeScript() {
  return `
    (function() {
      if (window.__CF_COMPOSER_RUNTIME_BOUND__) return;
      window.__CF_COMPOSER_RUNTIME_BOUND__ = true;

      function normalizeSpace(value) {
        return String(value || '').replace(/\\s+/g, ' ').trim();
      }

      function closest(el, selector) {
        while (el) {
          if (el.matches && el.matches(selector)) return el;
          el = el.parentElement;
        }
        return null;
      }

      function resolveViewerUrl(rawUrl) {
        var url = resolveAssetUrl(rawUrl);
        if (!url) return '';
        if (url.indexOf('docs.google.com/viewer') !== -1) return url;
        var isIframe = window.self !== window.top;
        var isGoogleHost = /\\.google\\./i.test(window.location.hostname || '');
        var isDrive = /docs\\.google\\.com|drive\\.google\\.com/i.test(url);
        if ((isIframe || isGoogleHost) && !isDrive) {
          return 'https://docs.google.com/viewer?embedded=true&url=' + encodeURIComponent(url);
        }
        return url;
      }

      function resolveAssetUrl(rawUrl) {
        var url = String(rawUrl || '').trim();
        if (!url) return '';

        // Keep absolute/remote URLs untouched.
        if (/^(https?:|data:|blob:|mailto:)/i.test(url)) return url;
        if (/^\\/\\//.test(url)) return url;

        function smartJoin(base, path) {
          if (!base) return path;
          var baseClean = String(base).replace(/\\/$/, '');
          if (!path || !/^\\//.test(path)) return baseClean + '/' + path;
          var baseParts = baseClean.split('/');
          var lastBaseSegment = baseParts[baseParts.length - 1];
          if (lastBaseSegment && path.indexOf('/' + lastBaseSegment + '/') === 0) {
            return baseClean + path.substring(lastBaseSegment.length + 1);
          }
          return baseClean + path;
        }

        function normalizeLocalMaterialPath(value) {
          var clean = String(value || '').trim();
          var idx = clean.indexOf('/materials/');
          if (idx !== -1) return clean.substring(idx);
          if (/^materials\\//.test(clean)) return '/' + clean;
          return clean;
        }

        function getOriginalLocalMaterialPath(value) {
          var clean = String(value || '').trim();
          var idx = clean.indexOf('/materials/');
          if (idx !== -1) {
            var withPrefix = clean;
            return withPrefix.startsWith('/') ? withPrefix : ('/' + withPrefix);
          }
          if (/^materials\\//.test(clean)) return '/' + clean;
          if (/^\\/materials\\//.test(clean)) return clean;
          return '';
        }

        // Use configured asset base URL when available (Google Sites / CDN).
        var baseUrl = String(window.CF_ASSET_BASE_URL || '').trim().replace(/\\/$/, '');
        var materialPath = normalizeLocalMaterialPath(url);
        var originalMaterialPath = getOriginalLocalMaterialPath(url);
        if (baseUrl && /^\\/materials\\//.test(materialPath)) {
          return smartJoin(baseUrl, materialPath);
        }

        // For embedded/hosted contexts without base URL, prefer preserving the original absolute path.
        if (originalMaterialPath) {
          var pathname = window.location && window.location.pathname ? window.location.pathname : '';
          var host = window.location && window.location.hostname ? window.location.hostname : '';
          var inGoogleEmbed = /googleusercontent\\.com|sites\\.google\\.com/i.test(host) || /\\/embeds\\//.test(pathname);
          if (inGoogleEmbed) {
            return originalMaterialPath;
          }
        }

        // Normalize known local materials paths so they work in local exported modules and ZIPs.
        if (/^\\/materials\\//.test(materialPath)) {
          var rel = materialPath.substring(1); // materials/...
          var path = window.location && window.location.pathname ? window.location.pathname : '';
          var inModulesDir = /\\/modules\\//.test(path) || window.location.protocol === 'file:';
          return inModulesDir ? ('../' + rel) : rel;
        }

        if (/^\\//.test(url)) return url;
        return url;
      }

      function getSubmissionContext(target) {
        var block = closest(target, '[data-submission-block]');
        if (!block) return null;
        return {
          block: block,
          output: block.querySelector('[data-submission-output]'),
        };
      }

      function buildSubmissionReport(root) {
        var lines = [];
        var checks = root.querySelectorAll('[data-kc-block]');
        checks.forEach(function(block, idx) {
          var promptEl = block.querySelector('h3');
          var prompt = promptEl ? normalizeSpace(promptEl.innerText) : ('Knowledge Check ' + (idx + 1));
          var selected = block.querySelector('input[type="radio"]:checked');
          var selectedLabel = '[No selection]';
          if (selected) {
            var label = selected.closest('label');
            selectedLabel = label ? normalizeSpace(label.innerText) : ('Option ' + selected.value);
          }
          lines.push((idx + 1) + '. ' + prompt);
          lines.push('Answer: ' + selectedLabel);
          var shortAnswer = block.querySelector('[data-kc-short-answer]');
          if (shortAnswer) {
            var shortAnswerText = normalizeSpace(shortAnswer.value);
            lines.push('Reflection: ' + (shortAnswerText || '[No response]'));
          }
          lines.push('');
        });

        if (lines.length > 0) return lines.join('\\n');

        var fields = root.querySelectorAll('input:not([type="hidden"]):not([type="radio"]):not([type="checkbox"]), textarea, select');
        var fieldLines = [];
        fields.forEach(function(field, idx) {
          if (closest(field, '[data-submission-block]')) return;
          var value = normalizeSpace(field.value);
          if (!value) return;
          var id = field.id;
          var labelEl = null;
          if (id) labelEl = root.querySelector('label[for="' + id + '"]');
          if (!labelEl) labelEl = field.closest('label');
          var label = labelEl ? normalizeSpace(labelEl.innerText) : (field.name || field.id || ('Field ' + (idx + 1)));
          fieldLines.push(label + ': ' + value);
        });
        return fieldLines.length > 0 ? fieldLines.join('\\n') : 'No responses found to include in this report.';
      }

      function escapeForHtml(value) {
        return String(value || '')
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#39;');
      }

      function decodeDataAttrJson(raw) {
        if (!raw) return null;
        try {
          return JSON.parse(decodeURIComponent(raw));
        } catch (e) {
          return null;
        }
      }

      var resourceReaderState = null;

      function getReaderRefs(card) {
        if (!card) return null;
        return {
          card: card,
          panel: card.querySelector('[data-resource-reader]'),
          title: card.querySelector('[data-resource-reader-title]'),
          toc: card.querySelector('[data-resource-reader-toc]'),
          body: card.querySelector('[data-resource-reader-body]'),
          progress: card.querySelector('[data-resource-reader-progress]'),
          prevBtn: card.querySelector('[data-resource-reader-prev]'),
          nextBtn: card.querySelector('[data-resource-reader-next]'),
        };
      }

      function renderReaderToc(state) {
        if (!state || !state.refs || !state.refs.toc) return;
        var tocHtml = state.chapters
          .map(function(chapter, idx) {
            var chapterTitle = escapeForHtml(chapter && chapter.title ? chapter.title : ('Chapter ' + (idx + 1)));
            var chapterNumber = escapeForHtml(chapter && chapter.number ? String(chapter.number) : String(idx + 1));
            var isActive = idx === state.index;
            var btnClass = isActive
              ? 'w-full text-left px-3 py-2 rounded text-xs font-bold bg-emerald-600/20 border border-emerald-500/40 text-emerald-300'
              : 'w-full text-left px-3 py-2 rounded text-xs font-semibold text-slate-300 hover:bg-slate-800 border border-transparent';
            return '<button type="button" class="' + btnClass + '" data-resource-reader-chapter="' + idx + '">' + chapterNumber + '. ' + chapterTitle + '</button>';
          })
          .join('');
        state.refs.toc.innerHTML = tocHtml;
      }

      function renderReaderChapter(state) {
        if (!state || !state.refs || !state.refs.body) return;
        if (!state.chapters.length) {
          state.refs.body.innerHTML = '<p class="text-sm text-slate-300">No chapters found.</p>';
          if (state.refs.progress) state.refs.progress.textContent = '';
          if (state.refs.prevBtn) state.refs.prevBtn.disabled = true;
          if (state.refs.nextBtn) state.refs.nextBtn.disabled = true;
          renderReaderToc(state);
          return;
        }

        if (state.index < 0) state.index = 0;
        if (state.index > state.chapters.length - 1) state.index = state.chapters.length - 1;

        var chapter = state.chapters[state.index] || {};
        var chapterTitle = escapeForHtml(chapter.title || ('Chapter ' + (state.index + 1)));
        var chapterNumber = escapeForHtml(chapter.number ? String(chapter.number) : String(state.index + 1));
        var sections = Array.isArray(chapter.sections) ? chapter.sections : [];
        var sectionsHtml = sections
          .map(function(section) {
            var heading = escapeForHtml(section && section.heading ? section.heading : '');
            var body = escapeForHtml(section && section.content ? section.content : '').replace(/\\n/g, '<br>');
            return '<section class="mt-5">' +
              (heading ? '<h5 class="text-sm font-bold text-emerald-300 mb-2">' + heading + '</h5>' : '') +
              '<div class="text-sm text-slate-200 leading-relaxed">' + body + '</div>' +
            '</section>';
          })
          .join('');

        var resourceTitle = escapeForHtml(state.content && state.content.title ? state.content.title : 'Digital Resource');
        state.refs.body.innerHTML =
          '<h3 class="text-xl font-bold text-white mb-1">' + resourceTitle + '</h3>' +
          '<p class="text-xs uppercase tracking-widest text-slate-400 mb-4">Chapter ' + (state.index + 1) + ' of ' + state.chapters.length + '</p>' +
          '<h4 class="text-lg font-bold text-white border-b border-slate-800 pb-2">' + chapterNumber + '. ' + chapterTitle + '</h4>' +
          sectionsHtml;

        if (state.refs.progress) {
          state.refs.progress.textContent = 'Chapter ' + (state.index + 1) + ' / ' + state.chapters.length;
        }
        if (state.refs.prevBtn) state.refs.prevBtn.disabled = state.index === 0;
        if (state.refs.nextBtn) state.refs.nextBtn.disabled = state.index === state.chapters.length - 1;
        renderReaderToc(state);
      }

      function openResourceReader(card, titleText, payload) {
        var refs = getReaderRefs(card);
        if (!refs || !refs.panel || !refs.body) return;
        var content = payload && typeof payload === 'object' ? payload : {};
        var chapters = Array.isArray(content.chapters) ? content.chapters : [];
        resourceReaderState = {
          refs: refs,
          content: content,
          chapters: chapters,
          index: 0,
        };
        refs.panel.classList.remove('hidden');
        if (refs.title) {
          refs.title.textContent = 'Digital Resource: ' + (titleText || content.title || 'Read');
        }
        renderReaderChapter(resourceReaderState);
      }

      function closeResourceReader(card) {
        var refs = getReaderRefs(card);
        if (!refs || !refs.panel) return;
        refs.panel.classList.add('hidden');
        if (refs.body) refs.body.innerHTML = '';
        if (refs.toc) refs.toc.innerHTML = '';
        resourceReaderState = null;
      }

      function safeStorageGet(key) {
        if (!key) return '';
        try {
          return window.localStorage ? window.localStorage.getItem(key) : '';
        } catch (err) {
          return '';
        }
      }

      function safeStorageSet(key, value) {
        if (!key) return;
        try {
          if (window.localStorage) window.localStorage.setItem(key, value);
        } catch (err) {
          // Ignore storage permission/availability errors.
        }
      }

      function getChecklistStorageKey(block) {
        if (!block) return '';
        var rawId = (block.getAttribute('data-checklist-id') || '').trim();
        if (!rawId) return '';
        return 'cf_checklist_v1_' + rawId.replace(/[^a-z0-9_-]/gi, '_');
      }

      function refreshChecklistBlock(block, shouldPersist) {
        if (!block) return;
        var inputs = Array.prototype.slice.call(block.querySelectorAll('[data-checklist-input]'));
        var checkedIndices = [];
        inputs.forEach(function(input, idx) {
          if (input.checked) checkedIndices.push(idx);
          var row = closest(input, 'label');
          if (!row) return;
          var text = row.querySelector('span');
          if (!text) return;
          text.classList.toggle('line-through', input.checked);
          text.classList.toggle('text-slate-500', input.checked);
        });
        var total = parseInt(block.getAttribute('data-checklist-total') || String(inputs.length), 10);
        if (!Number.isFinite(total) || total < 0) total = inputs.length;
        var progress = block.querySelector('[data-checklist-progress]');
        if (progress) progress.textContent = checkedIndices.length + ' / ' + total + ' done';
        if (shouldPersist) {
          safeStorageSet(
            getChecklistStorageKey(block),
            JSON.stringify({
              checked: checkedIndices,
              updatedAt: Date.now(),
            }),
          );
        }
      }

      function restoreChecklistBlock(block) {
        if (!block) return;
        var raw = safeStorageGet(getChecklistStorageKey(block));
        if (raw) {
          try {
            var parsed = JSON.parse(raw);
            var checked = parsed && Array.isArray(parsed.checked) ? parsed.checked : [];
            var checkSet = new Set(checked.map(function(idx) { return parseInt(idx, 10); }).filter(function(idx) { return Number.isInteger(idx) && idx >= 0; }));
            Array.prototype.slice.call(block.querySelectorAll('[data-checklist-input]')).forEach(function(input, idx) {
              input.checked = checkSet.has(idx);
            });
          } catch (err) {
            // Ignore malformed saved checklist JSON.
          }
        }
        refreshChecklistBlock(block, false);
      }

      function setActiveTab(block, nextIndex) {
        if (!block) return;
        var triggers = Array.prototype.slice.call(block.querySelectorAll('[data-tabs-trigger]'));
        var panels = Array.prototype.slice.call(block.querySelectorAll('[data-tabs-panel]'));
        if (!triggers.length || !panels.length) return;
        var hasMatch = triggers.some(function(trigger) {
          return parseInt(trigger.getAttribute('data-tab-index') || '-1', 10) === nextIndex;
        });
        var active = hasMatch ? nextIndex : parseInt(triggers[0].getAttribute('data-tab-index') || '0', 10);
        triggers.forEach(function(trigger) {
          var idx = parseInt(trigger.getAttribute('data-tab-index') || '-1', 10);
          var isActive = idx === active;
          trigger.setAttribute('aria-selected', isActive ? 'true' : 'false');
          trigger.classList.toggle('ring-1', isActive);
          trigger.classList.toggle('ring-indigo-400', isActive);
          trigger.classList.toggle('border-indigo-500', isActive);
          trigger.classList.toggle('text-white', isActive);
          trigger.classList.toggle('border-slate-700', !isActive);
          trigger.classList.toggle('text-slate-200', !isActive);
        });
        panels.forEach(function(panel) {
          var idx = parseInt(panel.getAttribute('data-tab-index') || '-1', 10);
          panel.classList.toggle('hidden', idx !== active);
        });
      }

      function setFlashcardFace(card, showBack) {
        if (!card) return;
        var front = card.querySelector('[data-flashcard-front]');
        var back = card.querySelector('[data-flashcard-back]');
        var toggleBtn = card.querySelector('[data-flashcard-toggle]');
        if (front) front.classList.toggle('hidden', showBack);
        if (back) back.classList.toggle('hidden', !showBack);
        card.setAttribute('data-flashcard-side', showBack ? 'back' : 'front');
        if (toggleBtn) toggleBtn.textContent = showBack ? 'Show Front' : 'Show Back';
      }

      function setPathMapIndex(block, nextIndex) {
        if (!block) return;
        var nodes = Array.prototype.slice.call(block.querySelectorAll('[data-path-node]'));
        var panels = Array.prototype.slice.call(block.querySelectorAll('[data-path-panel]'));
        if (!nodes.length || !panels.length) return;
        var hasMatch = nodes.some(function(node) {
          return parseInt(node.getAttribute('data-path-index') || '-1', 10) === nextIndex;
        });
        var active = hasMatch ? nextIndex : parseInt(nodes[0].getAttribute('data-path-index') || '0', 10);
        nodes.forEach(function(node) {
          var idx = parseInt(node.getAttribute('data-path-index') || '-1', 10);
          var isActive = idx === active;
          node.classList.toggle('ring-1', isActive);
          node.classList.toggle('ring-indigo-400', isActive);
          node.classList.toggle('border-indigo-500', isActive);
          node.classList.toggle('text-white', isActive);
          node.classList.toggle('border-slate-700', !isActive);
          node.classList.toggle('text-slate-200', !isActive);
        });
        panels.forEach(function(panel) {
          var idx = parseInt(panel.getAttribute('data-path-index') || '-1', 10);
          panel.classList.toggle('hidden', idx !== active);
        });
      }

      function setHotspotIndex(block, nextIndex) {
        if (!block) return;
        var buttons = Array.prototype.slice.call(block.querySelectorAll('[data-hotspot-btn]'));
        var panels = Array.prototype.slice.call(block.querySelectorAll('[data-hotspot-panel]'));
        if (!buttons.length || !panels.length) return;
        var hasMatch = buttons.some(function(btn) {
          return parseInt(btn.getAttribute('data-hotspot-index') || '-1', 10) === nextIndex;
        });
        var active = hasMatch ? nextIndex : parseInt(buttons[0].getAttribute('data-hotspot-index') || '0', 10);
        buttons.forEach(function(btn) {
          var idx = parseInt(btn.getAttribute('data-hotspot-index') || '-1', 10);
          var isActive = idx === active;
          btn.classList.toggle('border-sky-300', isActive);
          btn.classList.toggle('bg-sky-500', isActive);
          btn.classList.toggle('text-slate-950', isActive);
          btn.classList.toggle('border-slate-200/80', !isActive);
          btn.classList.toggle('bg-slate-900/85', !isActive);
          btn.classList.toggle('text-white', !isActive);
        });
        panels.forEach(function(panel) {
          var idx = parseInt(panel.getAttribute('data-hotspot-index') || '-1', 10);
          panel.classList.toggle('hidden', idx !== active);
        });
      }

      function refreshBeforeAfterBlock(block) {
        if (!block) return;
        var slider = block.querySelector('[data-before-after-slider]');
        if (!slider) return;
        var raw = parseInt(slider.value || '50', 10);
        var afterPct = Number.isFinite(raw) ? Math.max(0, Math.min(100, raw)) : 50;
        var beforePct = 100 - afterPct;
        var beforePanel = block.querySelector('[data-before-panel]');
        var afterPanel = block.querySelector('[data-after-panel]');
        if (beforePanel) beforePanel.style.opacity = String((Math.max(20, beforePct) / 100).toFixed(2));
        if (afterPanel) afterPanel.style.opacity = String((Math.max(20, afterPct) / 100).toFixed(2));
        var valueEl = block.querySelector('[data-before-after-value]');
        if (valueEl) valueEl.textContent = beforePct + ' / ' + afterPct;
      }

      function refreshDecisionBlock(block) {
        if (!block) return;
        var inputs = Array.prototype.slice.call(block.querySelectorAll('[data-decision-input]'));
        if (!inputs.length) return;
        var totalWeight = 0;
        var weightedSum = 0;
        inputs.forEach(function(input) {
          var min = Number(input.getAttribute('data-decision-min'));
          var max = Number(input.getAttribute('data-decision-max'));
          var weight = Number(input.getAttribute('data-decision-weight'));
          var safeMin = Number.isFinite(min) ? min : 0;
          var safeMax = Number.isFinite(max) && max >= safeMin ? max : safeMin + 10;
          var safeWeight = Number.isFinite(weight) && weight > 0 ? weight : 1;
          var value = Number(input.value);
          var clamped = Number.isFinite(value) ? Math.max(safeMin, Math.min(safeMax, value)) : safeMin;
          if (String(clamped) !== String(input.value)) input.value = String(clamped);
          var normalized = safeMax === safeMin ? 0 : (clamped - safeMin) / (safeMax - safeMin);
          weightedSum += normalized * safeWeight;
          totalWeight += safeWeight;
          var key = input.getAttribute('data-decision-key') || '';
          if (key) {
            var current = block.querySelector('[data-decision-current][data-decision-key="' + key + '"]');
            if (current) current.textContent = String(clamped);
          }
        });
        var score = totalWeight > 0 ? Math.round((weightedSum / totalWeight) * 100) : 0;
        var scoreEl = block.querySelector('[data-decision-score]');
        if (scoreEl) scoreEl.textContent = String(score);
      }

      function getSortContext(target) {
        var item = closest(target, '[data-sort-item]');
        if (!item) return null;
        var list = closest(item, '[data-sort-list]');
        if (!list) return null;
        return { item: item, list: list };
      }

      function refreshSortRanks(list) {
        if (!list) return;
        Array.prototype.slice.call(list.querySelectorAll('[data-sort-item]')).forEach(function(item, idx) {
          var rank = item.querySelector('[data-sort-rank]');
          if (rank) rank.textContent = String(idx + 1) + '.';
        });
      }

      function moveSortItem(item, offset) {
        if (!item || !offset) return;
        var list = closest(item, '[data-sort-list]');
        if (!list) return;
        var items = Array.prototype.slice.call(list.querySelectorAll('[data-sort-item]'));
        var fromIndex = items.indexOf(item);
        if (fromIndex < 0) return;
        var toIndex = Math.max(0, Math.min(items.length - 1, fromIndex + offset));
        if (toIndex === fromIndex) return;
        if (toIndex > fromIndex) {
          list.insertBefore(item, items[toIndex].nextSibling);
        } else {
          list.insertBefore(item, items[toIndex]);
        }
        refreshSortRanks(list);
      }

      function initializeComposerRuntime() {
        Array.prototype.slice.call(document.querySelectorAll('[data-checklist-block]')).forEach(function(block) {
          restoreChecklistBlock(block);
        });
        Array.prototype.slice.call(document.querySelectorAll('[data-tabs-block]')).forEach(function(block) {
          var first = block.querySelector('[data-tabs-trigger]');
          var start = first ? parseInt(first.getAttribute('data-tab-index') || '0', 10) : 0;
          setActiveTab(block, start);
        });
        Array.prototype.slice.call(document.querySelectorAll('[data-flashcard]')).forEach(function(card) {
          setFlashcardFace(card, false);
        });
        Array.prototype.slice.call(document.querySelectorAll('[data-path-map-block]')).forEach(function(block) {
          var first = block.querySelector('[data-path-node]');
          var start = first ? parseInt(first.getAttribute('data-path-index') || '0', 10) : 0;
          setPathMapIndex(block, start);
        });
        Array.prototype.slice.call(document.querySelectorAll('[data-hotspot-block]')).forEach(function(block) {
          var first = block.querySelector('[data-hotspot-btn]');
          var start = first ? parseInt(first.getAttribute('data-hotspot-index') || '0', 10) : 0;
          setHotspotIndex(block, start);
        });
        Array.prototype.slice.call(document.querySelectorAll('[data-before-after-block]')).forEach(function(block) {
          refreshBeforeAfterBlock(block);
        });
        Array.prototype.slice.call(document.querySelectorAll('[data-decision-block]')).forEach(function(block) {
          refreshDecisionBlock(block);
        });
        Array.prototype.slice.call(document.querySelectorAll('[data-sort-list]')).forEach(function(list) {
          refreshSortRanks(list);
        });
      }

      var activeSortDragItem = null;
      var activeSortDropTarget = null;

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

        var tabTrigger = closest(event.target, '[data-tabs-trigger]');
        if (tabTrigger) {
          var tabBlock = closest(tabTrigger, '[data-tabs-block]');
          if (!tabBlock) return;
          var tabIndex = parseInt(tabTrigger.getAttribute('data-tab-index') || '0', 10);
          setActiveTab(tabBlock, Number.isFinite(tabIndex) ? tabIndex : 0);
          return;
        }

        var flashcardToggle = closest(event.target, '[data-flashcard-toggle]');
        if (flashcardToggle) {
          var flashcard = closest(flashcardToggle, '[data-flashcard]');
          if (!flashcard) return;
          var showBack = flashcard.getAttribute('data-flashcard-side') !== 'back';
          setFlashcardFace(flashcard, showBack);
          return;
        }

        var pathNode = closest(event.target, '[data-path-node]');
        if (pathNode) {
          var pathBlock = closest(pathNode, '[data-path-map-block]');
          if (!pathBlock) return;
          var pathIndex = parseInt(pathNode.getAttribute('data-path-index') || '0', 10);
          setPathMapIndex(pathBlock, Number.isFinite(pathIndex) ? pathIndex : 0);
          return;
        }

        var hotspotBtn = closest(event.target, '[data-hotspot-btn]');
        if (hotspotBtn) {
          var hotspotBlock = closest(hotspotBtn, '[data-hotspot-block]');
          if (!hotspotBlock) return;
          var hotspotIndex = parseInt(hotspotBtn.getAttribute('data-hotspot-index') || '0', 10);
          setHotspotIndex(hotspotBlock, Number.isFinite(hotspotIndex) ? hotspotIndex : 0);
          return;
        }

        var sortMoveBtn = closest(event.target, '[data-sort-move]');
        if (sortMoveBtn) {
          var sortContext = getSortContext(sortMoveBtn);
          if (!sortContext) return;
          var delta = parseInt(sortMoveBtn.getAttribute('data-sort-move') || '0', 10);
          if (!Number.isFinite(delta)) return;
          moveSortItem(sortContext.item, delta);
          return;
        }

        var viewResourceBtn = closest(event.target, '[data-resource-view]');
        if (viewResourceBtn) {
          var resourceCard = closest(viewResourceBtn, 'article');
          if (!resourceCard) return;
          var viewer = resourceCard.querySelector('[data-resource-viewer]');
          var frame = resourceCard.querySelector('[data-resource-viewer-frame]');
          var title = resourceCard.querySelector('[data-resource-viewer-title]');
          var rawUrl = viewResourceBtn.getAttribute('data-resource-url') || '';
          if (!viewer || !frame || !rawUrl) return;
          frame.src = resolveViewerUrl(rawUrl);
          if (title) title.textContent = 'Viewing: ' + (viewResourceBtn.getAttribute('data-resource-title') || 'Resource');
          viewer.classList.remove('hidden');
          return;
        }

        var closeResourceBtn = closest(event.target, '[data-resource-viewer-close]');
        if (closeResourceBtn) {
          var closeCard = closest(closeResourceBtn, 'article');
          if (!closeCard) return;
          var closeViewer = closeCard.querySelector('[data-resource-viewer]');
          var closeFrame = closeCard.querySelector('[data-resource-viewer-frame]');
          if (closeFrame) closeFrame.src = '';
          if (closeViewer) closeViewer.classList.add('hidden');
          return;
        }

        var readResourceBtn = closest(event.target, '[data-resource-read]');
        if (readResourceBtn) {
          var readCard = closest(readResourceBtn, 'article');
          if (!readCard) return;
          var payload = decodeDataAttrJson(readResourceBtn.getAttribute('data-resource-read-content') || '');
          openResourceReader(readCard, readResourceBtn.getAttribute('data-resource-read-title') || 'Read', payload);
          return;
        }

        var closeReaderBtn = closest(event.target, '[data-resource-reader-close]');
        if (closeReaderBtn) {
          var closeReadCard = closest(closeReaderBtn, 'article');
          if (!closeReadCard) return;
          closeResourceReader(closeReadCard);
          return;
        }

        var tocChapterBtn = closest(event.target, '[data-resource-reader-chapter]');
        if (tocChapterBtn && resourceReaderState) {
          var idx = parseInt(tocChapterBtn.getAttribute('data-resource-reader-chapter') || '0', 10);
          if (!isNaN(idx)) {
            resourceReaderState.index = idx;
            renderReaderChapter(resourceReaderState);
          }
          return;
        }

        var prevReaderBtn = closest(event.target, '[data-resource-reader-prev]');
        if (prevReaderBtn && resourceReaderState) {
          resourceReaderState.index = Math.max(0, resourceReaderState.index - 1);
          renderReaderChapter(resourceReaderState);
          return;
        }

        var nextReaderBtn = closest(event.target, '[data-resource-reader-next]');
        if (nextReaderBtn && resourceReaderState) {
          resourceReaderState.index = Math.min(resourceReaderState.chapters.length - 1, resourceReaderState.index + 1);
          renderReaderChapter(resourceReaderState);
          return;
        }

        var downloadResourceBtn = closest(event.target, '[data-resource-download]');
        if (downloadResourceBtn) {
          var rawDownloadUrl = downloadResourceBtn.getAttribute('data-resource-download-url') || '';
          var downloadUrl = resolveAssetUrl(rawDownloadUrl);
          if (!downloadUrl) return;
          var downloadName = (downloadResourceBtn.getAttribute('data-resource-download-name') || 'resource').replace(/[^a-z0-9._ -]/gi, '');
          var link = document.createElement('a');
          link.href = downloadUrl;
          link.target = '_blank';
          link.rel = 'noopener noreferrer';
          link.setAttribute('download', downloadName || 'resource');
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          return;
        }

        var generateBtn = closest(event.target, '[data-submission-generate]');
        if (generateBtn) {
          var submissionContext = getSubmissionContext(generateBtn);
          if (!submissionContext || !submissionContext.output) return;
          var root = closest(generateBtn, '[data-composer-root]') || document;
          var reportText = buildSubmissionReport(root);
          submissionContext.output.textContent = reportText;
          return;
        }

        var copyBtn = closest(event.target, '[data-submission-copy]');
        if (copyBtn) {
          var copyContext = getSubmissionContext(copyBtn);
          var out = copyContext ? copyContext.output : null;
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
          return;
        }

        var downloadBtn = closest(event.target, '[data-submission-download]');
        if (downloadBtn) {
          var downloadContext = getSubmissionContext(downloadBtn);
          var downloadOut = downloadContext ? downloadContext.output : null;
          if (!downloadOut) return;
          var downloadText = downloadOut.textContent || '';
          if (!downloadText.trim()) return;
          var blob = new Blob([downloadText], { type: 'text/plain;charset=utf-8' });
          var link = document.createElement('a');
          link.href = URL.createObjectURL(blob);
          link.download = 'module-report.txt';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          setTimeout(function() {
            URL.revokeObjectURL(link.href);
          }, 500);
          return;
        }

        var printBtn = closest(event.target, '[data-submission-print]');
        if (printBtn) {
          var printContext = getSubmissionContext(printBtn);
          var printOut = printContext ? printContext.output : null;
          if (!printOut) return;
          var printText = printOut.textContent || '';
          if (!printText.trim()) return;
          var win = window.open('', '_blank');
          if (!win) return;
          win.document.write('<!DOCTYPE html><html><head><title>Module Report</title><style>body{font-family:Arial,sans-serif;padding:24px;line-height:1.4;}pre{white-space:pre-wrap;}</style></head><body><h1>Module Report</h1><pre>' + escapeForHtml(printText) + '</pre></body></html>');
          win.document.close();
          win.focus();
          win.print();
        }
      });

      document.addEventListener('change', function(event) {
        var checklistInput = closest(event.target, '[data-checklist-input]');
        if (checklistInput) {
          var checklistBlock = closest(checklistInput, '[data-checklist-block]');
          if (!checklistBlock) return;
          refreshChecklistBlock(checklistBlock, true);
        }
      });

      document.addEventListener('input', function(event) {
        var beforeAfterSlider = closest(event.target, '[data-before-after-slider]');
        if (beforeAfterSlider) {
          var beforeAfterBlock = closest(beforeAfterSlider, '[data-before-after-block]');
          if (!beforeAfterBlock) return;
          refreshBeforeAfterBlock(beforeAfterBlock);
          return;
        }

        var decisionInput = closest(event.target, '[data-decision-input]');
        if (decisionInput) {
          var decisionBlock = closest(decisionInput, '[data-decision-block]');
          if (!decisionBlock) return;
          refreshDecisionBlock(decisionBlock);
        }
      });

      document.addEventListener('dragstart', function(event) {
        var sortItem = closest(event.target, '[data-sort-item]');
        if (!sortItem) return;
        activeSortDragItem = sortItem;
        sortItem.classList.add('opacity-70');
        if (event.dataTransfer) {
          event.dataTransfer.effectAllowed = 'move';
          event.dataTransfer.setData('text/plain', 'sort-item');
        }
      });

      document.addEventListener('dragover', function(event) {
        if (!activeSortDragItem) return;
        var overItem = closest(event.target, '[data-sort-item]');
        var overList = overItem ? closest(overItem, '[data-sort-list]') : closest(event.target, '[data-sort-list]');
        if (!overList) return;
        event.preventDefault();
        if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';
        if (activeSortDropTarget && activeSortDropTarget !== overItem) {
          activeSortDropTarget.classList.remove('ring-1', 'ring-indigo-400');
        }
        if (overItem && overItem !== activeSortDragItem) {
          overItem.classList.add('ring-1', 'ring-indigo-400');
          activeSortDropTarget = overItem;
        } else {
          activeSortDropTarget = null;
        }
      });

      document.addEventListener('drop', function(event) {
        if (!activeSortDragItem) return;
        var targetItem = closest(event.target, '[data-sort-item]');
        var targetList = targetItem ? closest(targetItem, '[data-sort-list]') : closest(event.target, '[data-sort-list]');
        if (!targetList) return;
        event.preventDefault();
        if (activeSortDropTarget) {
          activeSortDropTarget.classList.remove('ring-1', 'ring-indigo-400');
          activeSortDropTarget = null;
        }
        if (!targetItem || targetItem === activeSortDragItem) {
          targetList.appendChild(activeSortDragItem);
          refreshSortRanks(targetList);
          return;
        }
        var rect = targetItem.getBoundingClientRect();
        var insertAfter = event.clientY > rect.top + rect.height / 2;
        if (insertAfter) {
          targetList.insertBefore(activeSortDragItem, targetItem.nextSibling);
        } else {
          targetList.insertBefore(activeSortDragItem, targetItem);
        }
        refreshSortRanks(targetList);
      });

      document.addEventListener('dragend', function() {
        if (activeSortDropTarget) {
          activeSortDropTarget.classList.remove('ring-1', 'ring-indigo-400');
          activeSortDropTarget = null;
        }
        if (activeSortDragItem) {
          activeSortDragItem.classList.remove('opacity-70');
          var owningList = closest(activeSortDragItem, '[data-sort-list]');
          if (owningList) refreshSortRanks(owningList);
          activeSortDragItem = null;
        }
      });

      initializeComposerRuntime();
    })();
  `;
}

export function compileComposerModule(module) {
  const { composerLayout, activities } = normalizeComposerModuleConfig(module);
  const maxColumns = composerLayout.maxColumns;
  const sections = activities.map((activity, idx) => {
    const colSpan = activity?.layout?.colSpan || 1;
    const row = Number.isInteger(activity?.layout?.row) ? activity.layout.row : null;
    const col = Number.isInteger(activity?.layout?.col) ? activity.layout.col : null;
    const sectionStyle = col
      ? `grid-column: ${col} / span ${colSpan};${row ? ` grid-row: ${row};` : ''}`
      : `grid-column: span ${colSpan} / span ${colSpan};${row ? ` grid-row: ${row};` : ''}`;
    const def = getActivityDefinition(activity.type);
    if (!def) {
      return `
        <section
          data-activity-type="${escapeHtml(activity.type)}"
          data-activity-id="${escapeHtml(activity.id)}"
          data-composer-col-span="${colSpan}"
          data-composer-row="${row || ''}"
          data-composer-col="${col || ''}"
          style="${sectionStyle}"
          class="rounded-xl border border-rose-500/30 bg-rose-950/20 p-5"
        >
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
      <section
        data-activity-type="${escapeHtml(activity.type)}"
        data-activity-id="${escapeHtml(activity.id)}"
        data-composer-col-span="${colSpan}"
        data-composer-row="${row || ''}"
        data-composer-col="${col || ''}"
        style="${sectionStyle}"
      >
        ${compiled}
      </section>
    `;
  });

  const html = `
    <div
      class="grid gap-6"
      data-composer-root
      data-composer-columns="${maxColumns}"
      style="grid-template-columns: repeat(${maxColumns}, minmax(0, 1fr)); grid-auto-flow: row;"
    >
      ${sections.length ? sections.join('\n') : '<p class="text-slate-400" style="grid-column: 1 / -1;">No composer activities added yet.</p>'}
    </div>
  `;

  return {
    html,
    css: '',
    script: buildComposerRuntimeScript(),
  };
}
