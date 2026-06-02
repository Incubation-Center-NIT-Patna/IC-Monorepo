import React from 'react';

export function CustomSlider({ value, onChange, min = 0, max = 100 }) {
  return (
    <>
     
      <div className="flex items-center gap-4 flex-1">
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
         className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer outline-none "
        />

        
       <span className="bg-[#10b981]  text-black text-xs font-mono font-bold px-2 py-1 rounded min-w-[50px] text-center">
          {value}%
        </span>
      </div>
    </>
  );
}


