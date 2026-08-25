'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { getAllActivities } from '@/services/activityService';
import { formatTimeAgo } from '@/utils/timeUtils';
import DataTable from '@/components/Common/DataTable';
import CardWrapper from '@/components/Common/CardWrapper';
import PageHeader from '@/components/common/PageHeader';
import { History, User, Clock, Tag } from '@/components/icons';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { PERMISSIONS } from '@/constants/rbac';
import { Badge } from '@/components/ui';

const CATEGORIES = ['All', 'Evaluation', 'Notices', 'Startups', 'Events', 'Settings', 'Users'];

export default function ActivityLogPage() {
  const [activities, setActivities] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const data = await getAllActivities();
        setActivities(data);
      } catch (err) {
        console.error('Error fetching activities:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredActivities = useMemo(() => {
    if (activeCategory === 'All') return activities;
    return activities.filter(
      (a) => a.category?.toLowerCase() === activeCategory.toLowerCase()
    );
  }, [activities, activeCategory]);

  const columns = [
    {
      key: 'user',
      header: 'Performed By',
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-2.5">
          <span
            className="w-8 h-8 rounded-full bg-[#1E40AF] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs border border-blue-200"
          >
            {item.user?.[0] || 'A'}
          </span>
          <div>
            <p className="font-bold text-slate-900 text-xs">{item.user}</p>
            <span className="inline-block text-[10px] font-semibold text-slate-500">
              {item.role || 'Admin'}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: 'action',
      header: 'Action Performed',
      sortable: true,
      render: (item) => (
        <p className="font-semibold text-slate-800 text-xs leading-relaxed max-w-md">
          {item.action}
        </p>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      sortable: true,
      render: (item) => (
        <Badge variant="blue" className="font-bold text-[10px]">
          {item.category || 'General'}
        </Badge>
      ),
    },
    {
      key: 'timestamp',
      header: 'Date & Time',
      sortable: true,
      render: (item) => (
        <div>
          <p className="text-slate-900 font-bold text-xs">
            {formatTimeAgo(item.timestamp)}
          </p>
          <p className="text-[10px] text-slate-400 font-mono mt-0.5">
            {new Date(item.timestamp).toLocaleString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (item) => (
        <Badge
          variant={
            item.status === 'Completed' || item.status === 'Published' || item.status === 'Approved'
              ? 'emerald'
              : 'amber'
          }
          showDot
        >
          {item.status || 'Success'}
        </Badge>
      ),
    },
  ];

  return (
    <ProtectedRoute requiredPermission={PERMISSIONS.INDUCTION_VIEW}>
      <div className="space-y-5 animate-in fade-in duration-200">
        {/* Header */}
        <PageHeader
          icon={History}
          title="Activity & Audit Log"
          description="Real-time timeline of website content updates, candidate evaluations, and access permission changes."
        />

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeCategory === cat
                  ? 'bg-[#1E40AF] text-white shadow-xs'
                  : 'bg-white border border-[#E2E8F0] text-slate-700 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Content Loading State */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-2.5 bg-white rounded-2xl border border-[#E2E8F0] shadow-xs">
            <div className="w-7 h-7 border-2 border-[#1E40AF]/20 border-t-[#1E40AF] rounded-full animate-spin"></div>
            <p className="text-xs text-slate-500 font-bold">Loading activity records...</p>
          </div>
        ) : (
          <>
            {/* MOBILE ONLY (< 640px): Touch-friendly Timeline Card Feed */}
            <div className="block sm:hidden space-y-3">
              {filteredActivities.length > 0 ? (
                filteredActivities.map((act) => (
                  <CardWrapper key={act.id} className="p-4 rounded-xl bg-white border border-[#E2E8F0] space-y-3 shadow-2xs">
                    {/* Top Row: User Avatar, Name & Status Badge */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="w-8 h-8 rounded-full bg-[#1E40AF] text-white flex items-center justify-center font-black text-xs shrink-0 border border-blue-200">
                          {act.user?.[0] || 'A'}
                        </span>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 text-xs truncate">{act.user}</p>
                          <p className="text-[10px] text-slate-400 font-medium">{act.role || 'Admin'}</p>
                        </div>
                      </div>

                      <Badge
                        variant={
                          act.status === 'Completed' || act.status === 'Published' || act.status === 'Approved'
                            ? 'emerald'
                            : 'amber'
                        }
                        showDot
                      >
                        {act.status || 'Success'}
                      </Badge>
                    </div>

                    {/* Middle Row: Action Description */}
                    <p className="text-xs font-semibold text-slate-800 leading-relaxed bg-slate-50/80 p-2.5 rounded-lg border border-slate-100">
                      {act.action}
                    </p>

                    {/* Bottom Row: Category & Timestamp */}
                    <div className="flex items-center justify-between text-[11px] pt-1 text-slate-500">
                      <span className="inline-flex items-center gap-1 font-bold text-[#1E40AF] bg-blue-50 px-2 py-0.5 rounded border border-blue-100 text-[10px]">
                        <Tag className="w-3 h-3" />
                        <span>{act.category || 'General'}</span>
                      </span>

                      <div className="flex items-center gap-1 font-medium text-slate-400">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{formatTimeAgo(act.timestamp)}</span>
                      </div>
                    </div>
                  </CardWrapper>
                ))
              ) : (
                <div className="p-8 text-center bg-white rounded-xl border border-[#E2E8F0] text-slate-400 text-xs italic">
                  No activity records found.
                </div>
              )}
            </div>

            {/* DESKTOP ONLY (>= 640px): Paginated Data Table */}
            <div className="hidden sm:block">
              <DataTable
                data={filteredActivities}
                columns={columns}
                searchPlaceholder="Search by user, action, or category..."
                searchKeys={['user', 'action', 'category', 'role']}
                defaultPageSize={10}
                pageSizeOptions={[10, 25, 50, 100]}
                emptyMessage="No activity records found matching your criteria."
              />
            </div>
          </>
        )}
      </div>
    </ProtectedRoute>
  );
}
