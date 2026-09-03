"use client";

export default function SectionTitle({ title, subtitle, icon, actionText, actionIcon, action, badge }) {
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
      <div>
        <h2 className="flex items-center gap-2 text-base font-bold text-[#0F172A]">
          {icon && <span className="inline-flex shrink-0 text-[#1E40AF]">{icon}</span>}
          <span>{title}</span>
        </h2>

        {subtitle && <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>}
      </div>
      {badge && (
        <span className="inline-flex shrink-0 items-center rounded-sm px-2 py-0.5 text-[11px] font-medium bg-blue-50 text-[#1E40AF] border border-blue-200">
          {badge}
        </span>
      )}
      {actionText && (
        <button
          onClick={action || undefined}
          className="flex items-center gap-1.5 cursor-pointer rounded-md border border-[#E2E8F0] bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-[#1E40AF] hover:bg-slate-50 transition-colors shadow-2xs"
        >
          {actionIcon && <span>{actionIcon}</span>}
          <span>{actionText}</span>
        </button>
      )}
    </div>
  );
}
