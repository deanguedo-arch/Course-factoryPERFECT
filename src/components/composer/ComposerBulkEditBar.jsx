import * as React from 'react';
import { CheckSquare, Copy, Trash2, X } from 'lucide-react';

const PADDING_OPTIONS = [
  { value: 'sm', label: 'Padding Sm' },
  { value: 'md', label: 'Padding Md' },
  { value: 'lg', label: 'Padding Lg' },
];

const VARIANT_OPTIONS = [
  { value: 'card', label: 'Surface Card' },
  { value: 'flat', label: 'Surface Flat' },
];

export default function ComposerBulkEditBar({
  arrangeActions = [],
  count = 0,
  onApplyBlockTheme,
  onApplyPadding,
  onApplyVariant,
  onClearSelection,
  onDelete,
  onDuplicate,
  onSelectAll,
  themeOptions = [],
}) {
  const [themeValue, setThemeValue] = React.useState('');
  const [paddingValue, setPaddingValue] = React.useState('');
  const [variantValue, setVariantValue] = React.useState('');

  if (count <= 1) return null;

  return (
    <div className="rounded-lg border border-indigo-500/40 bg-indigo-500/10 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <CheckSquare size={14} className="text-indigo-300" />
          <p className="text-xs font-bold text-indigo-100">{count} blocks selected</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onSelectAll}
            className="rounded border border-slate-700 bg-slate-950 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-200 hover:bg-slate-900"
          >
            All
          </button>
          <button
            type="button"
            onClick={onClearSelection}
            className="inline-flex items-center gap-1 rounded border border-slate-700 bg-slate-950 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-200 hover:bg-slate-900"
          >
            <X size={11} /> Clear
          </button>
          <button
            type="button"
            onClick={onDuplicate}
            className="inline-flex items-center gap-1 rounded bg-indigo-600 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-white hover:bg-indigo-500"
          >
            <Copy size={11} /> Duplicate
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="inline-flex items-center gap-1 rounded bg-rose-600 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-white hover:bg-rose-500"
          >
            <Trash2 size={11} /> Delete
          </button>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
        <select
          value={themeValue}
          onChange={(event) => {
            const nextValue = event.target.value;
            setThemeValue(nextValue);
            if (nextValue) {
              onApplyBlockTheme?.(nextValue);
              setThemeValue('');
            }
          }}
          className="rounded border border-slate-700 bg-slate-950 p-2 text-xs text-white"
        >
          <option value="">Apply Block Theme</option>
          {themeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <select
          value={paddingValue}
          onChange={(event) => {
            const nextValue = event.target.value;
            setPaddingValue(nextValue);
            if (nextValue) {
              onApplyPadding?.(nextValue);
              setPaddingValue('');
            }
          }}
          className="rounded border border-slate-700 bg-slate-950 p-2 text-xs text-white"
        >
          <option value="">Apply Padding</option>
          {PADDING_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <select
          value={variantValue}
          onChange={(event) => {
            const nextValue = event.target.value;
            setVariantValue(nextValue);
            if (nextValue) {
              onApplyVariant?.(nextValue);
              setVariantValue('');
            }
          }}
          className="rounded border border-slate-700 bg-slate-950 p-2 text-xs text-white"
        >
          <option value="">Apply Surface</option>
          {VARIANT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {arrangeActions.length > 0 ? (
        <div className="mt-3 border-t border-indigo-500/20 pt-3">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-wide text-indigo-100">Arrange Selection</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {arrangeActions.map((action) => (
              <button
                key={action.id}
                type="button"
                onClick={action.onClick}
                className="rounded border border-slate-700 bg-slate-950 px-2 py-1.5 text-[10px] font-bold uppercase tracking-wide text-slate-200 hover:bg-slate-900"
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
