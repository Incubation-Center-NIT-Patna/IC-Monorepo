'use client';

import AdminSettings from "@/components/settings/AdminSettings";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { PERMISSIONS } from "@/constants/rbac";

export default function SettingsPage() {
  return (
    <ProtectedRoute requiredPermission={PERMISSIONS.INDUCTION_SETTINGS}>
      <div className="w-full">
        <AdminSettings />
      </div>
    </ProtectedRoute>
  );
}
