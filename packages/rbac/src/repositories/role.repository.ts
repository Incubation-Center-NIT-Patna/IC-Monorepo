import type { RoleDefinition, Role } from "../roles/types";
import type { PermissionDefinition } from "../permissions";

export interface RoleRepository {
  createRole(role: RoleDefinition): Promise<Role>;
  updateRole(id: string, role: Partial<RoleDefinition>): Promise<Role>;
  deleteRole(id: string): Promise<void>;
  getRole(id: string): Promise<Role | null>;
  listRoles(): Promise<Role[]>;
  assignRoleToUser(userId: string, roleId: string): Promise<void>;
  removeRoleFromUser(userId: string, roleId: string): Promise<void>;
  getUserRoles(userId: string): Promise<Role[]>;
}
