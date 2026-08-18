import type {
  PermissionAction,
  PermissionDefinition,
  PermissionScope,
} from "./types";

export function definePermission(
  resource: string,
  action: PermissionAction,
  scope: PermissionScope,
): PermissionDefinition {
  return {
    resource,
    action,
    scope,

    get key() {
      return `${resource}:${action}:${scope}`;
    },
  };
}
