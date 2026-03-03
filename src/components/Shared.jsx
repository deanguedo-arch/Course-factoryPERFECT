import * as React from 'react';
import { Copy, Check, X, CheckCircle, AlertOctagon, AlertTriangle, ShieldCheck } from 'lucide-react';

const { useState } = React;

export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random();
    const toast = { id, message, type, duration };
    setToasts(prev => [...prev, toast]);
    
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
    
    return id;
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return { toasts, showToast, removeToast };
};

export const ToastContainer = ({ toasts, removeToast }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[9999] space-y-2 max-w-md">
      {toasts.map(toast => {
        const tones = {
          success: 'cf-alert cf-alert-success',
          error: 'cf-alert cf-alert-danger',
          warning: 'cf-alert cf-alert-warning',
          info: 'cf-alert cf-alert-info'
        };
        const icons = {
          success: CheckCircle,
          error: AlertOctagon,
          warning: AlertTriangle,
          info: ShieldCheck
        };
        const Icon = icons[toast.type] || ShieldCheck;

        return (
          <div
            key={toast.id}
            className={`${tones[toast.type] || tones.info} flex items-start gap-3 rounded-2xl p-4 animate-in slide-in-from-right fade-in duration-300`}
          >
            <Icon size={20} className="flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="flex-shrink-0 text-slate-400 transition-opacity hover:opacity-70"
            >
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export const CodeBlock = ({ label, code, height = "h-32" }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const textArea = document.createElement("textarea");
    textArea.value = typeof code === 'string' ? code : JSON.stringify(code, null, 2);
    textArea.style.position = "fixed";
    textArea.style.left = "-9999px";
    textArea.style.top = "0";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      const successful = document.execCommand('copy');
      if(successful) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {
      console.error('Copy failed', err);
    }
    
    document.body.removeChild(textArea);
  };

  return (
    <div className="cf-code-block mt-4 max-w-full min-w-0">
      <div className="cf-code-block-toolbar">
        <span className="cf-code-block-label">{label}</span>
        <button
          onClick={handleCopy}
          className="cf-code-block-copy"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? 'Copied!' : 'Copy code'}
        </button>
      </div>
      <pre className={`p-4 w-full max-w-full overflow-x-auto text-sm font-mono text-slate-300 leading-relaxed whitespace-pre-wrap break-all ${height}`}>
        {typeof code === 'string' ? code : JSON.stringify(code, null, 2)}
      </pre>
    </div>
  );
};

export const Toggle = ({ active, labelA, labelB, labelC, onToggle, iconA: IconA, iconB: IconB, iconC: IconC }) => (
    <div className="cf-tab-rail mb-6">
        <button 
            onClick={() => onToggle('A')}
            className={`cf-tab-btn flex-1 items-center justify-center gap-2 px-4 py-2 text-xs font-bold ${active === 'A' ? 'cf-tab-btn-active' : ''}`}
        >
            <IconA size={14} /> {labelA}
        </button>
        <button 
            onClick={() => onToggle('B')}
            className={`cf-tab-btn flex-1 items-center justify-center gap-2 px-4 py-2 text-xs font-bold ${active === 'B' ? 'cf-tab-btn-active' : ''}`}
        >
            <IconB size={14} /> {labelB}
        </button>
        {labelC && (
             <button 
                onClick={() => onToggle('C')}
                className={`cf-tab-btn flex-1 items-center justify-center gap-2 px-4 py-2 text-xs font-bold ${active === 'C' ? 'cf-tab-btn-active' : ''}`}
            >
                <IconC size={14} /> {labelC}
            </button>
        )}
    </div>
);
