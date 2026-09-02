"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { authClient } from "@/authClient";
import { Users, ShieldAlert, Check, X, ArrowRight, UserPlus, Search, Loader2 } from "lucide-react";
import Link from "next/link";

type Team = {
  id: string;
  name: string;
  _count?: { members: number };
  members?: any[];
};

type JoinRequest = {
  id: string;
  teamId: string;
  status: string;
  team?: Team;
  participant?: {
    user: { id: string; name: string; email: string };
  };
};

export default function RegisterPage() {
  const { eventId } = useParams() as { eventId: string };
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  const [loading, setLoading] = useState(true);
  const [myTeam, setMyTeam] = useState<Team | null>(null);
  const [myRequests, setMyRequests] = useState<JoinRequest[]>([]);
  const [allTeams, setAllTeams] = useState<Team[]>([]);
  
  // Dashboard state
  const [teamRequests, setTeamRequests] = useState<JoinRequest[]>([]);
  
  // Form states
  const [view, setView] = useState<"SELECT" | "CREATE" | "JOIN">("SELECT");
  const [createName, setCreateName] = useState("");
  const [searchTeam, setSearchTeam] = useState("");

  useEffect(() => {
    if (isPending) return;
    if (!session?.user) {
      router.push("/login");
      return;
    }

    loadData();
  }, [session, isPending, eventId]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Check if user is in a team
      const resTeam = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/events/${eventId}/team`, {
        headers: { "Authorization": `Bearer ${session?.session.token}` },
        credentials: "include"
      });
      
      if (resTeam.ok) {
        const data = await resTeam.json();
        setMyTeam(data.team);
        
        // If in a team, fetch incoming join requests
        const resRequests = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/events/${eventId}/teams/${data.team.id}/join-requests`, {
          headers: { "Authorization": `Bearer ${session?.session.token}` },
          credentials: "include"
        });
        if (resRequests.ok) {
          const reqData = await resRequests.json();
          setTeamRequests(reqData.requests);
        }
      } else {
        // Not in a team, fetch my sent requests
        const resSent = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/events/${eventId}/join-requests/me`, {
          headers: { "Authorization": `Bearer ${session?.session.token}` },
          credentials: "include"
        });
        if (resSent.ok) {
          const sentData = await resSent.json();
          setMyRequests(sentData.requests);
        }
        
        // Fetch all teams for the join dropdown
        const resAll = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/events/${eventId}/teams`, {
          headers: { "Authorization": `Bearer ${session?.session.token}` },
          credentials: "include"
        });
        if (resAll.ok) {
          const allData = await resAll.json();
          setAllTeams(allData.teams);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createName.trim()) return;
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/events/${eventId}/teams`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session?.session.token}` 
        },
        credentials: "include",
        body: JSON.stringify({ name: createName }),
      });
      
      if (res.ok) {
        loadData();
      } else {
        const error = await res.json();
        alert(error.error || "Failed to create team");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendJoinRequest = async (teamId: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/events/${eventId}/teams/${teamId}/join-requests`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${session?.session.token}` },
        credentials: "include"
      });
      
      if (res.ok) {
        loadData();
      } else {
        const error = await res.json();
        alert(error.error || "Failed to send request");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCancelRequest = async (requestId: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/events/${eventId}/join-requests/me/${requestId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${session?.session.token}` },
        credentials: "include"
      });
      if (res.ok) loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRespondRequest = async (teamId: string, requestId: string, status: "APPROVED" | "REJECTED") => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/events/${eventId}/teams/${teamId}/join-requests/${requestId}`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session?.session.token}` 
        },
        credentials: "include",
        body: JSON.stringify({ status }),
      });
      if (res.ok) loadData();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading || isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  //  ALREADY IN A TEAM (TEAM DASHBOARD)

  if (myTeam) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="mb-2">
            <Link href={`/${eventId}`} className="inline-flex items-center gap-2 text-zinc-500 hover:text-cyan-400 transition-colors text-sm font-medium">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
              Back to Dashboard
            </Link>
          </div>
          <div className="p-6 bg-zinc-900/50 border border-cyan-500/30 rounded-2xl backdrop-blur-xl">
            <h1 className="text-3xl font-bold text-cyan-400">
              {myTeam.name}
            </h1>
            <p className="text-zinc-400 mt-2">Team Dashboard</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Members List */}
            <div className="p-6 bg-zinc-900/30 border border-zinc-800 rounded-2xl">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-cyan-400" /> Members
              </h2>
              <div className="space-y-4">
                {myTeam.members?.map((m, idx) => (
                  <div key={m.id} className="flex items-center gap-3 p-3 bg-zinc-950 rounded-xl border border-zinc-800">
                    <div className="w-10 h-10 rounded-full bg-cyan-950 flex items-center justify-center text-cyan-400 font-bold">
                      {m.user.name?.charAt(0).toUpperCase() || "?"}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-zinc-200">{m.user.name}</p>
                        {idx === 0 && (
                          <span className="px-1.5 py-0.5 bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-[9px] uppercase tracking-wider font-bold rounded flex items-center">
                            Leader
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-500">{m.user.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Incoming Requests */}
            <div className="p-6 bg-zinc-900/30 border border-zinc-800 rounded-2xl">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-green-400" /> Join Requests
              </h2>
              {teamRequests.length === 0 ? (
                <p className="text-zinc-500 italic">No pending requests.</p>
              ) : (
                <div className="space-y-4">
                  {teamRequests.map((req) => (
                    <div key={req.id} className="p-4 bg-zinc-950 rounded-xl border border-zinc-800 space-y-3">
                      <div>
                        <p className="font-medium text-zinc-200">{req.participant?.user.name}</p>
                        <p className="text-xs text-zinc-500">{req.participant?.user.email}</p>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleRespondRequest(myTeam.id, req.id, "APPROVED")}
                          className="flex-1 py-2 bg-green-500/10 text-green-400 hover:bg-green-500/20 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                        >
                          <Check className="w-4 h-4" /> Accept
                        </button>
                        <button 
                          onClick={() => handleRespondRequest(myTeam.id, req.id, "REJECTED")}
                          className="flex-1 py-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                        >
                          <X className="w-4 h-4" /> Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // PENDING REQUEST
  const pendingReq = myRequests.find((r) => r.status === "PENDING");
  if (pendingReq) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full mb-4">
          <Link href={`/${eventId}`} className="inline-flex items-center gap-2 text-zinc-500 hover:text-cyan-400 transition-colors text-sm font-medium">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            Back to Dashboard
          </Link>
        </div>
        <div className="max-w-md w-full p-8 bg-zinc-900/50 border border-cyan-500/30 rounded-3xl backdrop-blur-xl text-center space-y-6">
          <div className="w-16 h-16 bg-cyan-500/10 rounded-full flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-zinc-100">Request Pending</h2>
            <p className="text-zinc-400 mt-2">
              You have requested to join <span className="text-cyan-400 font-medium">{pendingReq.team?.name}</span>. 
              Waiting for team leader approval.
            </p>
          </div>
          <button 
            onClick={() => handleCancelRequest(pendingReq.id)}
            className="w-full py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl font-medium transition-colors"
          >
            Cancel Request
          </button>
        </div>
      </div>
    );
  }

  // REGISTER (SELECT / CREATE / JOIN) 
  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full mb-4">
        <Link href={`/${eventId}`} className="inline-flex items-center gap-2 text-zinc-500 hover:text-cyan-400 transition-colors text-sm font-medium">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          Back to Dashboard
        </Link>
      </div>
      <div className="max-w-md w-full p-8 bg-zinc-900/40 border border-zinc-800 rounded-3xl backdrop-blur-xl shadow-2xl">
        
        {view === "SELECT" && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-cyan-400">Event Registration</h1>
              <p className="text-zinc-400 mt-2">How would you like to participate?</p>
            </div>
            
            <button 
              onClick={() => setView("CREATE")}
              className="w-full group p-6 bg-zinc-950 border border-zinc-800 hover:border-cyan-500/50 rounded-2xl transition-all text-left flex items-center justify-between"
            >
              <div>
                <h3 className="text-lg font-semibold text-zinc-100 group-hover:text-cyan-400 transition-colors">Create a Team</h3>
                <p className="text-sm text-zinc-500 mt-1">Lead a new team and invite members</p>
              </div>
              <ArrowRight className="w-5 h-5 text-zinc-600 group-hover:text-cyan-400 transition-colors" />
            </button>

            <button 
              onClick={() => setView("JOIN")}
              className="w-full group p-6 bg-zinc-950 border border-zinc-800 hover:border-green-500/50 rounded-2xl transition-all text-left flex items-center justify-between"
            >
              <div>
                <h3 className="text-lg font-semibold text-zinc-100 group-hover:text-green-400 transition-colors">Join a Team</h3>
                <p className="text-sm text-zinc-500 mt-1">Search and apply to an existing team</p>
              </div>
              <ArrowRight className="w-5 h-5 text-zinc-600 group-hover:text-green-400 transition-colors" />
            </button>
          </div>
        )}

        {view === "CREATE" && (
          <form onSubmit={handleCreateTeam} className="space-y-6">
            <button type="button" onClick={() => setView("SELECT")} className="text-sm text-zinc-500 hover:text-cyan-400 mb-4 inline-block">
              ← Back
            </button>
            <div>
              <h2 className="text-2xl font-bold text-zinc-100">Create Team</h2>
              <p className="text-zinc-400 text-sm mt-1">Choose a unique name for your squad.</p>
            </div>
            <input 
              type="text" 
              placeholder="Team Name" 
              value={createName}
              onChange={(e) => setCreateName(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-200 focus:outline-none focus:border-cyan-500/50 transition-colors"
              required
            />
            <button type="submit" className="w-full py-3 bg-gradient-to-r from-cyan-500 to-green-500 text-black rounded-xl font-semibold hover:opacity-90 transition-opacity">
              Create Team
            </button>
          </form>
        )}

        {view === "JOIN" && (
          <div className="space-y-6">
            <button type="button" onClick={() => setView("SELECT")} className="text-sm text-zinc-500 hover:text-green-400 mb-4 inline-block">
              ← Back
            </button>
            <div>
              <h2 className="text-2xl font-bold text-zinc-100">Join Team</h2>
              <p className="text-zinc-400 text-sm mt-1">Search for an existing team to join.</p>
            </div>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input 
                type="text" 
                placeholder="Search teams..." 
                value={searchTeam}
                onChange={(e) => setSearchTeam(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-zinc-200 focus:outline-none focus:border-green-500/50 transition-colors"
              />
            </div>

            <div className="max-h-60 overflow-y-auto space-y-3 pr-2">
              {allTeams
                .filter(t => t.name.toLowerCase().includes(searchTeam.toLowerCase()))
                .map((team) => (
                  <div key={team.id} className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-zinc-200">{team.name}</h4>
                      <p className="text-xs text-zinc-500">{team._count?.members || 0} Members</p>
                    </div>
                    <button 
                      onClick={() => handleSendJoinRequest(team.id)}
                      className="px-4 py-1.5 bg-green-500/10 text-green-400 hover:bg-green-500/20 rounded-lg text-sm font-medium transition-colors"
                    >
                      Request
                    </button>
                  </div>
                ))}
              {allTeams.length === 0 && (
                <p className="text-center text-zinc-500 text-sm py-4">No teams available.</p>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
