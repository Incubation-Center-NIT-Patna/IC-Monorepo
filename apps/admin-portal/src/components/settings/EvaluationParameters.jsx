'use client';

import React, { useState } from 'react';
import CardWrapper from '@/components/Common/CardWrapper';
import SectionTitle from '@/components/Common/SectionTitle';
import EvaluationRow from '@/components/settings/EvaluationRow.jsx'; 
import { DEFAULT_EVALUATION_PARAMETERS } from '@/components/settings/evaluationData.js';
import { Sliders, Plus } from '@/components/icons';

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
    <CardWrapper className="bg-white border border-[#E2E8F0] p-4 rounded-md">
      <SectionTitle
        title="Evaluation Parameters"
        action={handleAddParameter}
        icon={<Sliders size={18} fill="none" className="stroke-[#1E40AF]" />}
        actionIcon={<Plus size={15} />}
        actionText="Add Parameter"
      />

      <div className="space-y-2.5 mt-3">
        {parameters.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-6">No dynamic parameters active.</p>
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
    </CardWrapper>
  );
}