import type { PermissionDefinition } from "../permissions";

export interface PermissionCheckRequest<TResource = unknown> {
  userId: string;

  permission: PermissionDefinition;

  resource?: TResource;
}

export interface PermissionResult {
  allowed: boolean;

  reason?: string;
}

export interface AuthorizationContext {
  permissions: PermissionDefinition[];

  isSuperAdmin: boolean;
}
