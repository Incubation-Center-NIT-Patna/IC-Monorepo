"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter, usePathname } from "next/navigation";
import { fetchApi } from "../../lib/api";
import { useSession } from "../../lib/auth-client";

export default function ParticipantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { eventId } = useParams() as { eventId: string };
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    fetchApi(`/events/${eventId}`)
      .then((data) => {
        setEvent(data.event);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [eventId]);

  useEffect(() => {
    if (!isPending && !session) {
      router.push(`/login?callbackUrl=${encodeURIComponent(pathname)}`);
    }
  }, [isPending, session, router, pathname]);

  if (loading || isPending) return <div className="min-h-screen bg-black flex items-center justify-center text-cyan-400 animate-pulse">Loading Event...</div>;
  if (!session) return null; // Prevent flash of content before redirect
  if (error) return <div className="min-h-screen bg-black flex items-center justify-center text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-black text-white font-sans flex flex-col">
      <header className="bg-white/5 border-b border-white/10 px-6 py-4 flex items-center justify-between sticky top-0 z-10 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-zinc-500 hover:text-cyan-400 transition-colors flex items-center justify-center p-2 rounded-full hover:bg-white/5">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </Link>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-cyan-400">{event?.name}</h1>
            <span className="text-xs text-gray-500 uppercase tracking-wider font-mono">{event?.type?.replace("_", " ")}</span>
          </div>
        </div>
        <nav className="flex items-center gap-6 text-sm font-medium">
          <Link href={`/${eventId}`} className="text-gray-400 hover:text-cyan-400 transition-colors">Dashboard</Link>
          <Link href={`/${eventId}/register`} className="text-gray-400 hover:text-cyan-400 transition-colors flex items-center gap-1">Team</Link>
          
          {["TREASURE_HUNT", "STARTUP_HUNT"].includes(event?.type) && (
            <Link href={`/${eventId}/scan`} className="text-gray-400 hover:text-cyan-400 transition-colors">Scan QR</Link>
          )}
          
          {["HACKATHON", "STARTUP_HUNT", "COMPETITION"].includes(event?.type) && (
            <Link href={`/${eventId}/resources`} className="text-gray-400 hover:text-cyan-400 transition-colors">Resources</Link>
          )}
          
          {["HACKATHON", "STARTUP_HUNT", "COMPETITION"].includes(event?.type) && (
            <Link href={`/${eventId}/submission`} className="text-gray-400 hover:text-cyan-400 transition-colors">Builder</Link>
          )}
        </nav>
      </header>
      <main className="flex-1 w-full">
        {children}
      </main>
    </div>
  );
}
