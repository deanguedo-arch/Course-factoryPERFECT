import * as React from 'react';
import { AlertTriangle, CheckCircle, Plus, Save, Trash2, X } from 'lucide-react';
import {
  QUESTION_TYPE_OPTIONS,
  convertQuestionDraftType,
  getQuestionDraftBlockingErrors,
  getQuestionTypeMeta,
} from '../../assessment/index.js';

const syncChoices = (draft, options) => ({
  ...draft,
  options,
  choices: [...options],
});

const AssessmentQuestionEditor = ({
  draft,
  onChange,
  onSubmit,
  onCancel = null,
  submitLabel = 'Save Question',
  submitClassName = 'cf-btn cf-btn-primary flex-1 py-2 font-bold',
}) => {
  const type = draft?.type || 'multiple-choice';
  const typeMeta = getQuestionTypeMeta(type);
  const blockingErrors = getQuestionDraftBlockingErrors(draft);
  const canSubmit = blockingErrors.length === 0;

  const setDraft = (nextDraft) => {
    onChange(nextDraft);
  };

  const switchType = (nextType) => {
    setDraft(convertQuestionDraftType(draft, nextType));
  };

  const updatePrompt = (value) => {
    setDraft({ ...draft, question: value, prompt: value });
  };

  const objectiveOptions = Array.isArray(draft?.options) && draft.options.length
    ? draft.options
    : Array.isArray(draft?.choices) && draft.choices.length
      ? draft.choices
      : ['', '', '', ''];

  const updateOption = (index, value) => {
    const nextOptions = [...objectiveOptions];
    nextOptions[index] = value;
    setDraft(syncChoices(draft, nextOptions));
  };

  const addOption = () => {
    setDraft(syncChoices(draft, [...objectiveOptions, '']));
  };

  const removeOption = (index) => {
    if (objectiveOptions.length <= 2) return;
    const nextOptions = objectiveOptions.filter((_, optionIndex) => optionIndex !== index);

    if (type === 'multi-select') {
      const nextCorrectIndices = (draft.correctIndices || [])
        .filter((entry) => entry !== index)
        .map((entry) => (entry > index ? entry - 1 : entry));
      setDraft({
        ...syncChoices(draft, nextOptions),
        correctIndices: nextCorrectIndices,
        correctIndex: nextCorrectIndices[0] ?? 0,
        correct: nextCorrectIndices[0] ?? 0,
      });
      return;
    }

    const currentCorrect = typeof draft.correct === 'number' ? draft.correct : 0;
    const nextCorrect = currentCorrect === index ? 0 : (currentCorrect > index ? currentCorrect - 1 : currentCorrect);
    setDraft({
      ...syncChoices(draft, nextOptions),
      correctIndex: nextCorrect,
      correct: nextCorrect,
    });
  };

  const toggleCorrectIndex = (index) => {
    if (type === 'multi-select') {
      const current = Array.isArray(draft.correctIndices) ? draft.correctIndices : [];
      const nextCorrectIndices = current.includes(index)
        ? current.filter((entry) => entry !== index)
        : [...current, index].sort((a, b) => a - b);
      setDraft({
        ...draft,
        correctIndices: nextCorrectIndices,
        correctIndex: nextCorrectIndices[0] ?? 0,
        correct: nextCorrectIndices[0] ?? 0,
      });
      return;
    }

    setDraft({ ...draft, correctIndex: index, correct: index });
  };

  const acceptedAnswers = Array.isArray(draft?.acceptedAnswers) && draft.acceptedAnswers.length
    ? draft.acceptedAnswers
    : [''];

  const updateAcceptedAnswer = (index, value) => {
    const nextAnswers = [...acceptedAnswers];
    nextAnswers[index] = value;
    setDraft({ ...draft, acceptedAnswers: nextAnswers });
  };

  const addAcceptedAnswer = () => {
    setDraft({ ...draft, acceptedAnswers: [...acceptedAnswers, ''] });
  };

  const removeAcceptedAnswer = (index) => {
    if (acceptedAnswers.length <= 1) {
      setDraft({ ...draft, acceptedAnswers: [''] });
      return;
    }
    setDraft({ ...draft, acceptedAnswers: acceptedAnswers.filter((_, answerIndex) => answerIndex !== index) });
  };

  const pairs = Array.isArray(draft?.pairs) && draft.pairs.length
    ? draft.pairs
    : [{ left: '', right: '' }, { left: '', right: '' }];

  const updatePair = (index, key, value) => {
    const nextPairs = pairs.map((pair, pairIndex) => (
      pairIndex === index ? { ...pair, [key]: value } : pair
    ));
    setDraft({ ...draft, pairs: nextPairs });
  };

  const addPair = () => {
    setDraft({ ...draft, pairs: [...pairs, { left: '', right: '' }] });
  };

  const removePair = (index) => {
    if (pairs.length <= 2) return;
    setDraft({ ...draft, pairs: pairs.filter((_, pairIndex) => pairIndex !== index) });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!canSubmit || typeof onSubmit !== 'function') return;
    onSubmit(draft);
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="grid gap-2 md:grid-cols-3">
        {QUESTION_TYPE_OPTIONS.map((option) => {
          const optionMeta = getQuestionTypeMeta(option.value);
          const isActive = option.value === type;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => switchType(option.value)}
              className={`rounded-xl border px-3 py-3 text-left transition-colors ${
                isActive
                  ? 'border-purple-400/40 bg-slate-950/70 text-white'
                  : 'border-slate-800 bg-slate-950/30 text-slate-400 hover:border-slate-700 hover:text-white'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-black uppercase tracking-[0.16em]">{optionMeta.shortLabel}</span>
                {isActive ? <CheckCircle size={14} className="text-purple-300" /> : null}
              </div>
              <p className="mt-2 text-sm font-semibold">{option.label}</p>
            </button>
          );
        })}
      </div>

      <div className="cf-panel-muted space-y-4 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Question Type</p>
            <h4 className="mt-1 text-sm font-bold text-white">{typeMeta.label}</h4>
          </div>
          <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] ${
            typeMeta.tone === 'blue' ? 'bg-blue-500/20 text-blue-300' :
            typeMeta.tone === 'indigo' ? 'bg-indigo-500/20 text-indigo-300' :
            typeMeta.tone === 'violet' ? 'bg-violet-500/20 text-violet-300' :
            typeMeta.tone === 'cyan' ? 'bg-cyan-500/20 text-cyan-300' :
            typeMeta.tone === 'amber' ? 'bg-amber-500/20 text-amber-300' :
            'bg-emerald-500/20 text-emerald-300'
          }`}>
            {typeMeta.shortLabel}
          </span>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase mb-2">
            Question / Prompt
          </label>
          <textarea
            value={draft?.question || ''}
            onChange={(event) => updatePrompt(event.target.value)}
            placeholder="Enter the question or prompt..."
            className="cf-input-shell h-24 text-sm"
          />
        </div>

        {(type === 'multiple-choice' || type === 'multi-select') && (
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <label className="block text-xs font-bold text-slate-400 uppercase">
                Answer Options
              </label>
              <button
                type="button"
                onClick={addOption}
                className="text-[11px] font-bold uppercase tracking-[0.16em] text-sky-300 transition-colors hover:text-sky-200"
              >
                <Plus size={12} className="inline mr-1" /> Add Option
              </button>
            </div>
            <div className="space-y-2">
              {objectiveOptions.map((option, index) => (
                <div key={`${type}-option-${index}`} className="flex items-center gap-2">
                  <input
                    type={type === 'multi-select' ? 'checkbox' : 'radio'}
                    name={type === 'multi-select' ? `multi-${draft?.id || 'new'}-${index}` : `correct-${draft?.id || 'new'}`}
                    checked={type === 'multi-select'
                      ? (draft.correctIndices || []).includes(index)
                      : (draft.correct ?? draft.correctIndex ?? 0) === index}
                    onChange={() => toggleCorrectIndex(index)}
                    className="h-4 w-4"
                  />
                  <input
                    type="text"
                    value={option}
                    onChange={(event) => updateOption(index, event.target.value)}
                    placeholder={`Option ${index + 1}`}
                    className="cf-input-shell flex-1 text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => removeOption(index)}
                    disabled={objectiveOptions.length <= 2}
                    className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-rose-500/10 hover:text-rose-300 disabled:cursor-not-allowed disabled:opacity-30"
                    title="Remove option"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-slate-500 italic">
              {type === 'multi-select'
                ? 'Check every correct answer. Wrong selections are not penalized in v1 grading.'
                : 'Select the one correct answer using the radio button.'}
            </p>
          </div>
        )}

        {type === 'true-false' && (
          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-400 uppercase">
              Correct Answer
            </label>
            <div className="grid gap-2 sm:grid-cols-2">
              {['True', 'False'].map((label, index) => {
                const isActive = (draft.correct ?? draft.correctIndex ?? 0) === index;
                return (
                  <button
                    key={label}
                    type="button"
                    onClick={() => toggleCorrectIndex(index)}
                    className={`rounded-xl border px-4 py-3 text-sm font-bold transition-colors ${
                      isActive
                        ? 'border-indigo-400/40 bg-indigo-500/10 text-white'
                        : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700 hover:text-white'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {type === 'short-answer' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <label className="block text-xs font-bold text-slate-400 uppercase">
                Accepted Answers
              </label>
              <button
                type="button"
                onClick={addAcceptedAnswer}
                className="text-[11px] font-bold uppercase tracking-[0.16em] text-cyan-300 transition-colors hover:text-cyan-200"
              >
                <Plus size={12} className="inline mr-1" /> Add Alias
              </button>
            </div>
            <div className="space-y-2">
              {acceptedAnswers.map((answer, index) => (
                <div key={`accepted-answer-${index}`} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={answer}
                    onChange={(event) => updateAcceptedAnswer(index, event.target.value)}
                    placeholder={index === 0 ? 'Primary accepted answer' : `Accepted answer ${index + 1}`}
                    className="cf-input-shell flex-1 text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => removeAcceptedAnswer(index)}
                    className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-rose-500/10 hover:text-rose-300"
                    title="Remove accepted answer"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
            <label className="inline-flex items-center gap-2 text-xs text-slate-300">
              <input
                type="checkbox"
                checked={Boolean(draft.caseSensitive)}
                onChange={(event) => setDraft({ ...draft, caseSensitive: event.target.checked })}
                className="h-4 w-4"
              />
              Case-sensitive answer matching
            </label>
            <p className="text-[10px] text-slate-500 italic">
              Leave aliases blank if this should stay manual-review first.
            </p>
          </div>
        )}

        {type === 'matching' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <label className="block text-xs font-bold text-slate-400 uppercase">
                Matching Pairs
              </label>
              <button
                type="button"
                onClick={addPair}
                className="text-[11px] font-bold uppercase tracking-[0.16em] text-amber-300 transition-colors hover:text-amber-200"
              >
                <Plus size={12} className="inline mr-1" /> Add Pair
              </button>
            </div>
            <div className="space-y-2">
              {pairs.map((pair, index) => (
                <div key={`matching-pair-${index}`} className="grid gap-2 rounded-xl border border-slate-800 bg-slate-950/40 p-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
                  <input
                    type="text"
                    value={pair.left}
                    onChange={(event) => updatePair(index, 'left', event.target.value)}
                    placeholder={`Left item ${index + 1}`}
                    className="cf-input-shell text-xs"
                  />
                  <input
                    type="text"
                    value={pair.right}
                    onChange={(event) => updatePair(index, 'right', event.target.value)}
                    placeholder={`Right match ${index + 1}`}
                    className="cf-input-shell text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => removePair(index)}
                    disabled={pairs.length <= 2}
                    className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-rose-500/10 hover:text-rose-300 disabled:cursor-not-allowed disabled:opacity-30"
                    title="Remove pair"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
            <label className="inline-flex items-center gap-2 text-xs text-slate-300">
              <input
                type="checkbox"
                checked={draft.shuffleRightSide !== false}
                onChange={(event) => setDraft({ ...draft, shuffleRightSide: event.target.checked })}
                className="h-4 w-4"
              />
              Shuffle right-side answers in the rendered assessment
            </label>
          </div>
        )}

        {type === 'long-answer' && (
          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-400 uppercase">
              Rubric Notes (Optional)
            </label>
            <textarea
              value={draft?.rubric || ''}
              onChange={(event) => setDraft({ ...draft, rubric: event.target.value })}
              placeholder="Optional grading notes or rubric guidance..."
              className="cf-input-shell h-24 text-sm"
            />
            <p className="text-[10px] text-slate-500 italic">
              Long-answer responses are manual-grade only.
            </p>
          </div>
        )}
      </div>

      {blockingErrors.length > 0 && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-xs text-amber-100">
          <div className="flex items-center gap-2 font-bold uppercase tracking-[0.16em]">
            <AlertTriangle size={14} />
            Ready Checks
          </div>
          <div className="mt-2 space-y-1">
            {blockingErrors.map((error) => (
              <p key={error}>- {error}</p>
            ))}
          </div>
        </div>
      )}

      {(onCancel || onSubmit) && (
        <div className="flex gap-3 pt-2">
          {onCancel ? (
            <button
              type="button"
              onClick={onCancel}
              className="cf-btn cf-btn-secondary flex-1 py-2 font-bold"
            >
              <X size={16} /> Cancel
            </button>
          ) : null}
          {onSubmit ? (
            <button
              type="submit"
              disabled={!canSubmit}
              className={`${submitClassName} disabled:opacity-50`}
            >
              <Save size={16} /> {submitLabel}
            </button>
          ) : null}
        </div>
      )}
    </form>
  );
};

export default AssessmentQuestionEditor;
