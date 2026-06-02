'use client';

import Image from 'next/image';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';

import { ACTIVITY_CATEGORIES, DEFAULT_CATEGORY_FALLBACK } from '@/constants/activityCategories';
import { getAllActivities } from '@/services/activityService';
import { formatTimeAgo } from '@/utils/timeUtils';

export default function ActivityLogPage() {
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getAllActivities(); 
        setActivities(data);
      } catch (err) {
        console.error("Error fetching all activities:", err);
        setError("Failed to load the activity log history.");
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="max-w-4xl mx-auto min-h-100 flex flex-col">
      
      {/* BACK NAVIGATION */}
      <div className="mb-6">
        <Link href="/admin/dashboard" className="text-sm text-teal-400 hover:text-teal-300 transition-colors flex items-center gap-2">
          ← Back to Dashboard
        </Link>
      </div>

      {/* HEADER SECTION */}
      <h1 className="text-2xl font-bold tracking-tight text-slate-100 mb-8 border-b border-slate-800 pb-4">
        All Activity Logs
      </h1>

      {/* STATE CONDITIONAL RENDERING */}
      {isLoading ? (
        /* 1. Loading State Spinner Canvas */
        <div className="flex flex-col items-center justify-center py-20 gap-3 grow">
          <div className="w-10 h-10 border-4 border-teal-500/20 border-t-teal-400 rounded-full animate-spin"></div>
          <p className="text-sm text-slate-400 animate-pulse">Loading comprehensive log history...</p>
        </div>
      ) : error ? (
        /* 2. Error Message State View */
        <div className="text-center py-20 grow flex flex-col items-center justify-center">
          <p className="text-sm text-rose-400 font-medium">{error}</p>
          <p className="text-xs text-slate-500 mt-1">Please verify your connection and try refreshing the workspace.</p>
        </div>
      ) : activities.length === 0 ? (
        /* 3. Empty State Array Fallback */
        <div className="text-center py-20 text-sm text-slate-500 grow flex items-center justify-center">
          No historical logs recorded yet.
        </div>
      ) : (
        /* 4. Active Data Feed Stream */
        <div className="space-y-3">
          {activities.map((item) => {
            const categoryConfig = ACTIVITY_CATEGORIES[item.category] || DEFAULT_CATEGORY_FALLBACK;

            return (
              <div key={item.id} className="flex items-center gap-4 bg-[#161f30]/90 p-4 rounded-xl border border-slate-800/5 w-full">
              
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
                  <span className="text-xs text-slate-400">{formatTimeAgo(item.timestamp)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
