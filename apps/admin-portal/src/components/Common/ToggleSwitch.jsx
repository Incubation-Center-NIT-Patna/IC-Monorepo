"use client";

export default function ToggleSwitch({ enabled, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-label={label}
      aria-checked={enabled}
      onClick={() => onChange(!enabled)}
      className={`group relative inline-flex h-7 w-14 shrink-0 cursor-pointer items-center rounded-full border p-0.5 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#1F3BB3]/40 ${
        enabled
          ? "border-[#1F3BB3] bg-[#1F3BB3] shadow-xs"
          : "border-gray-300 bg-gray-200"
      }`}
    >
      <span
        className={`absolute text-[9px] font-extrabold uppercase tracking-wider transition ${
          enabled ? "left-1.5 text-white" : "right-1.5 text-gray-500"
        }`}
      >
        {enabled ? "On" : "Off"}
      </span>

      <span
        className={`relative z-10 h-5.5 w-5.5 rounded-full bg-white shadow-sm transition-transform duration-300 ${
          enabled ? "translate-x-7" : "translate-x-0"
        }`}
      />
    </button>
  );
}
