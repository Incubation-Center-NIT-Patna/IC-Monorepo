import { definePermission } from "./factory";

export const UserPermissions = {
  READ_ANY: definePermission("user", "read", "any"),

  CREATE_ANY: definePermission("user", "create", "any"),

  UPDATE_ANY: definePermission("user", "update", "any"),

  DELETE_ANY: definePermission("user", "delete", "any"),

  BAN_ANY: definePermission("user", "ban", "any"),
} as const;
