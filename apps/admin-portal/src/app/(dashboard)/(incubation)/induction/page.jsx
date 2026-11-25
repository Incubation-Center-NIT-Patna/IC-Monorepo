'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { PERMISSIONS } from '@/constants/rbac';
import { CandidateService } from '@/services/incubation/candidateService';
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
  RefreshCw,
  AlertCircle,
  UserPlus,
  CheckCircle2,
  Loader2,
} from '@/components/icons';
import apiClient from '@/lib/api';

export default function InductionPortalOverviewPage() {
  const [candidates, setCandidates] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    interviewed: 0,
    selected: 0,
    inReview: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [creatingUserId, setCreatingUserId] = useState(null);
  const [feedback, setFeedback] = useState({ type: '', text: '' });
  const [error, setError] = useState(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [appRes, statsRes] = await Promise.all([
        CandidateService.fetchApplications({ page: 1, limit: 100 }),
        CandidateService.fetchStats(),
      ]);

      if (appRes && appRes.candidates) {
        setCandidates(appRes.candidates);
      }
      if (statsRes) {
        setStats({
          total: statsRes.total ?? statsRes.totalApplicants ?? 0,
          interviewed: statsRes.interviewed ?? statsRes.shortlisted ?? 0,
          selected: statsRes.selected ?? statsRes.accepted ?? 0,
          inReview: statsRes.inReview ?? statsRes.pending ?? 0,
        });
      }
    } catch (err) {
      console.error('Failed to load induction candidates:', err);
      setError('Unable to load induction records from centralized API.');
      setCandidates([]);
      setStats({ total: 0, interviewed: 0, selected: 0, inReview: 0 });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreateUser = async (cand) => {
    if (!window.confirm(`Create system User account for selected candidate "${cand.name}" (${cand.email})?`)) return;

    try {
      setCreatingUserId(cand.id);
      await apiClient.post(`/induction/applications/${cand.id}/create-user`, {});
      setFeedback({
        type: 'success',
        text: `User account created successfully for ${cand.name}. They are now added to Team Members!`,
      });
      await loadData();
    } catch (err) {
      const msg = err.message || err.error || 'Failed to create user account';
      setFeedback({ type: 'error', text: typeof msg === 'string' ? msg : JSON.stringify(msg) });
    } finally {
      setCreatingUserId(null);
    }
  };

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
              : cand.status === 'Rejected'
              ? 'badge-opacity-danger'
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
      render: (cand) => {
        const isSelected = cand.rawStatus === 'ACCEPTED' || cand.status === 'Selected';
        return (
          <div className="flex items-center justify-end gap-2">
            {isSelected && (
              cand.isUserCreated ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>User Created</span>
                </span>
              ) : (
                <button
                  onClick={() => handleCreateUser(cand)}
                  disabled={creatingUserId === cand.id}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#1E40AF] hover:bg-[#1E3A8A] text-white text-xs font-semibold shadow-xs transition-colors disabled:opacity-50"
                  title="Create system User account for this selected candidate"
                >
                  {creatingUserId === cand.id ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <UserPlus className="w-3 h-3" />
                  )}
                  <span>Create User</span>
                </button>
              )
            )}
            <Link
              href={`/evaluation?candidateId=${cand.id}`}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#1E40AF] hover:underline"
            >
              <span>Evaluate</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        );
      },
    },
  ];

  return (
    <ProtectedRoute requiredPermission={PERMISSIONS.INDUCTION_VIEW}>
      <div className="space-y-5 animate-in fade-in duration-200">
        {/* Page Header */}
        <PageHeader
          icon={GraduationCap}
          title="Induction Portal"
          description="Candidate recruitment, selection, and evaluation management."
          actions={
            <div className="flex items-center gap-2">
              <button
                onClick={loadData}
                disabled={isLoading}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-[#E2E8F0] bg-white hover:bg-slate-50 font-semibold text-xs text-slate-700 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
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

        {feedback.text && (
          <div
            className={`p-3 rounded-md border text-xs flex items-center justify-between ${
              feedback.type === 'error'
                ? 'bg-red-50 border-red-200 text-red-700'
                : 'bg-emerald-50 border-emerald-200 text-emerald-800'
            }`}
          >
            <span>{feedback.text}</span>
            <button
              onClick={() => setFeedback({ type: '', text: '' })}
              className="text-slate-400 hover:text-slate-600 font-bold ml-2"
            >
              ×
            </button>
          </div>
        )}

        {/* Optional Error Banner */}
        {error && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-md flex items-center gap-2 text-xs text-amber-800">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <CardWrapper className="p-3.5 hover:border-slate-300 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Applicants
              </span>
              <Users className="w-4 h-4 text-[#1E40AF]" />
            </div>
            <div className="mt-1.5 text-xl font-bold text-slate-900">
              {isLoading ? '...' : stats.total}
            </div>
          </CardWrapper>

          <CardWrapper className="p-3.5 hover:border-slate-300 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Interviewed
              </span>
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <div className="mt-1.5 text-xl font-bold text-amber-600">
              {isLoading ? '...' : stats.interviewed}
            </div>
          </CardWrapper>

          <CardWrapper className="p-3.5 hover:border-slate-300 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Selected
              </span>
              <Award className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="mt-1.5 text-xl font-bold text-emerald-600">
              {isLoading ? '...' : stats.selected}
            </div>
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

        {/* Candidate Selection Records Table */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Candidate Selection Records
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
            emptyMessage={
              isLoading ? 'Loading candidates...' : 'No candidate records found.'
            }
          />

        {feedback.text && (
          <div
            className={`p-3 rounded-md border text-xs flex items-center justify-between ${
              feedback.type === 'error'
                ? 'bg-red-50 border-red-200 text-red-700'
                : 'bg-emerald-50 border-emerald-200 text-emerald-800'
            }`}
          >
            <span>{feedback.text}</span>
            <button
              onClick={() => setFeedback({ type: '', text: '' })}
              className="text-slate-400 hover:text-slate-600 font-bold ml-2"
            >
              ×
            </button>
          </div>
        )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
