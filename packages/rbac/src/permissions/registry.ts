import { AnalyticsPermissions } from "./analytics";
import { CmsPermissions } from "./cms";
import { InductionPermissions } from "./induction";
import { RolePermissions } from "./role";
import { SettingsPermissions } from "./settings";
import { UserPermissions } from "./user";
import { TeamPermissions } from "./team";

import type { PermissionDefinition } from "./types";

export const PermissionRegistry = {
  user: UserPermissions,
  team: TeamPermissions,
  role: RolePermissions,
  settings: SettingsPermissions,
  analytics: AnalyticsPermissions,
  induction: InductionPermissions,
  cms: CmsPermissions,
} as const;

export const AllPermissions: PermissionDefinition[] = Object.values(
  PermissionRegistry,
).flatMap((permissions) => Object.values(permissions));
