import type { PermissionDefinition } from "./types";

export function permissionToString(permission: PermissionDefinition): string {
  return `${permission.resource}:${permission.action}:${permission.scope}`;
}

export function permissionKey(permission: PermissionDefinition): string {
  return permissionToString(permission);
}
