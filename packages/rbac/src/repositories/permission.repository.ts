import type { PermissionDefinition } from "../permissions";

import type { AuthorizationContext } from "../types/authorization.types";

export interface PermissionRepository {
  /**
   * Returns the authorization context for a user,
   * containing their effective permissions and Super Admin status.
   */
  getAuthorizationContext(userId: string): Promise<AuthorizationContext>;
}
