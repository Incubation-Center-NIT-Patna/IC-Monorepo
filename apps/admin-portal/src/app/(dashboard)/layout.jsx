'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Sidebar from '@/components/layout/Sidebar';
import AdminHeader from '@/components/layout/AdminHeader';
import Loader from '@/components/ui/Loader';

export default function DashboardLayoutShell({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return <Loader fullPage text="Loading Admin Portal..." />;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen text-slate-900 flex flex-col antialiased font-sans" style={{ backgroundColor: 'var(--bg-main)' }}>
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      <div className="flex-1 flex flex-col lg:pl-72 min-h-screen transition-all duration-300" style={{ backgroundColor: 'var(--bg-main)' }}>
        <AdminHeader setIsSidebarOpen={setIsSidebarOpen} />

        <main className="flex-1 w-full max-w-[1680px] mx-auto p-4 sm:p-6" style={{ backgroundColor: 'var(--bg-main)' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
