"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import { fetchApi } from "../../../lib/api";
import {
  Activity,
  Layers,
  Users,
  QrCode,
  Package,
  Clock,
  RefreshCw,
  Check,
  X,
  ArrowDownLeft,
  ArrowUpRight,
  TrendingUp,
  Boxes,
  ShieldAlert,
  Radio,
  Play,
  Pause,
} from "lucide-react";
import Link from "next/link";

interface StockItem {
  id: string;
  name: string;
  type: string;
  description: string | null;
  totalQuantity: number;
  availableQuantity: number;
  allocatedQuantity: number;
  active: boolean;
}

interface TeamAllocationItem {
  resourceId: string;
  resourceName: string;
  resourceType: string;
  quantity: number;
  status: string;
  acquiredAt: string | null;
  releasedAt: string | null;
}

interface TeamAllocation {
  teamId: string;
  teamName: string;
  totalPoints: number;
  allocations: TeamAllocationItem[];
}

interface ActivityLogItem {
  id: string;
  action: "SCAN" | "ACCEPT" | "REJECT" | "ACQUIRE" | "RELEASE";
  createdAt: string;
  quantity: number | null;
  team: { id: string; name: string } | null;
  user: { id: string; name: string; email: string } | null;
  resource: { id: string; name: string; type: string } | null;
  checkpointId: string | null;
  metadata?: any;
}

interface LiveData {
  totalTeams: number;
  totalScans: number;
  teams: Array<{
    id: string;
    name: string;
    points: number;
    progress: number;
    totalCheckpoints: number;
    resources: Array<{ name: string; type: string; quantity: number; status: string }>;
  }>;
  stock: StockItem[];
  teamAllocations: TeamAllocation[];
  activityLog: ActivityLogItem[];
}

