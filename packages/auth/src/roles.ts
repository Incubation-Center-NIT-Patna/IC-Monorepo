/**
 * @deprecated Authorization roles are database-backed through @repo/rbac.
 * These legacy constants remain exported only for package compatibility and
 * must not be used for authorization decisions.
 */
export const Roles = {
  SUPER_ADMIN: "SUPER_ADMIN",
  ADMIN: "ADMIN",
  MODERATOR: "MODERATOR",
  TEACHER: "TEACHER",
  STUDENT: "STUDENT",
};
