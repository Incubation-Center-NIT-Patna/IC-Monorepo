'use client';

import React, { useState } from 'react';
import CardWrapper from '@/components/Common/CardWrapper';
import SectionTitle from '@/components/Common/SectionTitle';
import EvaluationRow from '@/components/settings/EvaluationRow.jsx'; 
import { Sliders, Plus } from '@/components/icons';

export default function EvaluationParameters({
  parameters: controlledParameters,
  onParametersChange,
}) {
  const [internalParameters, setInternalParameters] = useState([]);

  const parameters = controlledParameters !== undefined ? controlledParameters : internalParameters;

  const updateParameters = (newParams) => {
    if (onParametersChange) {
      onParametersChange(newParams);
    } else {
      setInternalParameters(newParams);
    }
  };

  const handleAddParameter = () => {
    updateParameters([
      ...parameters,
      { id: crypto.randomUUID(), name: 'New Parameter', weight: 10 },
    ]);
  };

  const handleDeleteParameter = (idToFilter) => {
    updateParameters(parameters.filter((p) => p.id !== idToFilter));
  };

  const handleUpdateParameter = (id, key, val) => {
    updateParameters(
      parameters.map((p) => (p.id === id ? { ...p, [key]: val } : p))
    );
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