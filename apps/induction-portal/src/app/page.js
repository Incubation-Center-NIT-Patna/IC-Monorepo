import AdminDashboard from "@/components/admin/dashboard/Dashboard";
import { statsData } from "@/components/admin/dashboard/Stats/statsData";

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
    <>
      {role==="admin" ? (
        <AdminDashboard data={adminDashboardData} />
      ) : (
        <UserHome />
      )}
    </>
  );
}
