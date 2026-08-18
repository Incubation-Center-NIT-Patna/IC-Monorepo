import type { PermissionDefinition } from "../permissions";
import type { PermissionRepository } from "../repositories/permission.repository";
import type {
  PermissionCheckRequest,
  AuthorizationContext,
} from "../types/authorization.types";

export class PermissionService {
  constructor(private readonly repository: PermissionRepository) {}

  /**
   * Returns the authorization context for the user.
   */
  async getAuthorizationContext(userId: string): Promise<AuthorizationContext> {
    return this.repository.getAuthorizationContext(userId);
  }

  /**
   * Returns all effective permissions assigned to the user.
   * Includes permissions inherited through every assigned role.
   */
  async getUserPermissions(userId: string): Promise<PermissionDefinition[]> {
    const context = await this.getAuthorizationContext(userId);
    return context.permissions;
  }

  /**
   * Checks whether the user has the specified permission.
   */
  async hasPermission(request: PermissionCheckRequest): Promise<boolean> {
    const context = await this.getAuthorizationContext(request.userId);

    return this.containsPermission(context, request.permission);
  }

  /**
   * Returns true if the user has at least one of the supplied permissions.
   */
  async hasAnyPermission(
    request: Omit<PermissionCheckRequest, "permission"> & {
      permissions: PermissionDefinition[];
    },
  ): Promise<boolean> {
    const context = await this.getAuthorizationContext(request.userId);

    return request.permissions.some((permission) =>
      this.containsPermission(context, permission),
    );
  }

  /**
   * Returns true only if the user has all supplied permissions.
   */
  async hasAllPermissions(
    request: Omit<PermissionCheckRequest, "permission"> & {
      permissions: PermissionDefinition[];
    },
  ): Promise<boolean> {
    const context = await this.getAuthorizationContext(request.userId);

    return request.permissions.every((permission) =>
      this.containsPermission(context, permission),
    );
  }

  /**
   * Checks whether a permission exists in the user's effective permission set.
   *
   * Implements Super Admin bypass and Permission Implication (ANY implies OWN).
   */
  private containsPermission(
    context: AuthorizationContext,
    target: PermissionDefinition,
  ): boolean {
    if (context.isSuperAdmin) {
      return true;
    }

    return context.permissions.some((permission) => {
      if (permission.resource !== target.resource) return false;
      if (permission.action !== target.action) return false;

      if (target.scope === "own") {
        return permission.scope === "own" || permission.scope === "any";
      }

      return permission.scope === "any";
    });
  }
}
