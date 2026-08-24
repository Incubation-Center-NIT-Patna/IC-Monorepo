'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { PERMISSIONS } from '@/constants/rbac';
import { CandidateService } from '@/services/candidateService';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import CardWrapper from '@/components/Common/CardWrapper';
import DataTable from '@/components/Common/DataTable';
import PageHeader from '@/components/common/PageHeader';
import {
  ClipboardCheck,
  Users,
  Clock,
  ArrowRight,
  GraduationCap,
  History,
  Award,
  Sliders,
} from '@/components/icons';

export default function InductionPortalOverviewPage() {
  const [candidates] = useState(() => CandidateService.getCandidates());
  const [stats] = useState(() => CandidateService.getStats());

  const columns = [
    {
      key: 'name',
      header: 'Candidate',
      sortable: true,
      render: (cand) => (
        <div>
          <p className="font-semibold text-slate-900">{cand.name}</p>
          <p className="text-[11px] text-slate-500">{cand.email}</p>
        </div>
      ),
    },
    {
      key: 'rollNo',
      header: 'Branch & Roll',
      sortable: true,
      render: (cand) => (
        <div>
          <p className="font-mono text-xs text-slate-800">{cand.rollNo}</p>
          <p className="text-[11px] text-slate-500">{cand.branch}</p>
        </div>
      ),
    },
    {
      key: 'domain',
      header: 'Domain',
      sortable: true,
      render: (cand) => (
        <span className="font-medium text-slate-800">{cand.domain}</span>
      ),
    },
    {
      key: 'score',
      header: 'Score',
      sortable: true,
      render: (cand) => (
        <span className="font-semibold text-[#1E40AF]">
          {typeof cand.score === 'number' && cand.score > 0
            ? `${cand.score}/100`
            : cand.score || 'Pending'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (cand) => (
        <span
          className={`px-2 py-0.5 rounded-sm text-[10px] font-semibold uppercase ${
            cand.status === 'Selected'
              ? 'badge-opacity-success'
              : cand.status === 'Interviewed'
              ? 'badge-opacity-primary'
              : 'badge-opacity-warning'
          }`}
        >
          {cand.status}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Action',
      sortable: false,
      className: 'text-right',
      render: () => (
        <Link
          href="/evaluation"
          className="inline-flex items-center gap-1 text-xs font-semibold text-[#1E40AF] hover:underline"
        >
          <span>Evaluate</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      ),
    },
  ];

  return (
    <ProtectedRoute requiredPermission={PERMISSIONS.INDUCTION_VIEW}>
      <div className="space-y-5 animate-in fade-in duration-200">
        {/* Page Header */}
        <PageHeader
          icon={GraduationCap}
          title="Induction Pipeline Portal"
          description="Candidate recruitment pipeline and evaluation management."
          actions={
            <div className="flex items-center gap-2">
              <Link
                href="/evaluation"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-[#1E40AF] hover:bg-[#1E3A8A] text-white font-semibold text-xs shadow-xs transition-colors"
              >
                <ClipboardCheck className="w-4 h-4" />
                <span>Evaluate Candidates</span>
              </Link>
              <Link
                href="/activity-log"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md border border-[#E2E8F0] bg-white hover:bg-slate-50 font-semibold text-xs text-slate-700 transition-colors"
              >
                <History className="w-4 h-4" />
                <span>Activity Log</span>
              </Link>
            </div>
          }
        />



        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <CardWrapper className="p-3.5 hover:border-slate-300 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Applicants
              </span>
              <Users className="w-4 h-4 text-[#1E40AF]" />
            </div>
            <div className="mt-1.5 text-xl font-bold text-slate-900">{stats.total}</div>
          </CardWrapper>

          <CardWrapper className="p-3.5 hover:border-slate-300 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Interviewed
              </span>
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <div className="mt-1.5 text-xl font-bold text-amber-600">{stats.interviewed}</div>
          </CardWrapper>

          <CardWrapper className="p-3.5 hover:border-slate-300 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Selected
              </span>
              <Award className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="mt-1.5 text-xl font-bold text-emerald-600">{stats.selected}</div>
          </CardWrapper>

          <CardWrapper className="p-3.5 hover:border-slate-300 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Induction Settings
              </span>
              <Sliders className="w-4 h-4 text-purple-600" />
            </div>
            <Link
              href="/settings"
              className="mt-1.5 text-xs font-semibold text-[#1E40AF] hover:underline flex items-center gap-1"
            >
              <span>Manage Criteria</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </CardWrapper>
        </div>

        {/* Candidate Pipeline Paginated Table */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Candidate Pipeline Records
            </h2>
            <Link
              href="/evaluation"
              className="text-xs text-[#1E40AF] font-semibold hover:underline"
            >
              Evaluation Portal &rarr;
            </Link>
          </div>

          <DataTable
            data={candidates}
            columns={columns}
            searchPlaceholder="Search candidates by name, roll, domain, or branch..."
            searchKeys={['name', 'rollNo', 'branch', 'domain', 'status']}
            defaultPageSize={10}
            pageSizeOptions={[10, 25, 50, 100]}
            emptyMessage="No candidate records found."
          />
        </div>
      </div>
    </ProtectedRoute>
  );
}
