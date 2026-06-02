import AdminLayout from "../layout/AdminLayout";

import WelcomeSection from "./Welcome/WelcomeSection";
import StatsGrid from "./Stats/StatsGrid";
import ProgressCard from "./Progress/ProgressCard";
import RecentActivity from "@/components/admin/dashboard/RecentActivity/RecentActivity";

export default function AdminDashboard({ data }) {

  const { userType, progress, stats } = data || {};

  return (
    <>
    <AdminLayout>
      <div className="w-full max-w-full">
        <WelcomeSection userType={userType} />
        <StatsGrid stats={stats} />
        <ProgressCard progress={progress} />
      </div>
      <div className="mt-10">
        <RecentActivity/>
      </div>
    </AdminLayout>
    </>
  );
}