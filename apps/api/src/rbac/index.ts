import { prisma } from "@repo/database";
import { RoleService, PermissionService } from "@repo/rbac";

import { PrismaPermissionRepository } from "../repositories/prisma-permission.repository";
import { PrismaRoleRepository } from "../repositories/prisma-role.repository";

const permissionRepository = new PrismaPermissionRepository(prisma);
const roleRepository = new PrismaRoleRepository(prisma);

export const permissionService = new PermissionService(permissionRepository);
export const roleService = new RoleService(roleRepository);
