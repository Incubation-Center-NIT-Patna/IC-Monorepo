import { redirect } from "next/navigation";

// Temporary redirect to admin dashboard.
// After implementing authentication/login system,
// this page should redirect users based on their role
// (e.g., admin → /admin/dashboard, user → /user/dashboard).

export default function HomePage() {
  redirect("/admin/dashboard");
}