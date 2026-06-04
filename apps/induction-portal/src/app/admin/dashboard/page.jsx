import Link from "next/link";
import WelcomeSection from "./_components/WelcomeSection";
import StatsGrid from "./_components/StatsGrid";
import ProgressCard from "./_components/ProgressCard";
import RecentActivity from "./_components/RecentActivity";
import { statsData } from "./_components/statsData";

// Temporary static dashboard data.
// After implementing authentication/login system,
// these values will come dynamically from
// session, database, or API response.

export default async function AdminDashboardPage() {

  const adminDashboardData = {
    userType: "Admin",
    progress: { title: "Overall Induction Progress", val: 56 },
    stats: statsData || [],
  };

  const { userType, progress, stats } = adminDashboardData;

  return (
    <div className="space-y-6">
      <WelcomeSection userType={userType} />
      
      <StatsGrid stats={stats} />
      
      <div className="grid grid-cols-1  gap-6">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <ProgressCard progress={progress} />
          <RecentActivity />
        {/* </div>
        
        <div className="lg:col-span-1 flex flex-col gap-6"> */}
          
          
          <div className="flex justify-start w-full">
            <Link
              href="/admin/settings"
              className="inline-flex items-center justify-center rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm font-medium text-emerald-400 transition-colors hover:bg-white/10 w-full"
            >
              Go to Admin Settings ⚙️
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
