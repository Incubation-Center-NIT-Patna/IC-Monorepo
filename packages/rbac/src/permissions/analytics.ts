import { definePermission } from "./factory";

export const AnalyticsPermissions = {
  READ_ANY: definePermission("analytics", "read", "any"),
} as const;
