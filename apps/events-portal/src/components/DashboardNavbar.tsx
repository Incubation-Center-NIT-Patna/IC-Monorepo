"use client";

import React from "react";
import Link from "next/link";
import { Gamepad2, Bell, Shield, Trophy, LogIn, LogOut } from "lucide-react";
import { authClient } from "../authClient";

export function DashboardNavbar() {
  const { data: session, isPending } = authClient.useSession();

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/50 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative p-1 rounded-xl bg-white/5 border border-white/10 group-hover:border-cyan-500/50 group-hover:shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all duration-300">
              <img src="/ic_logo.png" alt="IC Logo" className="w-8 h-8 object-contain filter drop-shadow-md" />
            </div>
            <span className="text-xl font-bold tracking-wider text-white group-hover:text-cyan-400 transition-colors">
              Incubation Center
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-4 bg-white/5 px-4 py-1.5 rounded-full border border-white/10">
            <div className="flex items-center gap-2 text-sm text-yellow-500">
              <Trophy className="w-4 h-4" />
              <span className="font-mono font-bold">3 wins</span>
            </div>
            <div className="w-px h-4 bg-white/20"></div>
            <div className="flex items-center gap-2 text-sm text-cyan-400">
              <span className="font-mono font-bold">10 participations</span>
            </div>
          </div>

          <button className="relative p-2 text-gray-400 hover:text-white transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-pink-500 rounded-full shadow-[0_0_8px_rgba(236,72,153,0.8)]"></span>
          </button>

          {isPending ? (
            <div className="w-8 h-8 rounded-full bg-white/10 animate-pulse border border-white/20" />
          ) : session ? (
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-2 p-1 pr-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-all">
                <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center border border-white/20 overflow-hidden">
                  {session.user.image ? (
                    <img src={session.user.image} alt={session.user.name} className="w-full h-full object-cover" />
                  ) : (
                    <Shield className="w-4 h-4 text-cyan-400" />
                  )}
                </div>
                <span className="text-sm font-medium text-white hidden sm:block">{session.user.name}</span>
              </button>
              <button 
                onClick={() => authClient.signOut()}
                className="text-gray-400 hover:text-pink-400 transition-colors p-2"
                title="Sign Out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-2 px-5 py-2 rounded-full bg-white/5 border border-white/10 text-white text-sm font-bold hover:bg-cyan-500/10 hover:border-cyan-500/50 hover:text-cyan-400 hover:shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In</span>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
