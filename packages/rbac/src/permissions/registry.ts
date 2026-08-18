import { AnalyticsPermissions } from "./analytics";
import { RolePermissions } from "./role";
import { SettingsPermissions } from "./settings";
import { UserPermissions } from "./user";

import type { PermissionDefinition } from "./types";

export const PermissionRegistry = {
  user: UserPermissions,
  role: RolePermissions,
  settings: SettingsPermissions,
  analytics: AnalyticsPermissions,
} as const;

export const AllPermissions: PermissionDefinition[] = Object.values(
  PermissionRegistry,
).flatMap((permissions) => Object.values(permissions));
