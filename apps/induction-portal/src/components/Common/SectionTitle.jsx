"use client";

export default function SectionTitle({ title, subtitle, icon, actionText, actionIcon, action, badge }) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <div>
        <h2 className="flex items-center gap-2 text-md font-bold text-[#E2E2EB]">
          {icon && <span className="inline-flex shrink-0">{icon}</span>}
          <span>{title}</span>
        </h2>

        {subtitle && <p className="mt-1 text-sm text-gray-400">{subtitle}</p>}
      </div>
      {badge && (
        <span className="inline-flex shrink-0 items-center rounded-full px-4 py-1 text-sm font-medium border bg-[#4FDBC8] text-[#00423B]">
          {badge}
        </span>
      )}
      {actionText && (
        <button
          onClick={action || undefined}
          className="flex items-center gap-2 cursor-pointer rounded-lg px-3 py-2 text-sm font-semibold text-[#4FDBC8] transition hover:bg-[#4FDBC8]/10"
        >
          {actionIcon && <span>{actionIcon}</span>}
          <span>{actionText}</span>
        </button>
      )}
    </div>
  );
}
