'use client';
import Image from 'next/image';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ACTIVITY_CATEGORIES, DEFAULT_CATEGORY_FALLBACK } from '../constants/activityCategories';
import { getRecentActivitiesPreview } from '../services/activityService';

export default function RecentActivity() {
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    async function loadData() {
      const data = await getRecentActivitiesPreview();
      setActivities(data);
    }
    loadData();
  }, []);

  return (
    <div className="w-full bg-[#090d16] text-white rounded-xl p-4 border border-slate-800/40 shadow-xl">
      
      {/*RECENT ACTIVITY HEADER SECTION */}
      <div className="flex justify-between items-baseline mb-4">
        <h3 className="text-xl font-semibold tracking-tight text-slate-100">
          Recent Activity
        </h3>
        <Link 
          href="/activity-log" 
          className="text-sm text-teal-400 hover:text-teal-300 transition-colors font-medium"
        >
          View All
        </Link>
      </div>

      {/* recent activities */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {activities.map((item) => {
          const categoryConfig = ACTIVITY_CATEGORIES[item.category] || DEFAULT_CATEGORY_FALLBACK;

          return (
            <div 
              key={item.id} 
              className="flex items-center gap-4 bg-[#161f30]/90 hover:bg-[#1e293b] p-4 rounded-xl border border-slate-800/50 transition-all group w-full"
            >
              
              <div 
                style={{backgroundColor: '#76D7C4'}} 
                className="w-11 h-11 rounded-full flex items-center justify-center shrink-0 border border-zinc-700/30 overflow-hidden shadow-sm"
              >
               <Image 
                src={categoryConfig.imagePath} 
                alt={item.category}
                width={20}  
                height={20} 
                className="object-contain opacity-95 group-hover:scale-105 transition-transform"
                unoptimized 
                />
              </div>
              
            
              <div className="flex flex-col min-w-0 gap-0.5">
                <p className="text-sm text-white font-semibold tracking-wide leading-snug">
                  {item.user} {categoryConfig.label}
                </p>
                <span className="text-xs text-slate-400 font-normal">{item.timeAgo}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}