import {
  AnalyticsPermissions,
  SettingsPermissions,
  UserPermissions,
} from "../permissions";
import type { RoleDefinition } from "./types";

export const SystemRoles = [
  {
    name: "Super Admin",
    description: "Full access to the entire platform.",
    isSystem: true,
    isSuperAdmin: true,
    permissions: [],
  },

  {
    name: "Admin",
    description: "Administrative access to all platform resources.",
    isSystem: true,
    isSuperAdmin: false,
    permissions: [
      
      // Users - list/view only; no create, edit, ban, delete, or password reset
      UserPermissions.READ_ANY,

      // Roles - Admin has no role-management access (Super Admin only)

      // Settings
      SettingsPermissions.READ_ANY,
      SettingsPermissions.UPDATE_ANY,

      // Analytics
      AnalyticsPermissions.READ_ANY,
    ],
  },

] as const satisfies readonly RoleDefinition[];
