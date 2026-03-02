import * as React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export default function ComposerInspectorSection({
  children,
  defaultOpen = false,
  description = '',
  title = 'Section',
}) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);

  return (
    <div className="rounded-xl border border-slate-800/80 bg-slate-950/45 backdrop-blur-sm">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex w-full items-start justify-between gap-3 px-4 py-3 text-left"
      >
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-200">{title}</p>
          {description ? <p className="mt-1 text-[10px] leading-5 text-slate-500">{description}</p> : null}
        </div>
        <span className="mt-0.5 text-slate-400">{isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}</span>
      </button>
      {isOpen ? <div className="border-t border-slate-800/80 px-4 py-4">{children}</div> : null}
    </div>
  );
}