export default function LiveDashboardPage() {
  const { eventId } = useParams() as { eventId: string };

  const [data, setData] = useState<LiveData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Real-time polling state (every 3.5s)
  const [autoPoll, setAutoPoll] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [filterAction, setFilterAction] = useState<string>("ALL");

  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchLiveData = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);

    try {
      const res = await fetchApi(`/events/${eventId}/live`);
      setData(res);
      setLastUpdated(new Date());
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to load live event dashboard");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [eventId]);

  useEffect(() => {
    fetchLiveData();
  }, [fetchLiveData]);

  // Polling mechanism
  useEffect(() => {
    if (autoPoll) {
      pollIntervalRef.current = setInterval(() => {
        fetchLiveData(true);
      }, 3500);
    } else if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
    }

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [autoPoll, fetchLiveData]);

  const getActionBadge = (action: string) => {
    switch (action) {
      case "SCAN":
        return {
          icon: <QrCode className="w-3 h-3" />,
          color: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
          label: "SCAN",
        };
      case "ACCEPT":
        return {
          icon: <Check className="w-3 h-3" />,
          color: "bg-blue-500/10 text-blue-400 border-blue-500/30",
          label: "ACCEPT",
        };
      case "REJECT":
        return {
          icon: <X className="w-3 h-3" />,
          color: "bg-rose-500/10 text-rose-400 border-rose-500/30",
          label: "REJECT",
        };
      case "ACQUIRE":
        return {
          icon: <ArrowDownLeft className="w-3 h-3" />,
          color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
          label: "ACQUIRE",
        };
      case "RELEASE":
        return {
          icon: <ArrowUpRight className="w-3 h-3" />,
          color: "bg-purple-500/10 text-purple-400 border-purple-500/30",
          label: "RELEASE",
        };
      default:
        return {
          icon: <Activity className="w-3 h-3" />,
          color: "bg-zinc-800 text-zinc-300 border-zinc-700",
          label: action,
        };
    }
  };

  const filteredActivities = (data?.activityLog || []).filter((act) => {
    if (filterAction === "ALL") return true;
    return act.action === filterAction;
  });

  if (loading && !data) {
    return (
      <div className="py-24 text-center">
        <div className="inline-block p-4 rounded-full bg-cyan-500/10 text-cyan-400 mb-4 animate-spin">
          <RefreshCw className="w-8 h-8" />
        </div>
        <p className="text-zinc-400 font-mono text-sm">Connecting to event live dashboard feed...</p>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="max-w-2xl mx-auto my-12 p-6 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-center">
        <ShieldAlert className="w-10 h-10 mx-auto mb-3" />
        <h3 className="font-bold text-lg mb-1">Live Dashboard Error</h3>
        <p className="text-sm mb-4">{error}</p>
        <button
          onClick={() => fetchLiveData()}
          className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-xl text-sm font-medium transition-colors"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Top Banner & Live Status Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-zinc-800/80">
        <div>
          <div className="mb-2">
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
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl shadow-[0_0_20px_rgba(16,185,129,0.2)]">
              <Radio className="w-7 h-7 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-3xl font-extrabold text-zinc-100 tracking-tight">Live Dashboard</h1>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  LIVE
                </span>
              </div>
              <p className="text-zinc-500 font-mono text-xs mt-1">
                Real-time stock depletion, team allocations & audit stream
              </p>
            </div>
          </div>
        </div>

        {/* Polling Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="text-xs font-mono text-zinc-500 bg-zinc-900/80 border border-zinc-800 px-3 py-1.5 rounded-xl">
            Updated: {lastUpdated ? lastUpdated.toLocaleTimeString() : "—"}
          </div>

          <button
            onClick={() => setAutoPoll(!autoPoll)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-medium border transition-all ${
              autoPoll
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
                : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200"
            }`}
          >
            {autoPoll ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            {autoPoll ? "Auto-Sync ON (3s)" : "Auto-Sync PAUSED"}
          </button>

          <button
            onClick={() => fetchLiveData(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white rounded-xl text-xs font-medium transition-all active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-cyan-400" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-5 backdrop-blur-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider">Total Teams</span>
            <Users className="w-5 h-5 text-cyan-400" />
          </div>
          <div className="text-3xl font-black text-zinc-100">{data?.totalTeams || 0}</div>
          <div className="text-[11px] text-zinc-500 font-mono mt-1">Participating groups</div>
        </div>

        <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-5 backdrop-blur-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider">Total Scans</span>
            <QrCode className="w-5 h-5 text-indigo-400" />
          </div>
          <div className="text-3xl font-black text-zinc-100">{data?.totalScans || 0}</div>
          <div className="text-[11px] text-zinc-500 font-mono mt-1">Checkpoint checks</div>
        </div>

        <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-5 backdrop-blur-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider">Tracked Resources</span>
            <Boxes className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-zinc-100">{data?.stock?.length || 0}</div>
          <div className="text-[11px] text-zinc-500 font-mono mt-1">Items in event pool</div>
        </div>

        <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-5 backdrop-blur-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider">Audit Trail</span>
            <Activity className="w-5 h-5 text-amber-400" />
          </div>
          <div className="text-3xl font-black text-zinc-100">{data?.activityLog?.length || 0}</div>
          <div className="text-[11px] text-zinc-500 font-mono mt-1">Logged event actions</div>
        </div>
      </div>

      {/* SECTION A: LIVE RESOURCE STOCK */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-cyan-400" />
            <h2 className="text-xl font-bold text-zinc-100">Live Resource Stock</h2>
          </div>
          <span className="text-xs text-zinc-500 font-mono">Real-time inventory levels</span>
        </div>

        {(!data?.stock || data.stock.length === 0) ? (
          <div className="bg-zinc-900/30 border border-zinc-800 rounded-2xl p-8 text-center text-zinc-500 font-mono text-sm">
            No resources registered for this event.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {data.stock.map((item) => {
              const total = Math.max(1, item.totalQuantity);
              const available = Math.max(0, item.availableQuantity);
              const percent = Math.min(100, Math.max(0, Math.round((available / total) * 100)));

              // Determine bar color
              let barColor = "bg-emerald-500";
              let textColor = "text-emerald-400";
              if (percent <= 20) {
                barColor = "bg-rose-500";
                textColor = "text-rose-400";
              } else if (percent <= 50) {
                barColor = "bg-amber-500";
                textColor = "text-amber-400";
              }

              return (
                <div
                  key={item.id}
                  className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-5 shadow-lg backdrop-blur-sm relative overflow-hidden"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <span className="inline-block px-2.5 py-0.5 bg-zinc-800 border border-zinc-700/60 text-zinc-300 text-[10px] font-bold uppercase tracking-wider rounded-md mb-1.5">
                        {item.type}
                      </span>
                      <h3 className="font-bold text-zinc-100 text-lg leading-tight">{item.name}</h3>
                    </div>
                    <div className="text-right">
                      <div className={`text-xl font-mono font-black ${textColor}`}>
                        {available}{" "}
                        <span className="text-xs font-normal text-zinc-500">/ {total}</span>
                      </div>
                      <div className="text-[10px] text-zinc-500 font-mono">Available</div>
                    </div>
                  </div>

                  {/* Stock progress bar */}
                  <div className="space-y-1.5 mt-4">
                    <div className="w-full h-2.5 bg-zinc-950 rounded-full overflow-hidden p-0.5 border border-zinc-800">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500">
                      <span>{percent}% Remaining</span>
                      <span>{item.allocatedQuantity} Allocated</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SECTION B & C: TEAM ALLOCATIONS & ACTIVITY LOG */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* SECTION B: TEAM ALLOCATIONS */}
        <div className="lg:col-span-1 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-400" />
              <h2 className="text-xl font-bold text-zinc-100">Team Allocations</h2>
            </div>
            <span className="text-xs text-zinc-500 font-mono">
              {data?.teamAllocations?.length || 0} Teams
            </span>
          </div>

          <div className="space-y-3 max-h-[620px] overflow-y-auto pr-1">
            {(!data?.teamAllocations || data.teamAllocations.length === 0) ? (
              <div className="bg-zinc-900/30 border border-zinc-800 rounded-2xl p-6 text-center text-zinc-500 font-mono text-xs">
                No team allocations recorded yet.
              </div>
            ) : (
              data.teamAllocations.map((team) => (
                <div
                  key={team.teamId}
                  className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-4 backdrop-blur-sm space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-zinc-200 text-sm">{team.teamName}</h3>
                    <span className="text-xs font-mono font-semibold text-cyan-400">
                      {team.totalPoints} pts
                    </span>
                  </div>

                  {team.allocations.length === 0 ? (
                    <div className="text-[11px] text-zinc-500 font-mono italic">
                      No active resources held
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {team.allocations.map((alloc, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-zinc-950 border border-zinc-800 rounded-lg text-xs font-mono"
                        >
                          <span className="text-zinc-300 font-medium">{alloc.resourceName}</span>
                          <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 font-bold text-[11px]">
                            ×{alloc.quantity}
                          </span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* SECTION C: REAL-TIME ACTIVITY LOG */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-amber-400" />
              <h2 className="text-xl font-bold text-zinc-100">Live Activity Feed</h2>
            </div>

            {/* Filter pills */}
            <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-xl border border-zinc-800 text-[11px] font-mono">
              {["ALL", "SCAN", "ACQUIRE", "RELEASE", "ACCEPT", "REJECT"].map((act) => (
                <button
                  key={act}
                  onClick={() => setFilterAction(act)}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${
                    filterAction === act
                      ? "bg-zinc-800 text-white font-bold"
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  {act}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-4 backdrop-blur-sm shadow-xl max-h-[620px] overflow-y-auto">
            {filteredActivities.length === 0 ? (
              <div className="text-center py-16 text-zinc-500 font-mono text-xs">
                <Clock className="w-8 h-8 mx-auto mb-2 text-zinc-700" />
                No matching activities found in audit log.
              </div>
            ) : (
              <div className="space-y-2.5">
                {filteredActivities.map((act) => {
                  const badge = getActionBadge(act.action);
                  const time = new Date(act.createdAt).toLocaleTimeString();

                  return (
                    <div
                      key={act.id}
                      className="bg-zinc-950/60 border border-zinc-800/70 hover:border-zinc-700 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono font-bold border ${badge.color}`}
                        >
                          {badge.icon}
                          {badge.label}
                        </span>

                        <div>
                          <div className="text-sm font-semibold text-zinc-200">
                            <span className="text-cyan-400 font-bold mr-2">
                              {act.team?.name || "Team"}
                            </span>
                            {act.action === "SCAN" && (
                              <span className="text-zinc-300">
                                Scanned {act.metadata?.checkpointName || "Checkpoint"}
                                {act.metadata?.pointsAwarded && (
                                  <span className="text-emerald-400 ml-1.5 font-mono text-xs font-bold">
                                    +{act.metadata.pointsAwarded} pts
                                  </span>
                                )}
                              </span>
                            )}
                            {act.action === "ACQUIRE" && (
                              <span className="text-emerald-300">
                                Acquired {act.quantity ?? 1} × {act.resource?.name || "Resource"}
                              </span>
                            )}
                            {act.action === "RELEASE" && (
                              <span className="text-purple-300">
                                Released {act.quantity ?? 1} × {act.resource?.name || "Resource"}
                              </span>
                            )}
                            {act.action === "ACCEPT" && (
                              <span className="text-blue-300">
                                Accepted {act.resource?.name || "Resource"}
                              </span>
                            )}
                            {act.action === "REJECT" && (
                              <span className="text-rose-300">
                                Rejected {act.resource?.name || "Resource"}
                              </span>
                            )}
                          </div>

                          {act.user?.name && (
                            <div className="text-[10px] text-zinc-500 font-mono">
                              Actor: {act.user.name} ({act.user.email})
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="text-right text-xs font-mono text-zinc-500 whitespace-nowrap self-end sm:self-auto">
                        {time}
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
