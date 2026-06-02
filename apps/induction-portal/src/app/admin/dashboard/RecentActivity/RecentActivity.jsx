'use client';
import Image from 'next/image';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ACTIVITY_CATEGORIES, DEFAULT_CATEGORY_FALLBACK } from "@/constants/activityCategories";
import { getRecentActivitiesPreview } from "@/services/activityService";
import { formatTimeAgo } from "@/utils/timeUtils";



export default function RecentActivity() {
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getRecentActivitiesPreview();
        setActivities(data);
      } catch (err) {
        console.error("Error fetching recent activities:", err);
        setError("Failed to load recent activity.");
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    /* OUTERMOST BOX - Bounded to ~900px and centered on desktop */
    <>
      
      {/* RECENT ACTIVITY HEADER SECTION */}
      <div className="flex justify-between items-baseline mb-4 w-full">
        <h3 className="text-xl font-semibold tracking-tight text-slate-100">
          Recent Activity
        </h3>
        <Link 
          href="/admin/dashboard/RecentActivity/ActivityLog" 
          className="text-sm text-teal-400 hover:text-teal-300 transition-colors font-medium"
        >
          View All
        </Link>
      </div>

      {/* STATE CONDITIONAL RENDERING */}
      {isLoading ? (
        /* 1. Loading State Spinner */
        <div className="flex flex-col items-center justify-center py-8 gap-3 flex-grow">
          <div className="w-7 h-7 border-3 border-teal-500/20 border-t-teal-400 rounded-full animate-spin"></div>
          <p className="text-xs text-slate-400 animate-pulse">Loading activities...</p>
        </div>
      ) : error ? (
        /* 2. Error Message State */
        <div className="text-center py-8 flex-grow flex flex-col items-center justify-center">
          <p className="text-xs text-rose-400 font-medium">{error}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Please try reloading the workspace.</p>
        </div>
      ) : activities.length === 0 ? (
        /* 3. Empty Array State fallback */
        <div className="text-center py-8 text-xs text-slate-500 flex-grow flex items-center justify-center">
          No recent activity logs found.
        </div>
      ) : (
        /* 4. Active Data Feed State */
        <div className="flex flex-col gap-4 w-full">
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
                  <span className="text-xs text-slate-400 font-normal">
                    {formatTimeAgo(item.timestamp)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}