'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function RootHomePage() {
  const { currentUser, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        if (currentUser?.role === 'member') {
          router.replace('/profile');
        } else {
          router.replace('/dashboard');
        }
      } else {
        router.replace('/login');
      }
    }
  }, [currentUser, isAuthenticated, isLoading, router]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-[#1E40AF]/20 border-t-[#1E40AF] rounded-full animate-spin"></div>
    </div>
  );
}