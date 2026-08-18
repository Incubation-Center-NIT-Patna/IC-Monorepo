import type { PermissionDefinition } from "../permissions";

export interface RoleDefinition {
  name: string;
  description: string;
  isSystem: boolean;

  permissions: readonly PermissionDefinition[];

  isSuperAdmin?: boolean;
}

export interface Role extends RoleDefinition {
  id: string;
}
