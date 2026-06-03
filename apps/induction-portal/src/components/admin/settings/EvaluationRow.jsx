'use client';

import React from 'react';
import { CustomSlider } from '../../../../../../packages/ui/src/CustomSlider';


export default function EvaluationRow({ param, onUpdate, onDelete }) {
  return (
    <div className="flex flex-col gap-2 w-full bg-[#070D19] border border-gray-800/40 p-4 rounded-xl">
      
    
      <div className="flex items-center justify-between w-full gap-2">
        <input
          type="text"
          value={param.name}
          onChange={(e) => onUpdate(param.id, 'name', e.target.value)}
          className="bg-transparent text-gray-100 text-base font-medium outline-none border-b border-transparent hover:border-gray-700 focus:border-[#10B981] pb-0.5 w-2/3 truncate transition-colors"
          placeholder="Parameter Name"
        />
        
        
        <button 
          type="button" 
          onClick={() => onDelete(param.id)} 
          className="text-gray-500 hover:text-red-400 p-1.5 rounded hover:bg-gray-800/20 transition-colors shrink-0"
          title="Remove Field"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
          </svg>
        </button>
      </div>
      
     
      <div className="w-full mt-1">
        <CustomSlider 
          value={param.weight} 
          onChange={(w) => onUpdate(param.id, 'weight', w)} 
        />
      </div>

    </div>
  );
}