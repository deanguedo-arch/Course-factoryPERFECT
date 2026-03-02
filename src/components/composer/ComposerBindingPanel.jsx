import * as React from 'react';
import {
  collectComposerBindableDataFields,
  COMPOSER_BINDING_OPTIONS,
  getComposerBindingToken,
  getComposerBindingValue,
} from '../../composer/bindings.js';

export default function ComposerBindingPanel({
  activity = null,
  bindingContext = {},
  onApplyBinding,
}) {
  const fields = React.useMemo(() => collectComposerBindableDataFields(activity), [activity]);
  const [fieldPath, setFieldPath] = React.useState('');
  const [bindingKey, setBindingKey] = React.useState(COMPOSER_BINDING_OPTIONS[0]?.value || 'module.title');

  React.useEffect(() => {
    if (!fields.length) {
      setFieldPath('');
      return;
    }
    if (!fields.some((field) => field.path === fieldPath)) {
      setFieldPath(fields[0].path);
    }
  }, [fieldPath, fields]);

  if (!activity) return null;

  const selectedField = fields.find((field) => field.path === fieldPath) || fields[0] || null;

  return (
    <div className="mb-3 rounded-lg border border-cyan-500/30 bg-cyan-500/10 p-3 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wide text-cyan-100">Smart Content</p>
          <p className="text-[10px] text-cyan-50/70">Bind a text field to course or module values. Preview and compiled output resolve the token.</p>
        </div>
        <span className="rounded bg-slate-950/70 px-2 py-1 text-[10px] font-mono text-cyan-100">
          {selectedField ? getComposerBindingToken(bindingKey) : 'No text fields'}
        </span>
      </div>

      {fields.length === 0 ? (
        <p className="text-[11px] text-cyan-50/70">No bindable text fields were detected on this block.</p>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <select
              value={fieldPath}
              onChange={(event) => setFieldPath(event.target.value)}
              className="rounded border border-slate-700 bg-slate-950 p-2 text-xs text-white"
            >
              {fields.map((field) => (
                <option key={field.path} value={field.path}>
                  {field.label}
                </option>
              ))}
            </select>

            <select
              value={bindingKey}
              onChange={(event) => setBindingKey(event.target.value)}
              className="rounded border border-slate-700 bg-slate-950 p-2 text-xs text-white"
            >
              {COMPOSER_BINDING_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <button
              type="button"
              disabled={!selectedField}
              onClick={() => selectedField && onApplyBinding?.(selectedField.path, bindingKey)}
              className="rounded bg-cyan-600 px-3 py-2 text-xs font-bold uppercase tracking-wide text-white hover:bg-cyan-500 disabled:opacity-40"
            >
              Apply Binding
            </button>
          </div>

          {selectedField ? (
            <div className="rounded border border-slate-700 bg-slate-950/70 p-2">
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{selectedField.label}</p>
              <p className="mt-1 text-[11px] text-slate-300 truncate">{selectedField.value || 'Empty value'}</p>
              <p className="mt-1 text-[10px] text-cyan-200">
                Resolves to: {getComposerBindingValue(bindingKey, bindingContext) || 'Empty'}
              </p>
            </div>
          ) : null}

          <div className="flex flex-wrap gap-2">
            {COMPOSER_BINDING_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  setBindingKey(option.value);
                  if (selectedField) onApplyBinding?.(selectedField.path, option.value);
                }}
                className="rounded border border-slate-700 bg-slate-950 px-2 py-1 text-[10px] font-mono text-cyan-100 hover:border-cyan-400"
                title={option.label}
              >
                {getComposerBindingToken(option.value)}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
