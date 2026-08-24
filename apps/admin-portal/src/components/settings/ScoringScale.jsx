'use client';

import React, { useState } from 'react';
import CardWrapper from '@/components/Common/CardWrapper';
import SectionTitle from '@/components/Common/SectionTitle';
import { BarChart3 } from '@/components/icons';

export default function ScoringScale() {
  const [minScore, setMinScore] = useState(1);
  const [maxScore, setMaxScore] = useState(5);

  return (
    <CardWrapper className="bg-white border border-[#E2E8F0] p-4 rounded-md">
      <SectionTitle
        title="Scoring Scale"
        icon={<BarChart3 size={18} fill="none" className="stroke-[#1E40AF]" />}
      />

      <div className="mt-3">
        <div className="grid grid-cols-2 gap-3 mb-3">
          {/* Minimum Input Controller Field */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider">Minimum Score</label>
            <input
              type="number"
              value={minScore}
              onChange={(e) => setMinScore(Number(e.target.value))}
              className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-md px-3 py-1.5 text-xs font-semibold text-slate-900 focus:border-[#1E40AF] focus:bg-white outline-none transition-colors w-full"
            />
          </div>
          
          {/* Maximum Input Controller Field */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider">Maximum Score</label>
            <input
              type="number"
              value={maxScore}
              onChange={(e) => setMaxScore(Number(e.target.value))}
              className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-md px-3 py-1.5 text-xs font-semibold text-slate-900 focus:border-[#1E40AF] focus:bg-white outline-none transition-colors w-full"
            />
          </div>
        </div>
        
        <div className="text-center text-xs text-slate-500 mt-2 border-t border-[#E2E8F0] pt-2.5">
          Standard rubric scale: <span className="text-[#1E40AF] font-semibold">{minScore} (Deficient)</span> to <span className="text-emerald-600 font-semibold">{maxScore} (Expert)</span>
        </div>
      </div>
    </CardWrapper>
  );
}