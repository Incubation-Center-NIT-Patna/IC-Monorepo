'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ShieldAlert, ArrowRight } from '@/components/icons';
import Link from 'next/link';
import Loader from '@/components/ui/Loader';

export default function ProtectedRoute({ children, requiredPermission = null }) {
  const { currentUser, canAccessRoute, hasPermission, isLoading } = useAuth();
  const pathname = usePathname();

  if (isLoading) {
    return <Loader fullPage text="Verifying Permissions..." />;
  }

  const isAllowed =
    canAccessRoute(pathname) && (!requiredPermission || hasPermission(requiredPermission));

  if (!isAllowed) {
    return (
      <div className="flex min-h-[450px] flex-col items-center justify-center text-center p-8 bg-white rounded-md border border-[#E2E8F0] max-w-lg mx-auto mt-12 shadow-xs">
        <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center text-rose-600 mb-3.5 border border-rose-200">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <h2 className="text-lg font-bold text-slate-900 mb-1.5">Access Restricted</h2>
        <p className="text-xs text-slate-600 mb-5 max-w-md leading-relaxed">
          Your current role (<strong className="text-slate-900 capitalize">{currentUser?.role}</strong>) does not have permission to view or manage this section.
        </p>
        <Link
          href="/profile"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-[#1E40AF] hover:bg-[#1E3A8A] text-white font-semibold text-xs transition-colors shadow-xs"
        >
          <span>Go to My Profile</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
