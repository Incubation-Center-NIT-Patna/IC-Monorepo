"use client";

import { RotateCcw, Save } from "lucide-react";

export default function ConfigurationActions({ onSave, onReset }) {
  return (
    <div className="w-full max-w-2xl mx-auto mt-10 flex flex-col text-sm min-[768px]:flex-row gap-4 items-center min-[768px]:items-start min-[768px]:justify-between">
      <button
        type="button"
        onClick={onSave}
        className="w-full max-w-lg  rounded-xl cursor-pointer bg-[#4FDBC8] py-3 font-semibold text-slate-950 transition hover:bg-[#4FDBC8]/80"
      >
        <span className="flex items-center justify-center gap-2">
          <Save size={18} />
          Save Configuration
        </span>
      </button>

      <button
        type="button"
        onClick={onReset}
        className="w-full max-w-lg rounded-xl cursor-pointer border border-[#3C4947] py-3 text-slate-200 transition hover:border-white/25 hover:bg-white/5"
      >
        <span className="flex items-center justify-center gap-2">
          <RotateCcw size={18} />
          Reset to Default
        </span>
      </button>
    </div>
  );
}