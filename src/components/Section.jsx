import * as React from 'react';

const Section = ({ title, icon: Icon, isActive, onClick, badge, badgeColor, collapsed = false }) => (
  <button
    onClick={onClick}
    title={title}
    aria-label={title}
    className={`cf-nav-item relative flex w-full items-center rounded-xl ${collapsed ? 'justify-center px-0 py-2.5' : 'justify-between gap-2 px-3 py-2.5'} ${isActive ? 'cf-nav-item-active' : ''}`}
  >
    <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-2 min-w-0'}`}>
      <Icon size={16} />
      {!collapsed ? <span className="text-[13px] font-semibold">{title}</span> : null}
    </div>
    {badge !== undefined && (
      collapsed ? (
        <span className={`cf-nav-badge absolute right-1.5 top-1.5 min-w-[18px] rounded-full px-1.5 py-0.5 text-[9px] font-bold ${badgeColor || ''}`}>
          {badge}
        </span>
      ) : (
        <span className={`cf-nav-badge rounded-full px-2 py-0.5 text-[10px] font-bold ${badgeColor || ''}`}>
          {badge}
        </span>
      )
    )}
  </button>
);

export default Section;
