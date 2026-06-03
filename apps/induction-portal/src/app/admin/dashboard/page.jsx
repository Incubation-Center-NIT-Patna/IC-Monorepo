import WelcomeSection from "./_components/WelcomeSection";
import StatsGrid from "./_components/StatsGrid";
import ProgressCard from "./_components/ProgressCard";
import RecentActivity from "./_components/RecentActivity";
import { statsData } from "./_components/statsData";
import Link from "next/link";
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
    <div className="w-full max-w-full">
      <WelcomeSection userType={userType} />
      <StatsGrid stats={stats} />
      <ProgressCard progress={progress} />
      <div className="mt-10">
        <RecentActivity />

        <div className="mt-6 flex justify-start">
  <Link 
    href="/admin/settings" 
    className="px-4 py-2 text-emrald-600 font-medium rounded-lg transition-colors"
  >
    Go to Admin Settings ⚙️
  </Link>
</div>
      </div>
    </div>
  );
}
