import React from "react";
import Link from "next/link";
import { Calendar, Users, Zap, Clock, ShieldCheck } from "lucide-react";

export interface EventType {
  id: string;
  name: string;
  slug: string;
  description?: string;
  type: string;
  status: string;
}

export function GamifiedEventCard({ event }: { event: EventType }) {
  // Determine card style based on status
  const isActive = ["ACTIVE", "BUILDING", "SUBMISSIONS_OPEN"].includes(event.status);
  const isPast = ["COMPLETED", "CANCELLED", "SUBMISSIONS_CLOSED"].includes(event.status);
  const isUpcoming = !isActive && !isPast; // DRAFT, REGISTRATION_OPEN, REGISTRATION_CLOSED

  let themeClass = "from-blue-500/10 to-cyan-500/10 border-blue-500/20";
  let badgeColor = "bg-blue-500/20 text-blue-400 border-blue-500/30";
  let glowClass = "group-hover:shadow-[0_0_30px_rgba(59,130,246,0.3)]";
  let iconColor = "text-blue-400";

  if (isActive) {
    themeClass = "from-green-500/10 to-emerald-500/10 border-green-500/30";
    badgeColor = "bg-green-500/20 text-green-400 border-green-500/30";
    glowClass = "group-hover:shadow-[0_0_30px_rgba(34,197,94,0.3)]";
    iconColor = "text-green-400";
  } else if (isPast) {
    themeClass = "from-gray-500/10 to-slate-500/10 border-gray-500/20 opacity-80 grayscale-[50%]";
    badgeColor = "bg-gray-500/20 text-gray-400 border-gray-500/30";
    glowClass = "group-hover:shadow-[0_0_20px_rgba(156,163,175,0.2)]";
    iconColor = "text-gray-400";
  }

  const TypeIcon = event.type === "HACKATHON" ? Zap : 
                   event.type === "TREASURE_HUNT" ? ShieldCheck : Calendar;

  const targetHref = isUpcoming ? `/${event.id}/register` : `/${event.id}`;

  return (
    <Link href={targetHref} className={`group relative block rounded-2xl border bg-gradient-to-br backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 ${themeClass} ${glowClass}`}>
      <div className="absolute inset-0 bg-black/40 rounded-2xl z-0"></div>
      
      {/* Decorative top border highlight */}
      <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

      <div className="relative z-10 p-6 flex flex-col h-full">
        <div className="flex justify-between items-start mb-4">
          <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border flex items-center gap-1.5 ${badgeColor}`}>
            <TypeIcon className="w-3 h-3" />
            {event.type.replace('_', ' ')}
          </div>
          
          <div className="flex gap-1 items-center">
            {isActive && <span className="flex w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_#22c55e] animate-pulse"></span>}
            <span className={`text-xs font-medium uppercase tracking-wider ${iconColor}`}>
              {event.status.replace('_', ' ')}
            </span>
          </div>
        </div>

        <h3 className="text-xl font-bold text-zinc-100 mb-2 group-hover:text-cyan-400 transition-colors">
          {event.name}
        </h3>
        
        <p className="text-gray-400 text-sm mb-6 line-clamp-2 flex-grow">
          {event.description || "Join this exciting event and prove your skills in the arena."}
        </p>

        <div className="mt-auto">
          {/* Progress bar simulation for active/upcoming */}
          {!isPast && (
            <div className="mb-4">
              <div className="flex justify-between text-xs text-gray-500 mb-1 font-mono">
                <span>Progress</span>
                <span className={iconColor}>{isActive ? '65%' : '0%'}</span>
              </div>
              <div className="h-1.5 w-full bg-black/50 rounded-full overflow-hidden border border-white/5">
                <div 
                  className={`h-full rounded-full bg-gradient-to-r ${isActive ? 'from-green-500 to-emerald-400 w-[65%]' : 'from-blue-500 to-cyan-400 w-[5%]'}`}
                ></div>
              </div>
            </div>
          )}

          <div className="flex items-center gap-4 text-xs font-medium text-gray-400">
            <div className="flex items-center gap-1.5 bg-black/40 px-2.5 py-1.5 rounded-lg border border-white/5">
              <Users className="w-3.5 h-3.5" />
              <span>{Math.floor(Math.random() * 100) + 10} Enrolled</span>
            </div>
            <div className="flex items-center gap-1.5 bg-black/40 px-2.5 py-1.5 rounded-lg border border-white/5">
              <Clock className="w-3.5 h-3.5" />
              <span>{isActive ? 'Live' : isUpcoming ? 'Starts Soon' : 'Ended'}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
