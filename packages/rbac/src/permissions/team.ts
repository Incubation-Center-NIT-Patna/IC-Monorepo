import { definePermission } from "./factory";

export const TeamPermissions = {
  READ_ANY: definePermission("team", "read", "any"),
  CREATE_ANY: definePermission("team", "create", "any"),
  UPDATE_ANY: definePermission("team", "update", "any"),
  DELETE_ANY: definePermission("team", "delete", "any"),
  ASSIGN_ANY: definePermission("team", "assign", "any"),
} as const;

