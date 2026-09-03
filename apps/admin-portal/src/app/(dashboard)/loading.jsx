import React from 'react';
import { Loader } from '@/components/ui';

export default function DashboardLoading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] w-full">
      <Loader size="xl" />
      <p className="mt-4 text-sm font-semibold text-slate-500 animate-pulse">
        Loading...
      </p>
    </div>
  );
}
