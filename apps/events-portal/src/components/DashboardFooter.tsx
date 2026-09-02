import React from "react";
import Link from "next/link";
import { Gamepad2, Twitter, Github} from "lucide-react";

export function DashboardFooter() {
  return (
    <footer className="relative mt-20 border-t border-white/10 bg-black overflow-hidden">
      {/* Decorative neon grid background for footer */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20 mask-image:linear-gradient(to_bottom,transparent,black)]"></div>
      
      <div className="container relative z-10 mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-3 group mb-4">
              <div className="relative p-1 rounded-xl bg-white/5 border border-white/10 group-hover:border-cyan-500/50 group-hover:shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all duration-300">
                <img src="/ic_logo.png" alt="IC Logo" className="w-8 h-8 object-contain filter drop-shadow-md" />
              </div>
              <span className="text-xl font-bold tracking-wider text-white group-hover:text-cyan-400 transition-colors">
                IC Events
              </span>
            </Link>
            <p className="text-gray-400 max-w-sm mb-6">
              Level up your skills by participating in hackathons, quizzes, and treasure hunts. The ultimate arena for competitive minds.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-purple-500/20 hover:border-purple-500/50 border border-white/10 transition-all">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/20 border border-white/10 transition-all">
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="text-white font-bold mb-4 font-mono uppercase tracking-wider text-sm">Quests</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link href="#" className="hover:text-cyan-400 transition-colors">Active Events</Link></li>
              <li><Link href="#" className="hover:text-cyan-400 transition-colors">Upcoming</Link></li>
              <li><Link href="#" className="hover:text-cyan-400 transition-colors">Past Archives</Link></li>
              <li><Link href="#" className="hover:text-cyan-400 transition-colors">Leaderboard</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-bold mb-4 font-mono uppercase tracking-wider text-sm">Support</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link href="#" className="hover:text-purple-400 transition-colors">FAQ</Link></li>
              <li><Link href="#" className="hover:text-purple-400 transition-colors">Rules</Link></li>
              <li><Link href="#" className="hover:text-purple-400 transition-colors">Contact Admins</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-white/10 text-center flex flex-col md:flex-row justify-between items-center gap-4 text-gray-500 text-sm">
          <p>© {new Date().getFullYear()} IC Events. All rights reserved.</p>
          <div className="flex items-center gap-2 text-xs font-mono bg-black/50 px-3 py-1 rounded border border-white/5">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            SYSTEM ONLINE
          </div>
        </div>
      </div>
    </footer>
  );
}
