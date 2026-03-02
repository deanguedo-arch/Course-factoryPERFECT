import * as React from 'react';

const Section = ({ title, icon: Icon, isActive, onClick, badge, badgeColor, collapsed = false }) => (
  <button
    onClick={onClick}
    title={title}
    aria-label={title}
    className={`relative w-full flex items-center ${collapsed ? 'justify-center px-0 py-2.5' : 'justify-between gap-2 px-3 py-2'} rounded-lg text-sm font-bold transition-all ${
      isActive
        ? 'bg-blue-600 text-white shadow-lg'
        : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
    }`}
  >
    <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-2 min-w-0'}`}>
      <Icon size={16} />
      {!collapsed ? <span>{title}</span> : null}
    </div>
    {badge !== undefined && (
      collapsed ? (
        <span className={`absolute right-1.5 top-1.5 ${badgeColor || 'bg-slate-700'} text-white text-[9px] font-bold min-w-[18px] px-1.5 py-0.5 rounded-full`}>
          {badge}
        </span>
      ) : (
        <span className={`${badgeColor || 'bg-slate-700'} text-white text-[10px] font-bold px-2 py-0.5 rounded-full`}>
          {badge}
        </span>
      )
    )}
  </button>
);

export default Section;
