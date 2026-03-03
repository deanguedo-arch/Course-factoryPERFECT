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
    <div className="cf-composer-section">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="cf-composer-section-trigger"
      >
        <div>
          <p className="cf-composer-section-title">{title}</p>
          {description ? <p className="cf-composer-section-description">{description}</p> : null}
        </div>
        <span className="mt-0.5 text-slate-400">{isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}</span>
      </button>
      {isOpen ? <div className="cf-composer-section-body">{children}</div> : null}
    </div>
  );
}
