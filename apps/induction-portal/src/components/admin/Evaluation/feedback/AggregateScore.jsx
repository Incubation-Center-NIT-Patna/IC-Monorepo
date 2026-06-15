import React from 'react';

export default function AggregateScore() {
  return (
    <div className="w-full mt-6 mb-6 bg-gray-700 rounded-xl p-4 flex flex-col gap-3">
      
     
      <div className="flex items-center justify-between w-full">
        
      
        <div className="flex flex-col">
          <span className="text-[10px] text-teal-400 font-bold tracking-wider uppercase">
            AGGREGATE SCORE
          </span>
          <div className="flex items-baseline gap-0.5 mt-1">
            <span className="text-3xl font-extrabold text-white">3.8</span>
            <span className="text-xs text-gray-400">/5.0</span>
          </div>
        </div>

      
        <div className="flex flex-col items-end">
          <span className="text-[10px] text-gray-400 font-medium mb-1">
            Recommendation
          </span>
          <span className="px-3 py-1 bg-teal-500/10 text-teal-300 text-xs font-bold rounded-full border border-teal-500/20">
            Strong Hire
          </span>
        </div>

      </div>

   
      <div className="w-full bg-gray-800 h-1.5 rounded-full">
        <div className="bg-teal-400 h-full w-[76%] rounded-full" />
      </div>

    </div>
  );
}