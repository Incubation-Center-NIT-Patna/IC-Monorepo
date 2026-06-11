"use client";

export default function ToggleSwitch({ enabled, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-label={label}
      aria-checked={enabled}
      onClick={() => onChange(!enabled)}
      className={`group relative inline-flex h-8 w-16 shrink-0 cursor-pointer items-center rounded-full border p-1 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#4FDBC8]/60 focus:ring-offset-2 focus:ring-offset-slate-950 ${
        enabled
          ? "border-[#4FDBC8]/60 bg-[#4FDBC8] shadow-[0_0_20px_rgba(79,219,200,0.35)]"
          : "border-[#262B37] bg-[#1A1F2B]"
      }`}
    >
      <span
        className={`absolute text-[10px] font-bold uppercase tracking-wider transition ${
          enabled ? "left-2 text-slate-950" : "right-2 text-slate-300"
        }`}
      >
        {enabled ? "On" : "Off"}
      </span>

      <span
        className={`relative z-10 h-6 w-6 rounded-full bg-white shadow-md transition-transform duration-300 ${
          enabled ? "translate-x-8" : "translate-x-0"
        }`}
      />
    </button>
  );
}
