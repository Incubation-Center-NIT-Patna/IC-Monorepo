'use client';

import React from 'react';
import { CustomSlider } from '../../../../../packages/ui/src/CustomSlider';
import { Trash2 } from '@/components/icons';

export default function EvaluationRow({ param, onUpdate, onDelete }) {
  return (
    <div className="flex flex-col gap-1.5 w-full bg-[#F8FAFC] border border-[#E2E8F0] p-3 rounded-md">
      <div className="flex items-center justify-between w-full gap-2">
        <input
          type="text"
          value={param.name}
          onChange={(e) => onUpdate(param.id, 'name', e.target.value)}
          className="bg-transparent text-slate-900 text-xs font-semibold outline-none border-b border-transparent hover:border-slate-300 focus:border-[#1E40AF] pb-0.5 w-2/3 truncate transition-colors"
          placeholder="Parameter Name"
        />
        
        <button 
          type="button" 
          onClick={() => onDelete(param.id)} 
          className="text-slate-400 hover:text-rose-600 p-1 rounded-sm hover:bg-slate-200 transition-colors shrink-0 cursor-pointer"
          title="Remove Field"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
      
      <div className="w-full mt-0.5">
        <CustomSlider 
          value={param.weight} 
          onChange={(w) => onUpdate(param.id, 'weight', w)} 
        />
      </div>
    </div>
  );
}