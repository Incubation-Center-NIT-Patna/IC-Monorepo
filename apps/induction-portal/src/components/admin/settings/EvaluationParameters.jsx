'use client';

import React, { useState } from 'react';
import EvaluationRow from '@/components/admin/settings/EvaluationRow'; 
import { DEFAULT_EVALUATION_PARAMETERS } from '@/components/admin/settings/evaluationData';

export default function EvaluationParameters() {
  const [parameters, setParameters] = useState(DEFAULT_EVALUATION_PARAMETERS);

  const handleAddParameter = () => {
    setParameters([...parameters, { id: crypto.randomUUID(), name: 'New Parameter', weight: 0 }]);
  };

  const handleDeleteParameter = (idToFilter) => {
    setParameters(parameters.filter((p) => { return p.id !== idToFilter }));
  };

  const handleUpdateParameter = (id, key, val) => {
    setParameters(parameters.map((p) => { return p.id === id ? { ...p, [key]: val } : p }));
  };

  return (
    <section className="mb-8 w-full">
      {/* Section Sub-Header Row */}
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5 h-5 text-[#10B981]">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25A2.25 2.25 0 0 1 13.5 8.25V6Z" />
          </svg>
          <h2 className="text-lg font-semibold text-white tracking-wide">Evaluation Parameters</h2>
        </div>
        
        <button 
          type="button" 
          onClick={handleAddParameter} 
          className="text-sm font-semibold text-[#10B981] hover:text-[#059669] transition-colors focus:outline-none"
        >
          + Add
        </button>
      </div>

      {/* Main Base Card Outer Container */}
      <div className="bg-[#111C2A]/60 border border-[#1E293B] rounded-xl p-4 md:p-6 space-y-4 w-full">
        {parameters.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-6">No dynamic parameters active.</p>
        ) : (
          parameters.map((param) => (
            <EvaluationRow 
              key={param.id}
              param={param}
              onUpdate={handleUpdateParameter}
              onDelete={handleDeleteParameter}
            />
          ))
        )}
      </div>
    </section>
  );
}