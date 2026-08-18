import type { RoleDefinition, Role } from "../roles/types";
import type { RoleRepository } from "../repositories/role.repository";

export class RoleService {
  constructor(private readonly repository: RoleRepository) {}

  async createRole(role: RoleDefinition): Promise<Role> {
    return this.repository.createRole(role);
  }

  async updateRole(id: string, role: Partial<RoleDefinition>): Promise<Role> {
    const existing = await this.repository.getRole(id);
    if (!existing) {
      throw new Error("Role not found");
    }

    if (existing.isSystem) {
      throw new Error("Cannot modify a system role");
    }

    return this.repository.updateRole(id, role);
  }

  async deleteRole(id: string): Promise<void> {
    const existing = await this.repository.getRole(id);
    if (!existing) {
      throw new Error("Role not found");
    }

    if (existing.isSystem) {
      throw new Error("Cannot delete a system role");
    }

    return this.repository.deleteRole(id);
  }

  async getRole(id: string): Promise<Role | null> {
    return this.repository.getRole(id);
  }

  async listRoles(): Promise<Role[]> {
    return this.repository.listRoles();
  }

  async assignRole(userId: string, roleId: string): Promise<void> {
    const existing = await this.repository.getRole(roleId);
    if (!existing) {
      throw new Error("Role not found");
    }

    return this.repository.assignRoleToUser(userId, roleId);
  }

  async removeRole(userId: string, roleId: string): Promise<void> {
    return this.repository.removeRoleFromUser(userId, roleId);
  }

  async getUserRoles(userId: string): Promise<Role[]> {
    return this.repository.getUserRoles(userId);
  }
}
