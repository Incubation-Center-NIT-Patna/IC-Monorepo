'use client';

import React, { useState, useMemo, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { PERMISSIONS } from '@/constants/rbac';
import { CandidateService } from '@/services/incubation/candidateService';
import { ActivityService } from '@/services/admin/activityService';
import { getEvaluationParameters } from '@/services/incubation/incubationSettingsService';
import InductionService from '@/services/incubation/inductionService';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import CardWrapper from '@/components/Common/CardWrapper';
import Toast from '@/components/Common/Toast';
import PageHeader from '@/components/common/PageHeader';
import { Badge, Button } from '@/components/ui';
import {
  Code2,
  Users,
  Brain,
  GraduationCap,
  Sliders,
  MessageSquareText,
  Star,
  CheckCircle2,
  Save,
  Tag,
  Check,
  Plus,
  RefreshCw,
} from '@/components/icons';

import apiClient from '@/lib/api';

const ICON_MAP = {
  tech: Code2,
  prob: Brain,
  comm: MessageSquareText,
  team: Users,
  lead: Star,
};

function EvaluationContent() {
  const searchParams = useSearchParams();
  const queryCandidateId = searchParams.get('candidateId');
  const { currentUser } = useAuth();

  const [candidates, setCandidates] = useState([]);
  const [selectedCandidateId, setSelectedCandidateId] = useState(queryCandidateId || '');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [parameters, setParameters] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);

  const [scores, setScores] = useState({});
  const [notes, setNotes] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);

  const [toast, setToast] = useState(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [res, dbParams, dbTagsRes] = await Promise.all([
        CandidateService.fetchApplications({ page: 1, limit: 100 }),
        getEvaluationParameters(),
        apiClient.get('/settings/feedback_tags').catch(() => null),
      ]);

      if (dbTagsRes?.value && Array.isArray(dbTagsRes.value)) {
        setAvailableTags(dbTagsRes.value);
      }

      if (dbParams && Array.isArray(dbParams) && dbParams.length > 0) {
        const formatted = dbParams.map((p, idx) => ({
          id: p.id || `param_${idx}`,
          title: p.title || p.parameterName || p.name || `Parameter ${idx + 1}`,
          weight: Number(p.weight ?? p.weighttage ?? 20),
          icon: ICON_MAP[p.id] || Sliders,
          minLabel: p.minLabel || 'Basic (1.0)',
          maxLabel: p.maxLabel || 'Mastery (5.0)',
        }));
        setParameters(formatted);
        setScores((prev) => {
          const next = { ...prev };
          formatted.forEach((fp) => {
            if (next[fp.id] === undefined) next[fp.id] = 3.5;
          });
          return next;
        });
      }

      if (res && res.candidates && res.candidates.length > 0) {
        setCandidates(res.candidates);
        if (!selectedCandidateId || !res.candidates.some((c) => c.id === selectedCandidateId)) {
          setSelectedCandidateId(queryCandidateId || res.candidates[0].id);
        }
      } else {
        setCandidates([]);
      }
    } catch (err) {
      console.warn('Failed to fetch candidates/parameters from API:', err);
      setCandidates([]);
    } finally {
      setIsLoading(false);
    }
  }, [queryCandidateId, selectedCandidateId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const activeCandidate = useMemo(() => {
    return (
      candidates.find((c) => c.id === selectedCandidateId) ||
      candidates[0] ||
      null
    );
  }, [candidates, selectedCandidateId]);

  useEffect(() => {
    if (!activeCandidate) return;

    setNotes(activeCandidate.notes || '');
    setSelectedTags(
      Array.isArray(activeCandidate.selectedTags) && activeCandidate.selectedTags.length > 0
        ? activeCandidate.selectedTags
        : ['Quick Learner', 'Strong Problem Solving']
    );

    if (activeCandidate.activeInterviewId) {
      InductionService.getInterviewById(activeCandidate.activeInterviewId)
        .then((res) => {
          if (res && res.interview) {
            const intv = res.interview;
            if (intv.interviewNotes) setNotes(intv.interviewNotes);
            if (Array.isArray(intv.feedbackTags) && intv.feedbackTags.length > 0) {
              setSelectedTags(intv.feedbackTags);
            }

            if (intv.round?.evaluationParameters?.length > 0) {
              const roundParams = intv.round.evaluationParameters.map((p) => ({
                id: p.id,
                title: p.parameterName,
                weight: p.weighttage || 20,
                icon: ICON_MAP[p.id] || Sliders,
                minLabel: 'Basic (1.0)',
                maxLabel: 'Mastery (5.0)',
              }));
              setParameters(roundParams);

              const initialScores = {};
              roundParams.forEach((rp) => {
                const existingEval = intv.interviewEvaluations?.find((ie) => ie.parameterId === rp.id);
                initialScores[rp.id] = existingEval ? existingEval.rawScore : 3.5;
              });
              setScores(initialScores);
            }
          }
        })
        .catch((err) => {
          console.warn('Could not load interview details:', err);
        });
    }
  }, [activeCandidate]);

  const { aggregateScore, percentageScore, recommendation } = useMemo(() => {
    let totalWeightedScore = 0;
    let totalWeight = 0;

    parameters.forEach((p) => {
      const s = scores[p.id] ?? 3.0;
      totalWeightedScore += s * p.weight;
      totalWeight += p.weight;
    });

    const avg = totalWeight > 0 ? totalWeightedScore / totalWeight : 3.0;
    const pct = Math.round((avg / 5.0) * 100);

    let rec = 'Pending';
    if (avg >= 4.2) rec = 'Strong Recommend';
    else if (avg >= 3.5) rec = 'Recommend';
    else if (avg >= 2.8) rec = 'Borderline';
    else rec = 'Not Recommended';

    return {
      aggregateScore: avg.toFixed(2),
      percentageScore: pct,
      recommendation: rec,
    };
  }, [scores, parameters]);

  const handleScoreChange = (paramId, val) => {
    setScores((prev) => ({
      ...prev,
      [paramId]: Number(val),
    }));
  };

  const handleToggleTag = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSaveDraft = async () => {
    if (!activeCandidate) return;
    setIsSubmitting(true);

    try {
      if (activeCandidate.activeInterviewId) {
        await InductionService.submitEvaluation(activeCandidate.activeInterviewId, {
          scores: Object.entries(scores).map(([k, v]) => ({
            parameterId: k,
            rawScore: v,
          })),
          notes,
          feedbackTags: selectedTags,
          recommendation,
          isFinal: false,
        });
      }

      CandidateService.updateCandidate(activeCandidate.id, {
        notes,
        selectedTags,
        score: percentageScore,
        evaluator: currentUser?.name || 'Evaluator',
      });

      ActivityService.logActivity({
        user: currentUser?.name || 'Evaluator',
        role: currentUser?.role || 'Reviewer',
        action: `Saved evaluation draft for candidate ${activeCandidate.name} (${percentageScore}/100)`,
        category: 'Evaluation',
        status: 'Saved',
      });

      setToast({
        message: `Evaluation draft for ${activeCandidate.name} saved successfully.`,
        type: 'info',
      });
    } catch (err) {
      console.warn('Draft save error, updated locally:', err);
      CandidateService.updateCandidate(activeCandidate.id, {
        notes,
        selectedTags,
        score: percentageScore,
        evaluator: currentUser?.name || 'Evaluator',
      });
      setToast({
        message: `Evaluation draft for ${activeCandidate.name} saved locally.`,
        type: 'info',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitEvaluation = async () => {
    if (!activeCandidate) return;
    setIsSubmitting(true);

    const newStatus = percentageScore >= 80 ? 'Selected' : 'Interviewed';

    try {
      if (activeCandidate.activeInterviewId) {
        await InductionService.submitEvaluation(activeCandidate.activeInterviewId, {
          scores: Object.entries(scores).map(([k, v]) => ({
            parameterId: k,
            rawScore: v,
          })),
          notes,
          feedbackTags: selectedTags,
          recommendation,
          isFinal: true,
        });
      }

      await CandidateService.updateCandidateStatus(activeCandidate.id, newStatus, notes);

      CandidateService.updateCandidate(activeCandidate.id, {
        notes,
        selectedTags,
        score: percentageScore,
        status: newStatus,
        evaluator: currentUser?.name || 'Evaluator',
      });

      ActivityService.logActivity({
        user: currentUser?.name || 'Evaluator',
        role: currentUser?.role || 'Reviewer',
        action: `Completed evaluation for ${activeCandidate.name}: scored ${percentageScore}/100 (${recommendation})`,
        category: 'Evaluation',
        status: 'Completed',
      });

      setToast({
        message: `Evaluation submitted for ${activeCandidate.name} (${percentageScore}/100)! Status updated to ${newStatus}.`,
        type: 'success',
      });

      // Update candidate in local state
      setCandidates((prev) =>
        prev.map((c) =>
          c.id === activeCandidate.id
            ? { ...c, status: newStatus, score: percentageScore, notes, selectedTags }
            : c
        )
      );
    } catch (err) {
      console.warn('Evaluation submission error, fallback applied:', err);
      CandidateService.updateCandidate(activeCandidate.id, {
        notes,
        selectedTags,
        score: percentageScore,
        status: newStatus,
        evaluator: currentUser?.name || 'Evaluator',
      });
      setToast({
        message: `Evaluation submitted locally for ${activeCandidate.name} (${percentageScore}/100).`,
        type: 'success',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-200 pb-8">
      <Toast toast={toast} onClose={() => setToast(null)} duration={2500} />

      {/* Top Header */}
      <PageHeader
        icon={Brain}
        title="Candidate Evaluation & Assessment"
        description="Evaluate candidate criteria parameters, select feedback tags, and record assessment notes."
        actions={
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">Candidate:</span>
            <select
              value={selectedCandidateId}
              onChange={(e) => setSelectedCandidateId(e.target.value)}
              className="px-3.5 py-2 text-xs font-bold rounded-xl border border-[#E2E8F0] bg-white text-slate-900 focus:outline-none focus:border-[#1E40AF] cursor-pointer shadow-xs"
            >
              {candidates.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.domain?.split('&')[0] || c.domain})
                </option>
              ))}
            </select>
          </div>
        }
      />

      {/* Active Candidate Hero Banner */}
      {activeCandidate && (
        <CardWrapper className="p-5 sm:p-6 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className="w-12 h-12 rounded-full bg-[#1E40AF] text-white flex items-center justify-center font-black text-xl shadow-md border-2 border-blue-100 shrink-0">
                {activeCandidate.name[0]}
              </span>
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h2 className="text-lg font-black text-slate-900 tracking-tight">
                    {activeCandidate.name}
                  </h2>
                  <Badge
                    variant={
                      activeCandidate.status === 'Selected'
                        ? 'emerald'
                        : activeCandidate.status === 'Interviewed'
                        ? 'blue'
                        : 'amber'
                    }
                    showDot
                  >
                    {activeCandidate.status}
                  </Badge>
                </div>
                <p className="text-xs text-slate-500 mt-1 font-medium">
                  Roll No: <strong className="text-slate-900 font-mono">{activeCandidate.rollNo}</strong> •{' '}
                  {activeCandidate.branch}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-5 text-xs bg-slate-50/80 px-4 py-3 rounded-xl border border-slate-100">
              <div>
                <span className="text-slate-400 font-bold uppercase text-[10px] block tracking-wider">
                  Target Domain
                </span>
                <span className="font-bold text-slate-900 text-xs mt-0.5 block">
                  {activeCandidate.domain}
                </span>
              </div>
              <div className="h-7 w-px bg-slate-200" />
              <div>
                <span className="text-slate-400 font-bold uppercase text-[10px] block tracking-wider">
                  Assigned Evaluator
                </span>
                <span className="font-bold text-slate-900 text-xs mt-0.5 block">
                  {activeCandidate.evaluator || 'Pending'}
                </span>
              </div>
            </div>
          </div>
        </CardWrapper>
      )}

      {/* 2-Column Main Evaluation Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Rubric Parameters Wrapper Card */}
        <div className="lg:col-span-7 space-y-4">
          <CardWrapper className="p-5 sm:p-6 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-blue-50 text-[#1E40AF] border border-blue-100">
                  <Sliders className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Evaluation Criteria Parameters
                  </h3>
                  <p className="text-xs text-slate-500">
                    Adjust parameter scores from 1.0 (Basic) to 5.0 (Excellent)
                  </p>
                </div>
              </div>
              <Badge variant="blue">{parameters.length} Parameters Active</Badge>
            </div>

            {/* Stacked Parameter Cards */}
            <div className="space-y-4">
              {parameters.map((param) => {
                const Icon = param.icon;
                const currentVal = scores[param.id] ?? 3.0;

                return (
                  <div
                    key={param.id}
                    className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] hover:border-slate-300 transition-all space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="p-2 rounded-lg bg-white text-[#1E40AF] border border-slate-200 shadow-2xs">
                          <Icon className="w-4 h-4" />
                        </span>
                        <div>
                          <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                            {param.title}
                          </h4>
                          <span className="text-[10px] text-slate-500 font-semibold">
                            Weightage: {param.weight}%
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-xl font-black text-[#1E40AF]">
                          {currentVal.toFixed(1)}
                        </span>
                        <span className="text-[10px] text-slate-400 font-semibold"> / 5.0</span>
                      </div>
                    </div>

                    <input
                      type="range"
                      min={1}
                      max={5}
                      step={0.5}
                      value={currentVal}
                      onChange={(e) => handleScoreChange(param.id, e.target.value)}
                      className="w-full accent-[#1E40AF] cursor-pointer h-2 bg-slate-200 rounded-lg"
                    />

                    <div className="flex justify-between text-[10px] font-semibold text-slate-400">
                      <span>{param.minLabel}</span>
                      <span>{param.maxLabel}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardWrapper>
        </div>

        {/* Right Column: Scorecard Summary & Feedback Controls */}
        <div className="lg:col-span-5 space-y-5 lg:sticky lg:top-20">
          {/* Scorecard Aggregate Summary Box */}
          <CardWrapper className="p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Aggregate Candidate Score
                </span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-3xl font-black text-slate-900 tracking-tight">
                    {aggregateScore}
                  </span>
                  <span className="text-xs text-slate-400 font-bold">/ 5.0</span>
                  <span className="ml-2.5 text-xs font-extrabold text-[#1E40AF]">
                    ({percentageScore}%)
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Recommendation
                </span>
                <span
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg border inline-block shadow-2xs ${
                    recommendation.includes('Recommend')
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}
                >
                  {recommendation}
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden border border-slate-200/80 p-0.5">
              <div
                className="bg-gradient-to-r from-[#1E40AF] to-blue-500 h-full rounded-full transition-all duration-300 shadow-2xs"
                style={{ width: `${percentageScore}%` }}
              />
            </div>
          </CardWrapper>

          {/* Feedback Tags Container */}
          <CardWrapper className="p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-blue-50 text-[#1E40AF] border border-blue-100">
                  <Tag className="w-4 h-4" />
                </span>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Quick Feedback Tags
                </h3>
              </div>
              <Badge variant="blue">{selectedTags.length} Selected</Badge>
            </div>

            {/* Tag Pool */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Select Feedback Tags:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {availableTags.map((tag) => {
                  const isSelected = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleToggleTag(tag)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#1E40AF] text-white border-[#1E40AF] shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      {isSelected ? (
                        <Check className="w-3.5 h-3.5 text-white" />
                      ) : (
                        <Plus className="w-3.5 h-3.5 text-slate-400" />
                      )}
                      <span>{tag}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Detailed Remarks */}
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider">
                Assessment Remarks & Notes
              </label>
              <textarea
                rows={4}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Enter detailed evaluation notes regarding candidate performance..."
                className="w-full bg-slate-50/80 text-slate-900 placeholder:text-slate-400 border border-slate-200 rounded-xl p-3 focus:outline-none focus:border-[#1E40AF] focus:bg-white text-xs resize-none transition-all leading-relaxed shadow-2xs font-medium"
              />
            </div>
          </CardWrapper>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              icon={Save}
              disabled={isSubmitting}
              onClick={handleSaveDraft}
              className="w-full justify-center py-2.5 rounded-xl font-bold"
            >
              {isSubmitting ? 'Saving...' : 'Save Draft'}
            </Button>

            <Button
              variant="primary"
              icon={CheckCircle2}
              disabled={isSubmitting}
              onClick={handleSubmitEvaluation}
              className="w-full justify-center py-2.5 rounded-xl font-bold"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Evaluation'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function EvaluationScorecardPage() {
  return (
    <ProtectedRoute requiredPermission={PERMISSIONS.INDUCTION_EVALUATE}>
      <Suspense fallback={<div className="p-6 text-sm text-slate-500">Loading evaluation scorecard...</div>}>
        <EvaluationContent />
      </Suspense>
    </ProtectedRoute>
  );
}
