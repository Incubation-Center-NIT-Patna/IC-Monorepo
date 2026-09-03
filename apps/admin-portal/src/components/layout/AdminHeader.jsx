'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  Menu,
  Bell,
  Search,
  User,
  LogOut,
  Sparkles,
  CalendarDays,
  CheckCircle2,
} from '@/components/icons';
import Link from 'next/link';

export default function AdminHeader({ setIsSidebarOpen }) {
  const router = useRouter();
  const { currentUser, logout } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [currentDate] = useState(() => {
    const d = new Date();
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  });

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-30 flex h-[64px] w-full items-center justify-between border-b border-[#E2E8F0] bg-white px-4 sm:px-6 lg:px-8 shadow-xs">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <button
          onClick={() => setIsSidebarOpen((prev) => !prev)}
          className="p-1 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100 lg:hidden focus:outline-none transition-colors"
          title="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden md:flex flex-col min-w-0">
          <h1 className="text-sm lg:text-base font-semibold text-slate-700 leading-tight">
            Welcome back,{' '}
            <span className="font-bold text-slate-900">
              {currentUser?.name || 'Administrator'}
            </span>
          </h1>
          <p className="text-[11px] text-slate-500 font-normal leading-normal">
            Incubation Center NIT Patna
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 lg:gap-3 shrink-0">
        <div className="hidden xl:flex items-center gap-2 px-2.5 py-1.5 rounded-md border border-[#E2E8F0] bg-[#F8FAFC] text-xs font-medium text-slate-600">
          <CalendarDays className="w-4 h-4 text-[#1E40AF]" />
          <span>{currentDate || 'Today'}</span>
        </div>

        <div className="relative hidden sm:block w-48 lg:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="search"
            placeholder="Search portal..."
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-md border border-[#E2E8F0] bg-[#F8FAFC] text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#1E40AF] focus:bg-white transition-all"
          />
        </div>

        <div className="relative">
          <button
            onClick={() => setIsNotifOpen((prev) => !prev)}
            className="relative p-1.5 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
          </button>

          {isNotifOpen && (
            <>
              <div
                onClick={() => setIsNotifOpen(false)}
                className="fixed inset-0 z-40"
              />
              <div className="absolute right-0 mt-1.5 w-76 rounded-md border border-[#E2E8F0] bg-white p-0 shadow-lg z-50">
                <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-[#E2E8F0] bg-slate-50 rounded-t-md">
                  <p className="text-xs font-semibold text-slate-800">
                    Notifications (3)
                  </p>
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-sm bg-[#1E40AF] text-white">
                    New
                  </span>
                </div>
                <div className="divide-y divide-[#E2E8F0] max-h-64 overflow-y-auto">
                  <div className="p-3 hover:bg-slate-50 transition-colors flex items-start gap-2.5">
                    <Sparkles className="w-4 h-4 text-[#1E40AF] shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-slate-900">
                        New Startup Incubation
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Aura Robotics applied for incubation cohort.
                      </p>
                      <span className="text-[10px] text-slate-400 mt-0.5 block">
                        5 mins ago
                      </span>
                    </div>
                  </div>
                  <div className="p-3 hover:bg-slate-50 transition-colors flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-slate-900">
                        Induction Grades Submitted
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Round 1 grading completed by Tech Evaluation panel.
                      </p>
                      <span className="text-[10px] text-slate-400 mt-0.5 block">
                        1 hour ago
                      </span>
                    </div>
                  </div>
                </div>
                <div className="p-2 border-t border-[#E2E8F0] text-center bg-slate-50 rounded-b-md">
                  <Link
                    href="/activity-log"
                    onClick={() => setIsNotifOpen(false)}
                    className="text-xs font-semibold text-[#1E40AF] hover:underline"
                  >
                    View all activity logs
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>

        {/* User Avatar & Dropdown Menu */}
        <div className="relative">
          <button
            onClick={() => setIsUserMenuOpen((prev) => !prev)}
            className="flex items-center gap-2 p-0.5 rounded-md hover:bg-slate-100 transition-all cursor-pointer"
          >
            {currentUser?.avatar ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-8 h-8 rounded-full object-cover border border-slate-200"
              />
            ) : (
              <span className="w-8 h-8 rounded-full bg-[#1E40AF] flex items-center justify-center text-xs font-bold text-white">
                {currentUser?.name?.[0] || 'U'}
              </span>
            )}
          </button>

          {isUserMenuOpen && (
            <>
              <div
                onClick={() => setIsUserMenuOpen(false)}
                className="fixed inset-0 z-40"
              />
              <div className="absolute right-0 mt-1.5 w-56 rounded-md border border-[#E2E8F0] bg-white p-2 shadow-lg z-50">
                <div className="px-2.5 py-2 border-b border-[#E2E8F0] mb-1 flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-full bg-blue-50 text-[#1E40AF] flex items-center justify-center font-bold text-xs shrink-0 border border-blue-200">
                    {currentUser?.name?.[0] || 'U'}
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-900 truncate">
                      {currentUser?.name}
                    </p>
                    <p className="text-[10px] text-slate-500 truncate">
                      {currentUser?.email}
                    </p>
                  </div>
                </div>

                <Link
                  href="/profile"
                  onClick={() => setIsUserMenuOpen(false)}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                >
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>My Profile</span>
                </Link>

                <div className="my-1 border-t border-[#E2E8F0]" />

                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-500" />
                  <span>Sign Out</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
