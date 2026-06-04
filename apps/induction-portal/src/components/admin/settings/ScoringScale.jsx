'use client';

import React, { useState } from 'react';

export default function ScoringScale() {
  const [minScore, setMinScore] = useState(1);
  const [maxScore, setMaxScore] = useState(5);

  return (
    <section className="w-full">
      
      <div className="flex items-center gap-2 mb-3 px-1">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-4 h-4 text-[#10B981]">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.03 0 1.9.693 2.166 1.638m-7.377 0A48.536 48.536 0 0 1 12 3m0 0c-1.105 0-2.196-.02-3.28-.06A48.424 48.424 0 0 0 7.598 3.13m0 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5A.75.75 0 0 0 13.5 3.75c0-.23-.035-.454-.1-.664m-5.8 0A2.251 2.251 0 0 0 5.25 5.25v14.25C5.25 20.716 6.034 21.5 7 21.5h10a1 1 0 0 0 1-1v-1" />
        </svg>
        <h2 className="text-[15px] font-semibold text-white tracking-wide">Scoring Scale</h2>
      </div>

     
      <div className="bg-[#111C2A]/60 border border-[#1E293B] rounded-xl p-3 w-full">
        <div className="grid grid-cols-2 gap-3 mb-3">
          
          {/* Minimum Input Controller Field */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Minimum Score</label>
            <input
              type="number"
              value={minScore}
              onChange={(e) => setMinScore(Number(e.target.value))}
              className="bg-[#070D19] border border-gray-800 rounded-lg px-3 py-2 text-xs font-medium text-white focus:border-[#10B981] outline-none transition-all w-full"
            />
          </div>
          
          {/* Maximum Input Controller Field */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Maximum Score</label>
            <input
              type="number"
              value={maxScore}
              onChange={(e) => setMaxScore(Number(e.target.value))}
              className="bg-[#070D19] border border-gray-800 rounded-lg px-3 py-2 text-xs font-medium text-white focus:border-[#10B981] outline-none transition-all w-full"
            />
          </div>
        </div>
        
        
        <div className="text-center text-[11px] text-gray-400 mt-3 border-t border-gray-800/60 pt-2.5">
          Standard scale: <span className="text-white font-medium">{minScore} (Deficient)</span> to <span className="text-white font-medium">{maxScore} (Expert)</span>
        </div>
      </div>
    </section>
  );
}