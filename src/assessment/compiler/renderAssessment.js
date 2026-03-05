const DEFAULT_PRINT_INSTRUCTIONS = `<li>Complete all required work on a separate sheet</li>
<li>Review your answers carefully</li>
<li>Print this page as a cover sheet</li>
<li>Attach your work and submit</li>`;

const asString = (value) => String(value ?? '').trim();

const escapeHtml = (value) => String(value ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

const escapeJsSingle = (value) => String(value ?? '')
  .replace(/\\/g, '\\\\')
  .replace(/'/g, "\\'")
  .replace(/\r/g, '\\r')
  .replace(/\n/g, '\\n')
  .replace(/\u2028/g, '\\u2028')
  .replace(/\u2029/g, '\\u2029');

const toTextClass = (value) => {
  const normalized = asString(value);
  return normalized.startsWith('text-') ? normalized : `text-${normalized}`;
};

const toBgBase = (value) => {
  const normalized = asString(value);
  return normalized.startsWith('bg-') ? normalized.slice(3) : normalized;
};

const toFilenameBase = (value) => {
  const safe = asString(value).replace(/[^a-z0-9]/gi, '_');
  return safe || 'assessment';
};

const normalizeMode = (value) => {
  const raw = asString(value).toLowerCase();
  if (raw === 'long-answer') return 'longanswer';
  if (raw === 'longanswer') return 'longanswer';
  if (raw === 'print') return 'print';
  if (raw === 'mixed') return 'mixed';
  return 'quiz';
};

const makeAssessmentId = (mode, idSeed) => {
  const safeMode = normalizeMode(mode);
  const hasSeed = Number.isFinite(Number(idSeed));
  const seed = hasSeed ? Math.trunc(Number(idSeed)) : Date.now();
  if (safeMode === 'mixed') {
    return `mixed_${seed}`;
  }
  return `quiz_${seed}`;
};

const normalizeIdentifier = (value) => {
  const normalized = asString(value).replace(/[^A-Za-z0-9_]/g, '_');
  if (!normalized) return 'assessment_0';
  if (/^[A-Za-z_]/.test(normalized)) return normalized;
  return `assessment_${normalized}`;
};

const normalizeQuestion = (rawQuestion, index, mode) => {
  const raw = rawQuestion && typeof rawQuestion === 'object' ? rawQuestion : {};
  const fallback = `Question ${index + 1}`;
  const question = asString(raw.question || raw.prompt || fallback);
  const options = Array.isArray(raw.options)
    ? raw.options.map((opt) => asString(opt)).filter((opt) => opt.length > 0)
    : [];
  const hasOptions = options.length > 0;

  let type = 'long-answer';
  if (mode === 'quiz') {
    type = 'multiple-choice';
  } else if (mode === 'longanswer') {
    type = 'long-answer';
  } else if (mode === 'mixed') {
    type = raw.type === 'multiple-choice' || raw.type === 'long-answer'
      ? raw.type
      : hasOptions
        ? 'multiple-choice'
        : 'long-answer';
  }

  if (type === 'multiple-choice') {
    const safeOptions = options.length ? options : ['', '', '', ''];
    const parsedCorrect = Number.parseInt(raw.correct, 10);
    const correct = Number.isFinite(parsedCorrect) && parsedCorrect >= 0 && parsedCorrect < safeOptions.length
      ? parsedCorrect
      : 0;
    return { question, type, options: safeOptions, correct };
  }

  return {
    question,
    type: 'long-answer',
    options: [],
    correct: 0,
  };
};

const resolveTheme = (courseSettings = {}) => {
  const backgroundColor = asString(courseSettings.backgroundColor || 'slate-950');
  const accentColor = asString(courseSettings.accentColor || 'sky');
  const isLightBg = backgroundColor.includes('white')
    || backgroundColor.includes('slate-100')
    || backgroundColor.includes('slate-50');

  const headingTextColor = asString(courseSettings.headingTextColor || (isLightBg ? 'slate-900' : 'white'));
  const secondaryTextColor = asString(courseSettings.secondaryTextColor || (isLightBg ? 'slate-600' : 'slate-400'));
  const assessmentTextColor = asString(courseSettings.assessmentTextColor || 'white');
  const buttonColor = asString(courseSettings.buttonColor || `${accentColor}-600`);

  const headingTextClass = toTextClass(headingTextColor);
  const secondaryTextClass = toTextClass(secondaryTextColor);
  const assessmentTextClass = toTextClass(assessmentTextColor);
  const bodyTextClass = assessmentTextClass;

  const buttonBgBase = toBgBase(buttonColor);
  const buttonBgClass = `bg-${buttonBgBase}`;
  const buttonHoverClass = buttonBgBase.endsWith('-600')
    ? `hover:bg-${buttonBgBase.replace(/-600$/, '-500')}`
    : `hover:bg-${buttonBgBase}`;
  const buttonTextClass = isLightBg ? 'text-slate-900' : 'text-white';

  return {
    accentColor,
    headingTextClass,
    secondaryTextClass,
    assessmentTextClass,
    bodyTextClass,
    buttonBgClass,
    buttonHoverClass,
    buttonTextClass,
    cardBgClass: isLightBg ? 'bg-white' : 'bg-slate-900',
    cardBorderClass: isLightBg ? 'border-slate-300' : 'border-slate-700',
    optionBgClass: isLightBg ? 'bg-slate-100' : 'bg-slate-800',
    optionHoverClass: isLightBg ? 'hover:bg-slate-200' : 'hover:bg-slate-750',
    inputBgClass: isLightBg ? 'bg-white' : 'bg-slate-950',
    inputTextClass: assessmentTextClass,
    modalBgClass: isLightBg ? 'bg-white' : 'bg-slate-900',
    modalBorderClass: isLightBg ? 'border-slate-300' : 'border-slate-700',
  };
};

const buildQuestionHeader = (theme, questionNumber, questionText, extraClass = '') => {
  const suffix = extraClass ? ` ${extraClass}` : '';
  return `<h3 class="text-lg font-bold ${theme.headingTextClass} mb-4${suffix}">${questionNumber}. ${escapeHtml(questionText || 'Untitled Question')}</h3>`;
};

const buildMixedDescription = (mcCount, laCount) => {
  if (mcCount > 0 && laCount > 0) {
    return `Complete ${mcCount} multiple-choice and ${laCount} long-answer questions.`;
  }
  if (mcCount > 0) {
    return `Select the best answer for each of ${mcCount} questions.`;
  }
  return `Complete all ${laCount} questions. Your responses are auto-saved.`;
};

const buildQuestionBlocks = ({
  id,
  questions,
  theme,
}) => {
  let longAnswerIndex = 0;

  const questionBlocks = questions.map((question, index) => {
    const questionNumber = index + 1;
    const isMultipleChoice = question.type === 'multiple-choice';

    if (isMultipleChoice) {
      const optionsHtml = question.options.map((option, optionIndex) => `
        <label class="flex items-center gap-3 p-3 ${theme.optionBgClass} rounded-lg cursor-pointer ${theme.optionHoverClass} transition-colors">
          <input type="radio" name="q${index}" value="${optionIndex}" class="w-4 h-4 assessment-input" />
          <span class="${theme.bodyTextClass}">${escapeHtml(option)}</span>
        </label>
      `).join('');

      return `
        <div class="mb-8 p-6 ${theme.cardBgClass} rounded-xl border ${theme.cardBorderClass}">
          ${buildQuestionHeader(theme, questionNumber, question.question)}
          <div class="space-y-2">
            ${optionsHtml}
          </div>
        </div>
      `;
    }

    const answerIndex = longAnswerIndex;
    longAnswerIndex += 1;

    return `
      <div class="mb-8 p-6 ${theme.cardBgClass} rounded-xl border ${theme.cardBorderClass} print-section">
        ${buildQuestionHeader(theme, questionNumber, question.question, ' print-question')}
        <textarea
          id="${id}-answer-${answerIndex}"
          placeholder="Type your answer here..."
          class="w-full h-48 ${theme.inputBgClass} border ${theme.cardBorderClass} rounded-lg p-4 ${theme.inputTextClass} resize-none focus:border-${theme.accentColor}-500 focus:outline-none print-response assessment-input"
        ></textarea>
        <p class="text-xs ${theme.secondaryTextClass} italic mt-2 no-print">Auto-saved to browser</p>
      </div>
    `;
  }).join('');

  return {
    html: questionBlocks,
    longAnswerCount: longAnswerIndex,
  };
};

const buildHeaderSubtitle = (mode, mcCount, laCount) => {
  if (mode === 'mixed') {
    return buildMixedDescription(mcCount, laCount);
  }
  if (mode === 'quiz') {
    return 'Select the best answer for each question.';
  }
  if (mode === 'longanswer') {
    return 'Complete all questions. Your responses are auto-saved.';
  }
  return 'Complete this assignment and submit to your instructor.';
};

const buildStudentInfoHtml = (id, mode, theme) => {
  if (mode === 'quiz' || mode === 'print') return '';

  return `
    <div class="grid grid-cols-2 gap-4 mb-8 p-6 ${theme.cardBgClass} rounded-xl border ${theme.cardBorderClass} print-header${mode === 'mixed' ? ' no-print' : ''}">
      <div>
        <label class="block text-xs font-bold ${theme.secondaryTextClass} uppercase mb-2">Student Name</label>
        <input
          type="text"
          id="${id}-student-name"
          placeholder="Enter your name..."
          class="w-full ${theme.inputBgClass} border ${theme.cardBorderClass} rounded p-3 ${theme.inputTextClass} text-sm focus:border-${theme.accentColor}-500 focus:outline-none assessment-input"
        />
      </div>
      <div>
        <label class="block text-xs font-bold ${theme.secondaryTextClass} uppercase mb-2">Date</label>
        <input
          type="date"
          id="${id}-student-date"
          class="w-full ${theme.inputBgClass} border ${theme.cardBorderClass} rounded p-3 ${theme.inputTextClass} text-sm focus:border-${theme.accentColor}-500 focus:outline-none assessment-input"
        />
      </div>
    </div>
  `;
};

const buildActionButtonsHtml = ({
  id,
  theme,
  includeLongAnswerActions,
}) => {
  return `
    <div class="flex flex-wrap gap-3 mt-8 no-print">
      <button type="button" onclick="${id}_reset()" class="${theme.buttonBgClass} ${theme.buttonHoverClass} ${theme.buttonTextClass} font-bold py-3 px-6 rounded-lg flex items-center gap-2">
        Reset
      </button>
      ${includeLongAnswerActions ? `
      <button type="button" onclick="${id}_download()" class="${theme.buttonBgClass} ${theme.buttonHoverClass} ${theme.buttonTextClass} font-bold py-3 px-6 rounded-lg flex items-center gap-2">
        Download Backup
      </button>
      <button type="button" onclick="document.getElementById('${id}-upload').click()" class="${theme.buttonBgClass} ${theme.buttonHoverClass} ${theme.buttonTextClass} font-bold py-3 px-6 rounded-lg flex items-center gap-2">
        Upload Backup
      </button>
      ` : ''}
      <button type="button" onclick="${id}_generateReport()" class="${theme.buttonBgClass} ${theme.buttonHoverClass} ${theme.buttonTextClass} font-bold py-3 px-6 rounded-lg flex items-center gap-2">
        Print & Submit
      </button>
    </div>
  `;
};

const buildResetModalHtml = (id, theme) => `
  <div id="${id}-reset-modal" class="fixed inset-0 bg-black/80 z-50 flex items-center justify-center hidden">
    <div class="${theme.modalBgClass} border ${theme.modalBorderClass} rounded-xl p-6 max-w-md mx-4">
      <h3 class="text-lg font-bold ${theme.headingTextClass} mb-4">Reset Assessment?</h3>
      <p class="${theme.bodyTextClass} mb-6">Are you sure you want to reset all your answers? This cannot be undone.</p>
      <div class="flex gap-3">
        <button onclick="document.getElementById('${id}-reset-modal').classList.add('hidden')" class="flex-1 ${theme.buttonBgClass} ${theme.buttonHoverClass} ${theme.buttonTextClass} font-bold py-2 rounded">Cancel</button>
        <button onclick="${id}_confirmReset()" class="flex-1 bg-rose-600 hover:bg-rose-500 text-white font-bold py-2 rounded">Reset</button>
      </div>
    </div>
  </div>
`;

const buildPrintStylesHtml = `
  <style>
    @media print {
      body { background: white !important; }
      .no-print { display: none !important; }
      .print-title { color: black !important; font-size: 24pt; text-align: center; border-bottom: 3px solid black; padding-bottom: 10px; margin-bottom: 20px; }
      .print-header { background: white !important; border: 2px solid black !important; margin-bottom: 20px; }
      .print-header label { color: black !important; }
      .print-header input { border: none !important; border-bottom: 1px solid black !important; background: white !important; color: black !important; }
      .print-section { page-break-inside: avoid; background: white !important; border: 1px solid #ccc !important; margin-bottom: 20px; }
      .print-question { color: black !important; border-bottom: 2px solid #666; padding-bottom: 5px; }
      .print-response { background: white !important; color: black !important; border: 1px solid #999 !important; min-height: 200px; font-family: Arial, sans-serif; }
    }
  </style>
`;

const buildPrintModeHtml = ({ id, title, theme, instructions }) => `
  <div id="${id}" class="w-full h-full custom-scroll p-8">
    <div class="max-w-4xl mx-auto">
      <header class="mb-8">
        <h1 class="text-3xl font-black ${theme.headingTextClass} italic mb-2">${escapeHtml(title)}</h1>
        <p class="text-sm ${theme.secondaryTextClass}">${buildHeaderSubtitle('print')}</p>
      </header>
      <div class="p-8 ${theme.cardBgClass} rounded-xl border ${theme.cardBorderClass}">
        <h3 class="text-lg font-bold ${theme.headingTextClass} mb-4">Instructions:</h3>
        <ol class="list-decimal list-inside space-y-2 ${theme.bodyTextClass} mb-8">
          ${instructions || DEFAULT_PRINT_INSTRUCTIONS}
        </ol>
        <div class="border-t ${theme.cardBorderClass} pt-6 space-y-4">
          <div><span class="font-bold ${theme.headingTextClass}">Student Name:</span> <span class="inline-block border-b ${theme.cardBorderClass} w-64 ml-2"></span></div>
          <div><span class="font-bold ${theme.headingTextClass}">Date:</span> <span class="inline-block border-b ${theme.cardBorderClass} w-48 ml-2"></span></div>
          <div><span class="font-bold ${theme.headingTextClass}">Assignment:</span> <span class="text-${theme.accentColor}-400">${escapeHtml(title)}</span></div>
        </div>
      </div>
      <div class="mt-6 flex gap-4">
        <button type="button" onclick="window.print()" class="${theme.buttonBgClass} ${theme.buttonHoverClass} ${theme.buttonTextClass} font-bold py-3 px-8 rounded-lg">Print & Submit</button>
      </div>
      <div class="mt-4 p-4 bg-amber-900/20 border border-amber-500/30 rounded-lg">
        <p class="text-amber-300 text-sm"><strong>Reminder:</strong> Print this page, complete the assignment, and submit to your instructor.</p>
      </div>
    </div>
  </div>
`;

const buildSharedScript = ({ id, title, backupBase, hasLongAnswer }) => {
  const titleJs = escapeJsSingle(title);
  const backupBaseJs = escapeJsSingle(backupBase);

  return `
  var ${id}_title = '${titleJs}';
  var ${id}_backupBase = '${backupBaseJs}';

  function ${id}_reset() {
    var modal = document.getElementById('${id}-reset-modal');
    if (modal) modal.classList.remove('hidden');
  }

  function ${id}_confirmReset() {
    var modal = document.getElementById('${id}-reset-modal');
    if (modal) modal.classList.add('hidden');
    var form = document.getElementById('${id}-form');
    if (form) form.reset();

    if (${hasLongAnswer ? 'true' : 'false'}) {
      try {
        localStorage.removeItem('${id}-student-name');
        localStorage.removeItem('${id}-student-date');
        var container = document.getElementById('${id}');
        if (container) {
          container.querySelectorAll('textarea, input').forEach(function(el) {
            if (el.id) localStorage.removeItem(el.id);
          });
        }
      } catch (e) {}
    }
  }

  function ${id}_generateReport() {
    var container = document.getElementById('${id}');
    if (!container) { alert('Assessment not found'); return; }

    var studentName = document.getElementById('${id}-student-name')?.value || 'Not Provided';
    var studentDate = document.getElementById('${id}-student-date')?.value || new Date().toLocaleDateString();

    var questionsHTML = '';
    var questions = container.querySelectorAll('[class*="print-section"], [class*="mb-8 p-6"]');
    var qNum = 1;

    questions.forEach(function(q) {
      var questionText = q.querySelector('h3')?.textContent || ('Question ' + qNum);
      var textarea = q.querySelector('textarea');
      var answer = textarea ? textarea.value : '';

      var selectedRadio = q.querySelector('input[type="radio"]:checked');
      if (selectedRadio) {
        var label = selectedRadio.closest('label');
        answer = label ? label.textContent.trim() : ('Selected: Option ' + (parseInt(selectedRadio.value, 10) + 1));
      }

      if (questionText.trim()) {
        questionsHTML += '<div style="margin-bottom:25px; border-left:4px solid #333; padding-left:15px;">'
          + '<h3 style="font-size:14px; font-weight:bold; margin-bottom:10px; color:#333;">' + questionText + '</h3>'
          + '<div style="background:#f9f9f9; padding:15px; border-radius:8px; border:1px solid #ddd; min-height:60px; white-space:pre-wrap; font-size:13px;">'
          + (answer || '<em style="color:#999;">No answer provided</em>')
          + '</div></div>';
        qNum += 1;
      }
    });

    var printHTML = '<!DOCTYPE html><html><head><title>' + ${id}_title + ' - Submission</title>'
      + '<style>'
      + 'body { font-family: Arial, sans-serif; padding: 40px; color: #333; background: white; line-height: 1.5; max-width: 800px; margin: 0 auto; }'
      + '.header { border-bottom: 4px solid #333; padding-bottom: 15px; margin-bottom: 25px; }'
      + '.header h1 { font-size: 24px; font-weight: 900; text-transform: uppercase; font-style: italic; margin: 0; }'
      + '.student-info { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 30px; padding: 20px; background: #f5f5f5; border-radius: 8px; }'
      + '.student-info div { font-size: 14px; }'
      + '.student-info strong { display: block; font-size: 11px; text-transform: uppercase; color: #666; margin-bottom: 4px; }'
      + '</style></head><body>'
      + '<div class="header"><h1>' + ${id}_title + '</h1><p style="font-size:11px; text-transform:uppercase; letter-spacing:2px; color:#666; margin-top:5px;">Assessment Submission</p></div>'
      + '<div class="student-info"><div><strong>Student Name</strong>' + studentName + '</div><div><strong>Date</strong>' + studentDate + '</div></div>'
      + '<div class="questions">' + questionsHTML + '</div>'
      + '<div style="margin-top:40px; border-top:2px solid #333; padding-top:20px; text-align:center;"><p style="font-size:10px; text-transform:uppercase; letter-spacing:2px; color:#999;">End of Submission</p></div>'
      + '<script>window.onload = function() { setTimeout(function() { window.print(); }, 500); }<\\/script>'
      + '</body></html>';

    var pw = window.open('', '_blank');
    if (pw) {
      pw.document.open();
      pw.document.write(printHTML);
      pw.document.close();
    } else {
      alert('Please allow popups to print.');
    }
  }

  ${hasLongAnswer ? `
  window.addEventListener('load', function() {
    ${id}_loadFromLocalStorage();
  });

  function ${id}_setupAutoSave() {
    var nameField = document.getElementById('${id}-student-name');
    var dateField = document.getElementById('${id}-student-date');
    if (nameField) {
      nameField.addEventListener('input', function() {
        localStorage.setItem('${id}-student-name', this.value);
      });
    }
    if (dateField) {
      dateField.addEventListener('input', function() {
        localStorage.setItem('${id}-student-date', this.value);
      });
    }

    var textareas = document.querySelectorAll('#${id} textarea[id^="${id}-answer-"]');
    textareas.forEach(function(textarea) {
      textarea.addEventListener('input', function() {
        if (textarea.id) {
          localStorage.setItem(textarea.id, textarea.value);
        }
      });
    });
  }

  function ${id}_loadFromLocalStorage() {
    var nameField = document.getElementById('${id}-student-name');
    var dateField = document.getElementById('${id}-student-date');

    if (nameField) {
      var savedName = localStorage.getItem('${id}-student-name');
      if (savedName) nameField.value = savedName;
    }
    if (dateField) {
      var savedDate = localStorage.getItem('${id}-student-date');
      if (savedDate) dateField.value = savedDate;
    }

    var textareas = document.querySelectorAll('#${id} textarea[id^="${id}-answer-"]');
    textareas.forEach(function(textarea) {
      if (!textarea.id) return;
      var savedValue = localStorage.getItem(textarea.id);
      if (savedValue) textarea.value = savedValue;
    });

    ${id}_setupAutoSave();
  }

  function ${id}_download() {
    var payload = {
      studentName: document.getElementById('${id}-student-name')?.value || '',
      studentDate: document.getElementById('${id}-student-date')?.value || '',
      answers: [],
    };

    var textareas = document.querySelectorAll('#${id} textarea[id^="${id}-answer-"]');
    textareas.forEach(function(textarea) {
      payload.answers.push(textarea?.value || '');
    });

    var blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = ${id}_backupBase + '_backup.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  function ${id}_loadBackup(input) {
    var file = input.files?.[0];
    if (!file) return;

    var reader = new FileReader();
    reader.onload = function(e) {
      try {
        var data = JSON.parse(e.target?.result || '{}');

        var nameField = document.getElementById('${id}-student-name');
        var dateField = document.getElementById('${id}-student-date');

        if (nameField && data.studentName) {
          nameField.value = data.studentName;
          localStorage.setItem('${id}-student-name', data.studentName);
        }
        if (dateField && data.studentDate) {
          dateField.value = data.studentDate;
          localStorage.setItem('${id}-student-date', data.studentDate);
        }

        if (Array.isArray(data.answers)) {
          data.answers.forEach(function(answer, index) {
            var textarea = document.getElementById('${id}-answer-' + index);
            if (textarea) {
              textarea.value = answer || '';
              localStorage.setItem('${id}-answer-' + index, answer || '');
            }
          });
        }

        var loadedDiv = document.getElementById('${id}-loaded');
        if (loadedDiv) {
          loadedDiv.classList.remove('hidden');
          setTimeout(function() { loadedDiv.classList.add('hidden'); }, 3000);
        }
      } catch (err) {
        alert('Error loading backup file.');
      }
    };
    reader.readAsText(file);
  }
  ` : ''}
`;
};

const buildAssessmentPage = ({
  id,
  title,
  mode,
  questions,
  theme,
  printInstructions,
}) => {
  if (mode === 'print') {
    return {
      html: buildPrintModeHtml({ id, title, theme, instructions: printInstructions }),
      script: `console.log('Print & Submit assessment loaded: ${escapeJsSingle(title)}');`,
      mcCount: 0,
      laCount: 0,
      questionCount: 0,
    };
  }

  const { html: questionBlocksHtml, longAnswerCount } = buildQuestionBlocks({
    id,
    questions,
    theme,
  });
  const mcCount = questions.filter((question) => question.type === 'multiple-choice').length;
  const laCount = longAnswerCount;
  const questionCount = questions.length;
  const includeLongAnswerActions = laCount > 0;

  const html = `
    <div id="${id}" class="w-full h-full custom-scroll p-8">
      <div class="max-w-4xl mx-auto">
        <header class="mb-8">
          <h1 class="text-3xl font-black ${theme.headingTextClass} italic mb-2${mode !== 'quiz' ? ' print-title' : ''}">${escapeHtml(title)}</h1>
          <p class="text-sm ${theme.secondaryTextClass}${mode !== 'quiz' ? ' no-print' : ''}">${buildHeaderSubtitle(mode, mcCount, laCount)}</p>
        </header>

        ${buildStudentInfoHtml(id, mode, theme)}

        <form id="${id}-form" class="space-y-6">
          ${questionBlocksHtml}
        </form>

        ${buildActionButtonsHtml({
          id,
          theme,
          includeLongAnswerActions,
        })}

        ${includeLongAnswerActions ? `
          <input type="file" id="${id}-upload" accept=".json" style="display: none;" onchange="${id}_loadBackup(this)" />
          <div id="${id}-loaded" class="hidden mt-6 p-4 rounded-xl bg-blue-900/20 border border-blue-500">
            <p class="text-blue-400 font-bold">Backup loaded successfully!</p>
          </div>
        ` : ''}

        ${buildResetModalHtml(id, theme)}

        ${mode !== 'quiz' ? `
          <div class="mt-8 p-4 bg-amber-900/20 border border-amber-500/30 rounded-lg no-print">
            <p class="text-amber-300 text-sm">
              <strong>Instructions:</strong> Complete all questions, then click "Print & Submit" to generate a clean printable report.
            </p>
          </div>
          ${buildPrintStylesHtml}
        ` : ''}
      </div>
    </div>
  `;

  const script = buildSharedScript({
    id,
    title,
    backupBase: toFilenameBase(title),
    hasLongAnswer: includeLongAnswerActions,
  });

  return {
    html,
    script,
    questionCount,
    mcCount,
    laCount,
  };
};

export const renderAssessment = (rawInput = {}, options = {}) => {
  const mode = normalizeMode(rawInput.type);
  const title = asString(rawInput.title) || 'Untitled Assessment';
  const id = normalizeIdentifier(asString(rawInput.id) || makeAssessmentId(mode, options.idSeed));

  const sourceQuestions = Array.isArray(rawInput.questions) ? rawInput.questions : [];
  const questions = sourceQuestions.map((question, index) => normalizeQuestion(question, index, mode));

  const page = buildAssessmentPage({
    id,
    title,
    mode,
    questions,
    theme: resolveTheme(options.courseSettings || {}),
    printInstructions: rawInput.printInstructions,
  });

  return {
    id,
    title,
    type: mode,
    questionCount: page.questionCount,
    mcCount: page.mcCount,
    laCount: page.laCount,
    html: page.html,
    script: page.script,
  };
};
