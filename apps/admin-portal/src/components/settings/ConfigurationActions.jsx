"use client";

import { RotateCcw, Save } from '@/components/icons';

export default function ConfigurationActions({ onSave, onReset }) {
  return (
    <div className="w-full max-w-2xl mx-auto mt-6 flex flex-col text-xs sm:flex-row gap-3 items-center sm:justify-between">
      <button
        type="button"
        onClick={onSave}
        className="w-full sm:flex-1 rounded-md cursor-pointer bg-[#1E40AF] hover:bg-[#1E3A8A] py-2 px-4 font-semibold text-white transition-colors shadow-xs"
      >
        <span className="flex items-center justify-center gap-2">
          <Save size={15} />
          Save Configuration
        </span>
      </button>

      <button
        type="button"
        onClick={onReset}
        className="w-full sm:flex-1 rounded-md cursor-pointer border border-[#E2E8F0] bg-white py-2 px-4 font-semibold text-slate-700 transition-colors hover:bg-slate-50"
      >
        <span className="flex items-center justify-center gap-2">
          <RotateCcw size={15} />
          Reset to Default
        </span>
      </button>
    </div>
  );
}