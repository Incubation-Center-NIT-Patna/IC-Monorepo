import { definePermission } from "./factory";

export const SettingsPermissions = {
  READ_ANY: definePermission("settings", "read", "any"),

  UPDATE_ANY: definePermission("settings", "update", "any"),
} as const;
