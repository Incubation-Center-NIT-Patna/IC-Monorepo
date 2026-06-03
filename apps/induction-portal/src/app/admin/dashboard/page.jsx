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
    <div className="w-full max-w-full">
      <WelcomeSection userType={userType} />
      <StatsGrid stats={stats} />
      <ProgressCard progress={progress} />
      <div className="mt-10">
        <RecentActivity />
      </div>
    </div>
  );
}
