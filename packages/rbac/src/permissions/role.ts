import { definePermission } from "./factory";

export const RolePermissions = {
  READ_ANY: definePermission("role", "read", "any"),

  CREATE_ANY: definePermission("role", "create", "any"),

  UPDATE_ANY: definePermission("role", "update", "any"),

  DELETE_ANY: definePermission("role", "delete", "any"),

  ASSIGN_ANY: definePermission("role", "assign", "any"),
} as const;
