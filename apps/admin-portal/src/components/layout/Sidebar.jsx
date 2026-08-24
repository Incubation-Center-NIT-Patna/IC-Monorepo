'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { SIDEBAR_NAV_GROUPS } from '@/constants/sidebarNav';
import { ROLE_LABELS } from '@/constants/rbac';
import { X, LogOut } from '@/components/icons';

export default function Sidebar({ isOpen, setIsOpen }) {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, isSuperAdmin, hasPermission, isMember, logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <>
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs lg:hidden transition-opacity"
        />
      )}

      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 flex w-72 flex-col bg-white border-r border-[#E2E8F0] shadow-xs transition-transform duration-300 ease-in-out lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        <div className="flex h-[64px] shrink-0 items-center justify-between px-4 border-b border-[#E2E8F0] bg-white">
          <Link href={isMember ? '/profile' : '/dashboard'} className="flex items-center gap-3 group">
            <img
              src="/ic_logo.webp"
              alt="IC NIT Patna Logo"
              className="w-11 h-11 object-contain shrink-0"
            />
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold text-slate-900 tracking-tight group-hover:text-[#1E40AF] transition-colors leading-tight">
                  Incubation Center
                </span>
              </div>
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mt-0.5">
                NIT Patna
              </span>
            </div>
          </Link>

          <button
            onClick={() => setIsOpen(false)}
            className="p-1 rounded-md text-slate-400 hover:text-slate-900 hover:bg-slate-100 lg:hidden transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-3 mx-3 my-3 rounded-md bg-[#F8FAFC] border border-[#E2E8F0]">
          <div className="flex items-center gap-2.5">
            {currentUser?.avatar ? (
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-8.5 h-8.5 rounded-full object-cover border border-[#E2E8F0] shrink-0"
              />
            ) : (
              <span className="w-8.5 h-8.5 rounded-full bg-[#1E40AF] text-white flex items-center justify-center font-bold text-xs shrink-0">
                {currentUser?.name?.[0] || 'U'}
              </span>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-900 truncate">
                {currentUser?.name}
              </p>
              <p className="text-xs font-semibold text-slate-600 truncate mt-0.5">
                Role: {ROLE_LABELS[currentUser?.role]}
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-1 space-y-4 custom-scrollbar">
          {SIDEBAR_NAV_GROUPS.map((group, gIdx) => {
            const visibleItems = group.items.filter((item) => {
              if (isMember) {
                return item.href === '/profile';
              }
              if (isSuperAdmin) return true;
              if (item.roles && !item.roles.includes(currentUser?.role)) return false;
              if (item.permission && !hasPermission(item.permission)) return false;
              return true;
            });

            if (visibleItems.length === 0) return null;

            return (
              <div key={group.title || gIdx} className="space-y-1">
                <p className="px-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {group.title}
                </p>
                <div className="space-y-0.5">
                  {visibleItems.map((item) => {
                    const isActive =
                      pathname === item.href ||
                      (item.href !== '/dashboard' && pathname.startsWith(item.href));
                    const Icon = item.icon;

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className={`group flex items-center justify-between px-2.5 py-2 rounded-md text-xs font-medium transition-all ${isActive
                          ? 'bg-[#EFF6FF] text-[#1E40AF] font-semibold border border-[#BFDBFE]'
                          : 'text-slate-700 hover:text-[#1E40AF] hover:bg-[#F8FAFC]'
                          }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Icon
                            className={`w-4 h-4 shrink-0 transition-colors ${isActive
                              ? 'text-[#1E40AF]'
                              : 'text-slate-400 group-hover:text-[#1E40AF]'
                              }`}
                          />
                          <span className="truncate">{item.label}</span>
                        </div>

                        {item.badge && (
                          <span
                            className={`px-1.5 py-0.2 text-[9px] font-semibold uppercase rounded-sm ${item.badge === 'RBAC'
                              ? 'bg-purple-50 text-purple-700 border border-purple-200'
                              : 'bg-blue-50 text-[#1E40AF] border border-blue-200'
                              }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-3 border-t border-[#E2E8F0] bg-white shrink-0">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-2.5 py-2 rounded-md text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
