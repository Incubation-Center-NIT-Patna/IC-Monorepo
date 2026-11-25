import {
  AnalyticsPermissions,
  CmsPermissions,
  InductionPermissions,
  SettingsPermissions,
  TeamPermissions,
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

      // Teams
      TeamPermissions.READ_ANY,
      TeamPermissions.CREATE_ANY,
      TeamPermissions.UPDATE_ANY,
      TeamPermissions.ASSIGN_ANY,

      // Roles - Admin has no role-management access (Super Admin only)

      // Settings
      SettingsPermissions.READ_ANY,
      SettingsPermissions.UPDATE_ANY,

      // Analytics
      AnalyticsPermissions.READ_ANY,

      // CMS Management
      CmsPermissions.READ_ANY,
      CmsPermissions.CREATE_ANY,
      CmsPermissions.UPDATE_ANY,
      CmsPermissions.DELETE_ANY,

      // Induction operational permissions
      InductionPermissions.APPLICATION_READ_ANY,
      InductionPermissions.APPLICATION_UPDATE_STATUS,
      InductionPermissions.EVALUATION_READ_ANY,
      InductionPermissions.EVALUATION_CREATE_ANY,
      InductionPermissions.EVALUATION_UPDATE_ANY,
      InductionPermissions.INTERVIEWER_ASSIGN,
      InductionPermissions.SETTINGS_READ,
      InductionPermissions.SETTINGS_UPDATE,
      InductionPermissions.ACCOUNT_READ_ANY,
      InductionPermissions.ACCOUNT_CREATE_ANY,
      InductionPermissions.ACCOUNT_UPDATE_ANY,
    ],
  },

  {
    name: "Developer",
    description: "Development and technical administration with induction account management.",
    isSystem: true,
    isSuperAdmin: false,
    permissions: [
      UserPermissions.READ_ANY,
      UserPermissions.CREATE_ANY,
      SettingsPermissions.READ_ANY,
      AnalyticsPermissions.READ_ANY,
      CmsPermissions.READ_ANY,
      CmsPermissions.CREATE_ANY,
      CmsPermissions.UPDATE_ANY,
      CmsPermissions.DELETE_ANY,
      InductionPermissions.APPLICATION_READ_ANY,
      InductionPermissions.EVALUATION_READ_ANY,
      InductionPermissions.SETTINGS_READ,
      InductionPermissions.ACCOUNT_READ_ANY,
      InductionPermissions.ACCOUNT_CREATE_ANY,
      InductionPermissions.ACCOUNT_UPDATE_ANY,
    ],
  },
] as const satisfies readonly RoleDefinition[];
