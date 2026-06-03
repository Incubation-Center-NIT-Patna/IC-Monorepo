
import AdminSettings from "@/components/admin/settings/AdminSettings";

// 2. This function serves the route /admin/settings
export default function SettingsPage() {
  return (
    <main className="min-h-screen bg-[#05070c] text-white p-6">
      <div className="w-full px-">
        
        <AdminSettings />
        
      </div>
    </main>
  );
}