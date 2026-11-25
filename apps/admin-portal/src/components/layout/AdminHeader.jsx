'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { SIDEBAR_NAV_GROUPS } from '@/constants/sidebarNav';
import { PERMISSIONS } from '@/constants/rbac';
import { formatTimeAgo } from '@/utils/timeUtils';
import apiClient from '@/lib/api';
import {
  Menu,
  Bell,
  Search,
  User,
  LogOut,
  History,
  CalendarDays,
  CheckCircle2,
  ArrowRight,
} from '@/components/icons';

export default function AdminHeader({ setIsSidebarOpen }) {
  const router = useRouter();
  const { currentUser, isSuperAdmin, hasPermission, logout } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const [currentDate] = useState(() => {
    const d = new Date();
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  });

  useEffect(() => {
    let active = true;
    async function loadNotifications() {
      if (!currentUser) return;
      try {
        if (isSuperAdmin || hasPermission(PERMISSIONS.INDUCTION_VIEW)) {
          const res = await apiClient.get('/activity-logs?limit=5').catch(() => null);
          if (active && res?.logs) {
            setNotifications(
              res.logs.map((l) => ({
                id: l.id,
                title: l.category || 'Activity',
                subtitle: `${l.user}: ${l.action}`,
                time: l.timestamp,
                href: '/activity-log',
              }))
            );
            return;
          }
        }
        // Fallback to user's own tasks for regular members
        const taskRes = await apiClient.get('/tasks').catch(() => null);
        if (active && taskRes?.tasks) {
          setNotifications(
            taskRes.tasks.slice(0, 5).map((t) => ({
              id: t.id,
              title: `Task: ${t.title}`,
              subtitle: `Priority: ${t.priority} · Status: ${t.status.replace('_', ' ')}`,
              time: t.createdAt,
              href: '/tasks',
            }))
          );
        }
      } catch {
        // Non-blocking
      }
    }
    loadNotifications();
    return () => {
      active = false;
    };
  }, [currentUser, isSuperAdmin, hasPermission]);

  const searchableRoutes = useMemo(() => {
    const items = [];
    SIDEBAR_NAV_GROUPS.forEach((group) => {
      group.items.forEach((item) => {
        const allowed =
          isSuperAdmin ||
          item.href === '/profile' ||
          item.href === '/tasks' ||
          (item.permission ? hasPermission(item.permission) : true);
        if (allowed) {
          items.push({ ...item, group: group.title });
        }
      });
    });
    return items;
  }, [isSuperAdmin, hasPermission]);

  const filteredRoutes = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return searchableRoutes
      .filter(
        (r) =>
          r.label.toLowerCase().includes(q) ||
          r.group.toLowerCase().includes(q) ||
          r.href.toLowerCase().includes(q)
      )
      .slice(0, 6);
  }, [searchQuery, searchableRoutes]);

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter' && filteredRoutes.length > 0) {
      e.preventDefault();
      router.push(filteredRoutes[0].href);
      setSearchQuery('');
      setIsSearchOpen(false);
    } else if (e.key === 'Escape') {
      setIsSearchOpen(false);
    }
  };

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

        {/* Live Portal Quick Search */}
        <div className="relative hidden sm:block w-48 lg:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="search"
            value={searchQuery}
            onFocus={() => setIsSearchOpen(true)}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsSearchOpen(true);
            }}
            onKeyDown={handleSearchKeyDown}
            placeholder="Jump to page..."
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-md border border-[#E2E8F0] bg-[#F8FAFC] text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#1E40AF] focus:bg-white transition-all"
          />
          {isSearchOpen && filteredRoutes.length > 0 && (
            <>
              <div
                onClick={() => setIsSearchOpen(false)}
                className="fixed inset-0 z-40"
              />
              <div className="absolute right-0 left-0 mt-1.5 rounded-md border border-[#E2E8F0] bg-white shadow-lg z-50 divide-y divide-slate-100 overflow-hidden">
                {filteredRoutes.map((route) => {
                  const Icon = route.icon;
                  return (
                    <button
                      key={route.href}
                      type="button"
                      onClick={() => {
                        router.push(route.href);
                        setSearchQuery('');
                        setIsSearchOpen(false);
                      }}
                      className="w-full px-3 py-2 text-left hover:bg-slate-50 flex items-center justify-between gap-2 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {Icon && <Icon className="w-3.5 h-3.5 text-[#1E40AF] shrink-0" />}
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-slate-900 truncate">
                            {route.label}
                          </p>
                          <p className="text-[10px] text-slate-400 truncate">
                            {route.group}
                          </p>
                        </div>
                      </div>
                      <ArrowRight className="w-3 h-3 text-slate-300 shrink-0" />
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Live Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsNotifOpen((prev) => !prev)}
            className="relative p-1.5 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <Bell className="w-4 h-4" />
            {notifications.length > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
            )}
          </button>

          {isNotifOpen && (
            <>
              <div
                onClick={() => setIsNotifOpen(false)}
                className="fixed inset-0 z-40"
              />
              <div className="absolute right-0 mt-1.5 w-80 rounded-md border border-[#E2E8F0] bg-white p-0 shadow-lg z-50">
                <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-[#E2E8F0] bg-slate-50 rounded-t-md">
                  <p className="text-xs font-semibold text-slate-800">
                    Recent Activity ({notifications.length})
                  </p>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-sm bg-[#1E40AF] text-white">
                    Live
                  </span>
                </div>
                <div className="divide-y divide-[#E2E8F0] max-h-64 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((n) => (
                      <Link
                        key={n.id}
                        href={n.href}
                        onClick={() => setIsNotifOpen(false)}
                        className="p-3 hover:bg-slate-50 transition-colors flex items-start gap-2.5 block"
                      >
                        <History className="w-4 h-4 text-[#1E40AF] shrink-0 mt-0.5" />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-slate-900 truncate">
                            {n.title}
                          </p>
                          <p className="text-[11px] text-slate-500 line-clamp-2">
                            {n.subtitle}
                          </p>
                          <span className="text-[10px] text-slate-400 mt-0.5 block">
                            {n.time ? formatTimeAgo(n.time) : 'Just now'}
                          </span>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="p-5 text-center text-xs text-slate-400">
                      <CheckCircle2 className="w-5 h-5 mx-auto text-slate-300 mb-1" />
                      No recent notifications.
                    </div>
                  )}
                </div>
                <div className="p-2 border-t border-[#E2E8F0] text-center bg-slate-50 rounded-b-md">
                  <Link
                    href={isSuperAdmin || hasPermission(PERMISSIONS.INDUCTION_VIEW) ? '/activity-log' : '/tasks'}
                    onClick={() => setIsNotifOpen(false)}
                    className="text-xs font-semibold text-[#1E40AF] hover:underline"
                  >
                    {isSuperAdmin || hasPermission(PERMISSIONS.INDUCTION_VIEW)
                      ? 'View all activity logs'
                      : 'View my tasks'}
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
