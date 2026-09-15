"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { fetchApi } from "../../../lib/api";
import {
  BookOpen,
  Lock,
  Unlock,
  Package,
  History,
  Check,
  X,
  Plus,
  Minus,
  RotateCcw,
  QrCode,
  ArrowUpRight,
  ArrowDownLeft,
  AlertCircle,
  Clock,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";

interface Resource {
  id: string;
  name: string;
  type: string;
  description: string | null;
  totalQuantity: number;
  availableQuantity: number;
}

interface TeamResource {
  id: string;
  teamId: string;
  resourceId: string;
  status: string;
  quantity: number;
  acquiredAt: string | null;
  releasedAt: string | null;
  unlockedAt: string;
  resource: Resource;
}

interface Activity {
  id: string;
  action: "SCAN" | "ACCEPT" | "REJECT" | "ACQUIRE" | "RELEASE";
  createdAt: string;
  quantity: number | null;
  metadata?: any;
  resource?: { id: string; name: string; type: string } | null;
  user?: { id: string; name: string; email: string } | null;
}

export default function ResourceInventoryPage() {
  const { eventId } = useParams() as { eventId: string };

  const [resources, setResources] = useState<TeamResource[]>([]);
  const [timeline, setTimeline] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [actionFeedback, setActionFeedback] = useState<{ id: string; message: string; type: "success" | "error" } | null>(null);

  // Quantity input states per resource: { [resourceId]: number }
  const [acquireQty, setAcquireQty] = useState<{ [id: string]: number }>({});
  const [releaseQty, setReleaseQty] = useState<{ [id: string]: number }>({});

  const loadData = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);
    setError(null);

    try {
      const [teamRes, timelineRes] = await Promise.all([
        fetchApi(`/events/${eventId}/team`),
        fetchApi(`/events/${eventId}/resources/timeline`).catch(() => ({ activities: [] })),
      ]);

      const teamResources: TeamResource[] = teamRes?.team?.resources || [];
      setResources(teamResources);
      setTimeline(timelineRes?.activities || []);

      // Initialize quantity selectors
      const initAcquire: { [id: string]: number } = {};
      const initRelease: { [id: string]: number } = {};
      teamResources.forEach((tr) => {
        initAcquire[tr.resourceId] = 1;
        initRelease[tr.resourceId] = tr.quantity > 0 ? tr.quantity : 1;
      });
      setAcquireQty((prev) => ({ ...initAcquire, ...prev }));
      setReleaseQty((prev) => ({ ...initRelease, ...prev }));
    } catch (err: any) {
      setError(err.message || "Failed to load resources and activity timeline");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [eventId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAction = async (
    resourceId: string,
    action: "accept" | "reject" | "acquire" | "release",
    bodyPayload?: Record<string, any>
  ) => {
    setActionLoading(`${resourceId}-${action}`);
    setActionFeedback(null);

    try {
      await fetchApi(`/events/${eventId}/resources/${resourceId}/${action}`, {
        method: "POST",
        body: JSON.stringify(bodyPayload || {}),
      });

      setActionFeedback({
        id: resourceId,
        message: `Successfully executed ${action.toUpperCase()}`,
        type: "success",
      });

      // Reload resources and persistent timeline from backend
      await loadData(true);
    } catch (err: any) {
      setActionFeedback({
        id: resourceId,
        message: err.message || `Failed to ${action} resource`,
        type: "error",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACQUIRED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider rounded-full shadow-[0_0_10px_rgba(16,185,129,0.15)]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Acquired
          </span>
        );
      case "ACCEPTED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold uppercase tracking-wider rounded-full">
            <Check className="w-3.5 h-3.5" />
            Accepted
          </span>
        );
      case "UNLOCKED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold uppercase tracking-wider rounded-full">
            <Unlock className="w-3.5 h-3.5" />
            Unlocked
          </span>
        );
      case "RELEASED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-bold uppercase tracking-wider rounded-full">
            <RotateCcw className="w-3.5 h-3.5" />
            Released
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold uppercase tracking-wider rounded-full">
            <X className="w-3.5 h-3.5" />
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-zinc-800 text-zinc-400 text-xs font-bold uppercase tracking-wider rounded-full">
            {status}
          </span>
        );
    }
  };

  const getActionBadge = (action: string) => {
    switch (action) {
      case "SCAN":
        return {
          icon: <QrCode className="w-3.5 h-3.5" />,
          color: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
          label: "QR Scanned",
        };
      case "ACCEPT":
        return {
          icon: <Check className="w-3.5 h-3.5" />,
          color: "bg-blue-500/10 text-blue-400 border-blue-500/30",
          label: "Accepted",
        };
      case "REJECT":
        return {
          icon: <X className="w-3.5 h-3.5" />,
          color: "bg-rose-500/10 text-rose-400 border-rose-500/30",
          label: "Rejected",
        };
      case "ACQUIRE":
        return {
          icon: <ArrowDownLeft className="w-3.5 h-3.5" />,
          color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
          label: "Acquired",
        };
      case "RELEASE":
        return {
          icon: <ArrowUpRight className="w-3.5 h-3.5" />,
          color: "bg-purple-500/10 text-purple-400 border-purple-500/30",
          label: "Released",
        };
      default:
        return {
          icon: <Clock className="w-3.5 h-3.5" />,
          color: "bg-zinc-800 text-zinc-300 border-zinc-700",
          label: action,
        };
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="inline-block p-4 rounded-full bg-cyan-500/10 text-cyan-400 mb-4 animate-spin">
          <RefreshCw className="w-8 h-8" />
        </div>
        <p className="text-zinc-400 font-mono text-sm">Loading resources & activity timeline...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto my-12 p-6 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-center">
        <AlertCircle className="w-10 h-10 mx-auto mb-3" />
        <h3 className="font-bold text-lg mb-1">Error Loading Resources</h3>
        <p className="text-sm mb-4">{error}</p>
        <button
          onClick={() => loadData()}
          className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-xl text-sm font-medium transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-zinc-800/80">
        <div>
          <div className="mb-3">
            <Link
              href={`/${eventId}`}
              className="inline-flex items-center gap-2 text-zinc-500 hover:text-cyan-400 transition-colors text-sm font-medium"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m15 18-6-6 6-6" />
              </svg>
              Back to Dashboard
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded-2xl shadow-[0_0_20px_rgba(6,182,212,0.15)]">
              <Package className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-zinc-100 tracking-tight">Resource Management</h1>
              <p className="text-zinc-500 font-mono text-sm mt-0.5">
                Manage your team inventory, hardware allocations, and view real-time activity
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => loadData(true)}
          disabled={refreshing}
          className="self-start md:self-auto inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white rounded-xl text-sm font-medium transition-all shadow-sm active:scale-95 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin text-cyan-400" : ""}`} />
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* Main Grid: Left is My Resources, Right is Activity Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT 2 COLS: MY RESOURCES */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-cyan-400" />
              <h2 className="text-xl font-bold text-zinc-100">My Team Resources</h2>
            </div>
            <span className="text-xs text-zinc-500 font-mono">
              {resources.length} {resources.length === 1 ? "Item" : "Items"} Unlocked
            </span>
          </div>

          {resources.length === 0 ? (
            <div className="text-center py-16 bg-zinc-900/40 rounded-3xl border border-zinc-800 border-dashed backdrop-blur-sm">
              <Lock className="w-12 h-12 text-zinc-700 mx-auto mb-4 drop-shadow-[0_0_10px_rgba(0,0,0,0.5)]" />
              <h3 className="text-lg font-medium text-zinc-300">No resources unlocked yet</h3>
              <p className="text-zinc-500 mt-1 max-w-sm mx-auto text-sm">
                Scan checkpoints during the event to earn points and unlock hints, hardware, and components!
              </p>
              <div className="mt-6">
                <Link
                  href={`/${eventId}/scan`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-semibold rounded-xl text-sm transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)]"
                >
                  <QrCode className="w-4 h-4" />
                  Scan Checkpoints
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {resources.map((tr) => {
                const isAcquired = tr.status === "ACQUIRED" || tr.quantity > 0;
                const isUnlocked = tr.status === "UNLOCKED";
                const isAccepted = tr.status === "ACCEPTED";
                const isRejected = tr.status === "REJECTED";
                const feedback = actionFeedback?.id === tr.resourceId ? actionFeedback : null;

                const curAcquireQty = acquireQty[tr.resourceId] || 1;
                const curReleaseQty = releaseQty[tr.resourceId] || Math.max(1, tr.quantity);

                return (
                  <div
                    key={tr.id}
                    className="bg-zinc-900/40 border border-zinc-800/80 hover:border-zinc-700 rounded-3xl p-6 shadow-xl backdrop-blur-sm transition-all duration-300 relative overflow-hidden"
                  >
                    {/* Background subtle glow */}
                    <div
                      className={`absolute top-0 right-0 w-72 h-72 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20 opacity-10 ${
                        isAcquired ? "bg-emerald-500" : isAccepted ? "bg-blue-500" : "bg-cyan-500"
                      }`}
                    />

                    {/* Top Row: Type & Status */}
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-3 relative z-10">
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 bg-zinc-800/80 border border-zinc-700/60 text-zinc-300 text-xs font-bold uppercase tracking-wider rounded-lg">
                          {tr.resource?.type || "RESOURCE"}
                        </span>
                        {getStatusBadge(tr.status)}
                      </div>

                      {/* Stock availability indicator */}
                      <div className="text-xs font-mono text-zinc-400 bg-zinc-950/60 px-3 py-1 rounded-lg border border-zinc-800">
                        Stock:{" "}
                        <span className="text-zinc-200 font-semibold">
                          {tr.resource?.availableQuantity ?? 0}
                        </span>{" "}
                        / {tr.resource?.totalQuantity ?? 0}
                      </div>
                    </div>

                    {/* Resource Name & Description */}
                    <div className="relative z-10 mb-4">
                      <h3 className="text-xl font-bold text-zinc-100 mb-1.5">{tr.resource?.name}</h3>
                      {tr.resource?.description && (
                        <p className="text-zinc-400 text-sm leading-relaxed">{tr.resource.description}</p>
                      )}
                    </div>

                    {/* Allocation & Time Info Box */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3.5 bg-zinc-950/50 rounded-2xl border border-zinc-800/60 mb-5 text-xs font-mono relative z-10">
                      <div>
                        <span className="text-zinc-500 block mb-0.5">Quantity Held</span>
                        <span
                          className={`text-base font-bold ${
                            tr.quantity > 0 ? "text-emerald-400" : "text-zinc-400"
                          }`}
                        >
                          {tr.quantity} {tr.quantity === 1 ? "unit" : "units"}
                        </span>
                      </div>
                      <div>
                        <span className="text-zinc-500 block mb-0.5">Unlocked</span>
                        <span className="text-zinc-300">
                          {new Date(tr.unlockedAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <div className="col-span-2 sm:col-span-1">
                        <span className="text-zinc-500 block mb-0.5">
                          {tr.acquiredAt ? "Last Acquired" : "Status"}
                        </span>
                        <span className="text-zinc-300">
                          {tr.acquiredAt
                            ? new Date(tr.acquiredAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : tr.status}
                        </span>
                      </div>
                    </div>

                    {/* Inline Action Feedback */}
                    {feedback && (
                      <div
                        className={`mb-4 p-3 rounded-xl text-xs font-mono flex items-center gap-2 ${
                          feedback.type === "success"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                        }`}
                      >
                        {feedback.type === "success" ? (
                          <Check className="w-4 h-4 flex-shrink-0" />
                        ) : (
                          <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        )}
                        <span>{feedback.message}</span>
                      </div>
                    )}

                    {/* Action Controls */}
                    <div className="relative z-10 pt-2 border-t border-zinc-800/60">
                      {/* STATE 1: UNLOCKED -> Prompt to Accept or Reject */}
                      {isUnlocked && (
                        <div className="flex flex-wrap items-center gap-3">
                          <button
                            onClick={() => handleAction(tr.resourceId, "accept")}
                            disabled={actionLoading !== null}
                            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold transition-all shadow-[0_0_15px_rgba(37,99,235,0.2)] disabled:opacity-50"
                          >
                            <Check className="w-4 h-4" />
                            {actionLoading === `${tr.resourceId}-accept` ? "Accepting..." : "Accept Resource"}
                          </button>
                          <button
                            onClick={() => handleAction(tr.resourceId, "reject")}
                            disabled={actionLoading !== null}
                            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-zinc-800/80 hover:bg-rose-500/20 hover:text-rose-400 text-zinc-400 border border-zinc-700/60 rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
                          >
                            <X className="w-4 h-4" />
                            {actionLoading === `${tr.resourceId}-reject` ? "Rejecting..." : "Reject"}
                          </button>
                        </div>
                      )}

                      {/* STATE 2: REJECTED -> Option to Accept if mind changed */}
                      {isRejected && (
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-xs text-rose-400/80 font-mono">
                            Resource rejected. You can reconsider and accept it.
                          </span>
                          <button
                            onClick={() => handleAction(tr.resourceId, "accept")}
                            disabled={actionLoading !== null}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 rounded-xl text-xs font-semibold transition-all disabled:opacity-50"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            Accept Now
                          </button>
                        </div>
                      )}

                      {/* STATE 3: ACCEPTED / ACQUIRED / RELEASED -> Can Acquire and Release */}
                      {(isAccepted || isAcquired || tr.status === "RELEASED") && (
                        <div className="space-y-3">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {/* ACQUIRE CONTROLLER */}
                            <div className="bg-zinc-950/40 p-3 rounded-2xl border border-zinc-800/80 space-y-2">
                              <span className="text-xs text-zinc-400 font-medium flex items-center justify-between">
                                <span>Acquire Units</span>
                                <span className="text-zinc-500 font-mono text-[11px]">
                                  Avail: {tr.resource?.availableQuantity ?? 0}
                                </span>
                              </span>
                              <div className="flex items-center gap-2">
                                <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
                                  <button
                                    onClick={() =>
                                      setAcquireQty((prev) => ({
                                        ...prev,
                                        [tr.resourceId]: Math.max(1, (prev[tr.resourceId] || 1) - 1),
                                      }))
                                    }
                                    className="px-2.5 py-1 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                                  >
                                    -
                                  </button>
                                  <span className="px-3 py-1 text-xs font-mono font-bold text-zinc-200 min-w-[28px] text-center">
                                    {curAcquireQty}
                                  </span>
                                  <button
                                    onClick={() =>
                                      setAcquireQty((prev) => ({
                                        ...prev,
                                        [tr.resourceId]: (prev[tr.resourceId] || 1) + 1,
                                      }))
                                    }
                                    className="px-2.5 py-1 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                                  >
                                    +
                                  </button>
                                </div>
                                <button
                                  onClick={() =>
                                    handleAction(tr.resourceId, "acquire", { quantity: curAcquireQty })
                                  }
                                  disabled={
                                    actionLoading !== null ||
                                    (tr.resource?.availableQuantity ?? 0) < curAcquireQty ||
                                    (tr.resource?.availableQuantity ?? 0) <= 0
                                  }
                                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)] disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                  {actionLoading === `${tr.resourceId}-acquire` ? "Acquiring..." : "Acquire"}
                                </button>
                              </div>
                            </div>

                            {/* RELEASE CONTROLLER */}
                            <div className="bg-zinc-950/40 p-3 rounded-2xl border border-zinc-800/80 space-y-2">
                              <span className="text-xs text-zinc-400 font-medium flex items-center justify-between">
                                <span>Release Units</span>
                                <span className="text-zinc-500 font-mono text-[11px]">
                                  Held: {tr.quantity}
                                </span>
                              </span>
                              <div className="flex items-center gap-2">
                                <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
                                  <button
                                    onClick={() =>
                                      setReleaseQty((prev) => ({
                                        ...prev,
                                        [tr.resourceId]: Math.max(1, (prev[tr.resourceId] || 1) - 1),
                                      }))
                                    }
                                    className="px-2.5 py-1 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                                  >
                                    -
                                  </button>
                                  <span className="px-3 py-1 text-xs font-mono font-bold text-zinc-200 min-w-[28px] text-center">
                                    {curReleaseQty}
                                  </span>
                                  <button
                                    onClick={() =>
                                      setReleaseQty((prev) => ({
                                        ...prev,
                                        [tr.resourceId]: Math.min(
                                          tr.quantity,
                                          (prev[tr.resourceId] || 1) + 1
                                        ),
                                      }))
                                    }
                                    className="px-2.5 py-1 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                                  >
                                    +
                                  </button>
                                </div>
                                <button
                                  onClick={() =>
                                    handleAction(tr.resourceId, "release", { quantity: curReleaseQty })
                                  }
                                  disabled={
                                    actionLoading !== null ||
                                    tr.quantity <= 0 ||
                                    curReleaseQty > tr.quantity
                                  }
                                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-semibold transition-all shadow-[0_0_15px_rgba(168,85,247,0.2)] disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                  <Minus className="w-3.5 h-3.5" />
                                  {actionLoading === `${tr.resourceId}-release` ? "Releasing..." : "Release"}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* RIGHT 1 COL: ACTIVITY TIMELINE */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-cyan-400" />
              <h2 className="text-xl font-bold text-zinc-100">Activity Timeline</h2>
            </div>
            <span className="text-xs text-zinc-500 font-mono">
              {timeline.length} {timeline.length === 1 ? "Event" : "Events"}
            </span>
          </div>

          <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-3xl p-6 backdrop-blur-sm shadow-xl">
            {timeline.length === 0 ? (
              <div className="text-center py-12 text-zinc-500 font-mono text-xs">
                <Clock className="w-8 h-8 mx-auto mb-2 text-zinc-700" />
                No activity recorded yet.
                <p className="text-[11px] text-zinc-600 mt-1">Actions like QR scans, acquires, and releases will appear here.</p>
              </div>
            ) : (
              <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gradient-to-b before:from-cyan-500/50 before:via-blue-500/30 before:to-zinc-800">
                {timeline.map((act) => {
                  const badge = getActionBadge(act.action);
                  const timeStr = new Date(act.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  });
                  const dateStr = new Date(act.createdAt).toLocaleDateString([], {
                    month: "short",
                    day: "numeric",
                  });

                  return (
                    <div key={act.id} className="relative group">
                      {/* Timeline dot */}
                      <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-zinc-950 border-2 border-cyan-500 flex items-center justify-center shadow-[0_0_10px_rgba(6,182,212,0.4)] group-hover:scale-110 transition-transform">
                        <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                      </div>

                      <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-2xl p-3.5 hover:border-zinc-700 transition-all">
                        {/* Header: Action Badge & Time */}
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider border ${badge.color}`}
                          >
                            {badge.icon}
                            {badge.label}
                          </span>
                          <span className="text-[11px] font-mono text-zinc-500" title={dateStr}>
                            {timeStr}
                          </span>
                        </div>

                        {/* Details */}
                        <div className="text-xs text-zinc-200">
                          {act.action === "SCAN" && (
                            <span className="text-zinc-300">
                              Scanned {act.metadata?.checkpointName || "Checkpoint"}
                              {act.metadata?.pointsAwarded ? (
                                <span className="text-cyan-400 font-semibold ml-1">
                                  (+{act.metadata.pointsAwarded} pts)
                                </span>
                              ) : null}
                            </span>
                          )}

                          {act.action === "ACQUIRE" && (
                            <span className="text-emerald-400 font-medium">
                              Acquired {act.quantity ?? 1} × {act.resource?.name || act.metadata?.resourceName || "Resource"}
                            </span>
                          )}

                          {act.action === "RELEASE" && (
                            <span className="text-purple-400 font-medium">
                              Released {act.quantity ?? 1} × {act.resource?.name || act.metadata?.resourceName || "Resource"}
                            </span>
                          )}

                          {act.action === "ACCEPT" && (
                            <span className="text-blue-400 font-medium">
                              Accepted {act.resource?.name || act.metadata?.resourceName || "Resource"}
                            </span>
                          )}

                          {act.action === "REJECT" && (
                            <span className="text-rose-400 font-medium">
                              Rejected {act.resource?.name || act.metadata?.resourceName || "Resource"}
                            </span>
                          )}
                        </div>

                        {/* Actor user if available */}
                        {act.user?.name && (
                          <div className="mt-1 text-[10px] font-mono text-zinc-500">
                            by {act.user.name}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
