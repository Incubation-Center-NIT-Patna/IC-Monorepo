'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { ContentService } from '@/services/contentService';
import { CandidateService } from '@/services/candidateService';
import { ActivityService } from '@/services/activityService';
import { formatTimeAgo } from '@/utils/timeUtils';
import CardWrapper from '@/components/Common/CardWrapper';
import {
  Rocket,
  CalendarDays,
  Users2,
  GraduationCap,
  History,
  Inbox,
  Bell,
  Mic,
  FileText,
  ArrowUpRight,
  X,
} from '@/components/icons';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function DashboardPage() {
  const { currentUser } = useAuth();
  const [stats] = useState(() => {
    const cmsStats = ContentService.getStats();
    const candStats = CandidateService.getStats();
    return {
      ...cmsStats,
      totalApplicants: candStats.total,
    };
  });

  const [candidates] = useState(() => {
    return CandidateService.getCandidates().slice(0, 5);
  });

  const [recentQueries] = useState(() => {
    return ContentService.getItems('queries').slice(0, 5);
  });

  const [recentActivities] = useState(() => {
    return ActivityService.getActivities().slice(0, 5);
  });

  const [selectedDashboardQuery, setSelectedDashboardQuery] = useState(null);

  return (
    <ProtectedRoute>
      <div className="space-y-5 animate-in fade-in duration-200">
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Dashboard
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Overview of website content, incubation queries, startup ventures, and candidate inductions.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/website/queries"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <Inbox className="w-4 h-4" />
              <span>Queries</span>
            </Link>
            <Link
              href="/evaluation"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-[#1E40AF] hover:bg-[#1E3A8A] text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <GraduationCap className="w-4 h-4" />
              <span>Evaluate</span>
            </Link>
          </div>
        </div>

        {/* Top KPI Metrics Strip */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
          <CardWrapper className="p-3.5 hover:border-slate-300 hover:shadow-xs transition-all group">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                Queries
              </p>
              <span className="w-6 h-6 rounded-md bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                <Inbox className="w-3.5 h-3.5" />
              </span>
            </div>
            <h3 className="text-2xl font-black text-slate-900 mt-1.5 tracking-tight">
              {stats.pendingQueries} <span className="text-xs font-bold text-amber-700">New</span>
            </h3>
            <Link
              href="/website/queries"
              className="text-[11px] font-bold text-[#1E40AF] hover:underline flex items-center gap-1 mt-1.5"
            >
              <span>View Panel</span>
              <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </CardWrapper>

          <CardWrapper className="p-3.5 hover:border-slate-300 hover:shadow-xs transition-all group">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                Notices
              </p>
              <span className="w-6 h-6 rounded-md bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                <Bell className="w-3.5 h-3.5" />
              </span>
            </div>
            <h3 className="text-2xl font-black text-slate-900 mt-1.5 tracking-tight">
              {stats.activeNotices}
            </h3>
            <Link
              href="/website/notices"
              className="text-[11px] font-bold text-[#1E40AF] hover:underline flex items-center gap-1 mt-1.5"
            >
              <span>Manage</span>
              <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </CardWrapper>

          <CardWrapper className="p-3.5 hover:border-slate-300 hover:shadow-xs transition-all group">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                Incubations
              </p>
              <span className="w-6 h-6 rounded-md bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
                <Rocket className="w-3.5 h-3.5" />
              </span>
            </div>
            <h3 className="text-2xl font-black text-slate-900 mt-1.5 tracking-tight">
              {stats.totalIncubations}
            </h3>
            <Link
              href="/website/incubations"
              className="text-[11px] font-bold text-[#1E40AF] hover:underline flex items-center gap-1 mt-1.5"
            >
              <span>Manage</span>
              <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </CardWrapper>

          <CardWrapper className="p-3.5 hover:border-slate-300 hover:shadow-xs transition-all group">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                Events
              </p>
              <span className="w-6 h-6 rounded-md bg-rose-50 text-rose-700 flex items-center justify-center font-bold">
                <CalendarDays className="w-3.5 h-3.5" />
              </span>
            </div>
            <h3 className="text-2xl font-black text-slate-900 mt-1.5 tracking-tight">
              {stats.upcomingEvents}
            </h3>
            <Link
              href="/website/events"
              className="text-[11px] font-bold text-[#1E40AF] hover:underline flex items-center gap-1 mt-1.5"
            >
              <span>Manage</span>
              <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </CardWrapper>

          <CardWrapper className="p-3.5 hover:border-slate-300 hover:shadow-xs transition-all group">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                Applicants
              </p>
              <span className="w-6 h-6 rounded-md bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                <GraduationCap className="w-3.5 h-3.5" />
              </span>
            </div>
            <h3 className="text-2xl font-black text-slate-900 mt-1.5 tracking-tight">
              {stats.totalApplicants}
            </h3>
            <Link
              href="/induction"
              className="text-[11px] font-bold text-[#1E40AF] hover:underline flex items-center gap-1 mt-1.5"
            >
              <span>View</span>
              <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </CardWrapper>
        </div>

        {/* Main Content Grid: Candidates Table & Activity Log */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left: Recent Incubation Queries Box & Candidates Table */}
          <div className="lg:col-span-8 space-y-5">
            {/* Queries Box */}
            <CardWrapper className="p-4 sm:p-5">
              <div className="flex items-center justify-between gap-3 mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Queries
                  </h3>
                  <p className="text-xs text-slate-500">
                    Incoming incubation applications and startup inquiries saved from contact form
                  </p>
                </div>

                <Link
                  href="/website/queries"
                  className="text-xs font-semibold text-[#1E40AF] hover:underline flex items-center gap-1"
                >
                  <span>View all</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      <th className="py-2.5 px-3">Founder</th>
                      <th className="py-2.5 px-3">Startup Domain</th>
                      <th className="py-2.5 px-3">Stage</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0] text-xs">
                    {recentQueries.length > 0 ? (
                      recentQueries.map((query) => (
                        <tr
                          key={query.id}
                          onClick={() => setSelectedDashboardQuery(query)}
                          className="hover:bg-[#F8FAFC] transition-colors cursor-pointer"
                        >
                          <td className="py-2.5 px-3 font-semibold text-slate-900">
                            <div>{query.name}</div>
                            <div className="text-[11px] text-slate-500 font-normal">{query.email}</div>
                          </td>
                          <td className="py-2.5 px-3 text-slate-600">
                            <div>{query.domain || 'General Inquiry'}</div>
                          </td>
                          <td className="py-2.5 px-3 text-slate-600">
                            {query.stage || 'Concept'}
                          </td>
                          <td className="py-2.5 px-3">
                            <span
                              className={`px-2 py-0.5 rounded-sm text-[10px] font-semibold uppercase ${query.status === 'New'
                                ? 'badge-opacity-warning'
                                : query.status === 'Contacted'
                                  ? 'badge-opacity-primary'
                                  : 'badge-opacity-success'
                                }`}
                            >
                              {query.status}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedDashboardQuery(query);
                              }}
                              className="inline-flex items-center gap-1 text-xs font-semibold text-[#1E40AF] hover:underline"
                            >
                              <span>Details</span>
                              <ArrowUpRight className="w-3 h-3" />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="py-6 text-center text-slate-400">
                          No incubation queries recorded yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardWrapper>

            {/* Recent Candidates Table */}
            <CardWrapper className="p-4 sm:p-5">
              <div className="flex items-center justify-between gap-3 mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Recent Candidates
                  </h3>
                  <p className="text-xs text-slate-500">
                    Latest candidate submissions for induction review
                  </p>
                </div>

                <Link
                  href="/induction"
                  className="text-xs font-semibold text-[#1E40AF] hover:underline flex items-center gap-1"
                >
                  <span>View all</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      <th className="py-2.5 px-3">Candidate</th>
                      <th className="py-2.5 px-3">Branch & Roll</th>
                      <th className="py-2.5 px-3">Score</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0] text-xs">
                    {candidates.length > 0 ? (
                      candidates.map((cand) => (
                        <tr key={cand.id} className="hover:bg-[#F8FAFC] transition-colors">
                          <td className="py-2.5 px-3 font-semibold text-slate-900">
                            <div>{cand.name}</div>
                            <div className="text-[11px] text-slate-500 font-normal">{cand.domain || cand.role}</div>
                          </td>
                          <td className="py-2.5 px-3 text-slate-600">
                            <div>{cand.branch || cand.dept}</div>
                            <div className="text-[11px] text-slate-400 font-mono">Roll: {cand.rollNo || cand.roll}</div>
                          </td>
                          <td className="py-2.5 px-3 font-semibold text-[#1E40AF]">
                            {typeof cand.score === 'number' && cand.score > 0 ? `${cand.score}/100` : cand.score || 'Pending'}
                          </td>
                          <td className="py-2.5 px-3">
                            <span
                              className={`px-2 py-0.5 rounded-sm text-[10px] font-semibold uppercase ${cand.status === 'Selected'
                                ? 'badge-opacity-success'
                                : cand.status === 'Interviewed'
                                  ? 'badge-opacity-primary'
                                  : 'badge-opacity-warning'
                                }`}
                            >
                              {cand.status}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <Link
                              href="/evaluation"
                              className="inline-flex items-center gap-1 text-xs font-semibold text-[#1E40AF] hover:underline"
                            >
                              <span>Evaluate</span>
                              <ArrowUpRight className="w-3 h-3" />
                            </Link>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="py-6 text-center text-slate-400">
                          No candidates registered yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardWrapper>
          </div>

          {/* Right: Activity Log & Quick Links */}
          <div className="lg:col-span-4 space-y-5">
            {/* Activity Log */}
            <CardWrapper className="p-4 sm:p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4 text-[#1E40AF]" />
                  <h3 className="text-sm font-bold text-slate-900">Activity Log</h3>
                </div>
                <Link
                  href="/activity-log"
                  className="text-xs font-semibold text-[#1E40AF] hover:underline"
                >
                  View all
                </Link>
              </div>

              <div className="space-y-3 text-xs">
                {recentActivities.length > 0 ? (
                  recentActivities.map((act) => (
                    <div key={act.id} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#1E40AF] mt-1.5 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-slate-900 font-medium leading-snug">
                          {act.action}
                        </p>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                          <span className="font-semibold text-slate-600">{act.user}</span>
                          <span>•</span>
                          <span>{formatTimeAgo(act.timestamp)}</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-400 text-center py-4">No recent activity recorded.</p>
                )}
              </div>
            </CardWrapper>

            {/* Quick Navigation */}
            <CardWrapper className="p-4 sm:p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-slate-900">Quick Navigation</h3>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">CMS Shortcuts</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {[
                  {
                    href: '/website/queries',
                    title: 'Queries',
                    subtitle: 'Contact form submissions',
                    icon: Inbox,
                    bg: 'bg-amber-50 text-amber-700 border-amber-200',
                  },
                  {
                    href: '/website/incubations',
                    title: 'Incubations',
                    subtitle: 'Startup venture directory',
                    icon: Rocket,
                    bg: 'bg-purple-50 text-purple-700 border-purple-200',
                  },
                  {
                    href: '/website/talks',
                    title: 'Entrepreneur Talks',
                    subtitle: 'Guest speaker keynotes',
                    icon: Mic,
                    bg: 'bg-blue-50 text-[#1E40AF] border-blue-200',
                  },
                  {
                    href: '/website/about',
                    title: 'About Section',
                    subtitle: 'Website intro & pillars',
                    icon: FileText,
                    bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                  },
                  {
                    href: '/website/events',
                    title: 'Events',
                    subtitle: 'Pitch days & summits',
                    icon: CalendarDays,
                    bg: 'bg-rose-50 text-rose-700 border-rose-200',
                  },
                  {
                    href: '/website/team',
                    title: 'Team & Mentors',
                    subtitle: 'Faculty & coordinators',
                    icon: Users2,
                    bg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
                  },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="p-2.5 rounded-lg border border-[#E2E8F0] bg-white hover:bg-slate-50 hover:border-slate-300 hover:shadow-xs transition-all flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className={`w-7 h-7 rounded-md ${item.bg} border flex items-center justify-center shrink-0 transition-transform group-hover:scale-105`}>
                          <Icon className="w-3.5 h-3.5" />
                        </span>
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-slate-900 group-hover:text-[#1E40AF] transition-colors truncate">
                            {item.title}
                          </h4>
                          <p className="text-[10px] text-slate-400 truncate">{item.subtitle}</p>
                        </div>
                      </div>
                      <ArrowUpRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-[#1E40AF] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0 ml-1" />
                    </Link>
                  );
                })}
              </div>
            </CardWrapper>
          </div>
        </div>

        {/* Dashboard Query Detail Modal */}
        {selectedDashboardQuery && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
            <div className="w-full max-w-lg rounded-md bg-white border border-[#E2E8F0] p-6 shadow-xl space-y-4 animate-in zoom-in-95 font-sans">
              <div className="flex items-start justify-between pb-3 border-b border-[#E2E8F0]">
                <div>
                  <h2 className="text-base font-bold text-slate-900">{selectedDashboardQuery.name}</h2>
                  <p className="text-xs text-slate-500 mt-0.5">{selectedDashboardQuery.email} • {selectedDashboardQuery.phone || 'No phone'}</p>
                </div>
                <button
                  onClick={() => setSelectedDashboardQuery(null)}
                  className="p-1 text-slate-400 hover:text-slate-800 rounded-md hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-md border border-slate-100">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Startup Domain</span>
                  <span className="text-slate-800 font-semibold">{selectedDashboardQuery.domain || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Stage</span>
                  <span className="text-slate-800 font-semibold">{selectedDashboardQuery.stage || 'Concept'}</span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-700 block">Query Message</span>
                <p className="p-3 bg-slate-50 rounded-md border border-slate-200 text-xs text-slate-800 leading-relaxed whitespace-pre-line max-h-40 overflow-y-auto">
                  {selectedDashboardQuery.message}
                </p>
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-[#E2E8F0]">
                <Link
                  href="/website/queries"
                  className="text-xs font-semibold text-[#1E40AF] hover:underline flex items-center gap-1"
                >
                  <span>Open in Full Queries Panel</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
                <button
                  onClick={() => setSelectedDashboardQuery(null)}
                  className="px-3 py-1.5 rounded-md border border-[#E2E8F0] text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
