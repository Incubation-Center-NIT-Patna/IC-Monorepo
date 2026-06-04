'use client';

import React from 'react';
import EvaluationParameters from '@/components/admin/settings/EvaluationParameters';
import ScoringScale from '@/components/admin/settings/ScoringScale';

export default function AdminSettings() {
  return (
    <div className="w-full text-gray-100 selection:bg-[#10B981]/20">
      <div className="space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">Admin Settings</h1>
          <p className="mt-1 text-xs sm:text-sm text-gray-400">
            Configure the technical induction framework and evaluation logic.
          </p>
        </div>

        <div className="w-full space-y-5">
          <EvaluationParameters />
          <ScoringScale />
        </div>

        <hr className="border-gray-800/60 w-full" />
        
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <button className="w-full py-2.5 rounded-lg bg-[#10B981] hover:bg-[#059669] text-white text-sm font-semibold transition-colors">
            Save Configuration
          </button>
          <button className="w-full py-2.5 rounded-lg bg-transparent border border-gray-600 hover:bg-gray-800 text-gray-300 text-sm font-medium transition-colors">
            Reset to Default
          </button>
        </div>
      </div>
    </div>
  );
}