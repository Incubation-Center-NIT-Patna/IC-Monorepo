'use client';
import Image from 'next/image';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ACTIVITY_CATEGORIES, DEFAULT_CATEGORY_FALLBACK } from '../../constants/activityCategories';
import { getAllActivities } from '../../services/activityService';

export default function ActivityLogPage() {
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    async function loadData() {
      
      const data = await getAllActivities(); 
      setActivities(data);
    }
    loadData();
  }, []);

  return (
    <main className="min-h-screen bg-[#05070c] text-white p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        
    
        <div className="mb-6">
          <Link href="/" className="text-sm text-teal-400 hover:text-teal-300 transition-colors flex items-center gap-2">
            ← Back to Dashboard
          </Link>
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-slate-100 mb-8 border-b border-slate-800 pb-4">
          All Activity Logs
        </h1>

       
        <div className="space-y-3">
          {activities.map((item) => {
            const categoryConfig = ACTIVITY_CATEGORIES[item.category] || DEFAULT_CATEGORY_FALLBACK;

            return (
              <div key={item.id} className="flex items-center gap-4 bg-[#161f30]/90 p-4 rounded-xl border border-slate-800/50 w-full">
              
                <div style={{ backgroundColor: '#76D7C4' }} className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 border border-zinc-700/30 overflow-hidden">
                  <Image 
                    src={categoryConfig.imagePath} 
                    alt={item.category} 
                    width={20} 
                    height={20} 
                    className="object-contain" 
                    unoptimized 
                    />
                </div>
                <div className="flex flex-col">
                  <p className="text-sm text-white font-semibold">
                    {item.user} {categoryConfig.label}
                  </p>
                  <span className="text-xs text-slate-400">{item.timeAgo}</span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </main>
  );
}