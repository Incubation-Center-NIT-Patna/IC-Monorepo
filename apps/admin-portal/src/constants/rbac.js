/**
 * Role-Based Access Control (RBAC) Constants & Configuration
 * 
 * Powered by centralized Fastify API, PostgreSQL Prisma, and BetterAuth.
 */

export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  MEMBER: 'member',
  DEVELOPER: 'developer',
};

export const ROLE_LABELS = {
  [ROLES.SUPER_ADMIN]: 'Super Admin',
  [ROLES.ADMIN]: 'Admin',
  [ROLES.MEMBER]: 'Member',
  [ROLES.DEVELOPER]: 'Developer',
  'Super Admin': 'Super Admin',
  'Admin': 'Admin',
  'Member': 'Member',
  'Developer': 'Developer',
};

export const ROLE_COLORS = {
  [ROLES.SUPER_ADMIN]: {
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    border: 'border-purple-200',
    dot: 'bg-purple-600',
  },
  'Super Admin': {
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    border: 'border-purple-200',
    dot: 'bg-purple-600',
  },
  [ROLES.ADMIN]: {
    bg: 'bg-blue-50',
    text: 'text-[#1F3BB3]',
    border: 'border-blue-200',
    dot: 'bg-[#1F3BB3]',
  },
  'Admin': {
    bg: 'bg-blue-50',
    text: 'text-[#1F3BB3]',
    border: 'border-blue-200',
    dot: 'bg-[#1F3BB3]',
  },
  [ROLES.MEMBER]: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    dot: 'bg-emerald-600',
  },
  'Member': {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    dot: 'bg-emerald-600',
  },
  [ROLES.DEVELOPER]: {
    bg: 'bg-cyan-50',
    text: 'text-cyan-700',
    border: 'border-cyan-200',
    dot: 'bg-cyan-600',
  },
  'Developer': {
    bg: 'bg-cyan-50',
    text: 'text-cyan-700',
    border: 'border-cyan-200',
    dot: 'bg-cyan-600',
  },
};

export const PERMISSIONS = {
  // CMS Permissions
  MANAGE_NOTICES: 'manage:notices',
  MANAGE_INCUBATIONS: 'manage:incubations',
  MANAGE_EVENTS: 'manage:events',
  MANAGE_TALKS: 'manage:talks',
  MANAGE_QUERIES: 'manage:queries',
  MANAGE_TEAM: 'manage:team',
  MANAGE_GALLERY: 'manage:gallery',
  MANAGE_FAQS: 'manage:faqs',

  // Induction Portal Permissions
  INDUCTION_VIEW: 'induction:view',
  INDUCTION_EVALUATE: 'induction:evaluate',
  INDUCTION_SETTINGS: 'induction:settings',

  // Admin & Team Management Permissions
  MANAGE_USERS: 'manage:users',
  MANAGE_TEAMS: 'manage:teams',
  VIEW_AUDIT_LOGS: 'view:audit_logs',
  MANAGE_SETTINGS: 'manage:settings',

  // Member Base
  VIEW_PROFILE: 'view:profile',
  EDIT_PROFILE: 'edit:profile',
};

export const ROLE_PERMISSIONS = {
  [ROLES.SUPER_ADMIN]: Object.values(PERMISSIONS),
  [ROLES.ADMIN]: [
    PERMISSIONS.VIEW_PROFILE,
    PERMISSIONS.EDIT_PROFILE,
    PERMISSIONS.MANAGE_NOTICES,
    PERMISSIONS.MANAGE_INCUBATIONS,
    PERMISSIONS.MANAGE_EVENTS,
    PERMISSIONS.MANAGE_TALKS,
    PERMISSIONS.MANAGE_QUERIES,
    PERMISSIONS.MANAGE_TEAM,
    PERMISSIONS.MANAGE_GALLERY,
    PERMISSIONS.MANAGE_FAQS,
    PERMISSIONS.INDUCTION_VIEW,
    PERMISSIONS.INDUCTION_EVALUATE,
    PERMISSIONS.MANAGE_TEAMS,
  ],
  [ROLES.MEMBER]: [
    PERMISSIONS.VIEW_PROFILE,
    PERMISSIONS.EDIT_PROFILE,
  ],
};
