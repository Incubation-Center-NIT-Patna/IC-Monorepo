'use client';

import React from 'react';
import EvaluationParameters from '@/components/admin/settings/EvaluationParameters';
import ScoringScale from '@/components/admin/settings/ScoringScale';

export default function AdminSettings() {
  return (
    <div className="w-full text-gray-100 py-4 selection:bg-[#10B981]/20 max-w-[1000px]">
     
      <div className="w-full">
        
        
        <div className="mb-8 px-1">
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Admin Settings</h1>
          <p className="mt-2 text-sm text-gray-400">
            Configure the technical induction framework and evaluation logic.
          </p>
        </div>

        
        <div className="w-full space-y-8">
          <EvaluationParameters />
          <ScoringScale />
        </div>

        
        <hr className="border-gray-800/60 my-6 w-full" />
        
      </div>
    </div>
  );
}