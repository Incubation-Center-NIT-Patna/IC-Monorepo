
import AdminDashboard from "@/components/admin/dashboard/Dashboard";
import { statsData } from "@/components/admin/dashboard/Stats/statsData";
import RecentActivity from '../components/RecentActivity';
//temporarily UserHome function
function UserHome() {
  return (<h1>User Dashboard</h1>);
}

export default async function HomePage() {

// Temporary static role & dashboard data.
// After implementing authentication/login system,
// these values will come dynamically from
// session, database, or API response.

  const role = "admin";

  const adminDashboardData = {
    userType: "Admin",
    progress: {title: "Overall Induction Progress", val:56 },
    stats: statsData || [],
  };

return (
    <main className="min-h-screen bg-[#05070c] flex flex-col items-center justify-start p-6 gap-6">
      
  
      <div className="w-full">
        {role === "admin" ? (
          <AdminDashboard data={adminDashboardData} />
        ) : (
          <UserHome />
        )}
      </div>

      <RecentActivity />

    </main>
  );
}