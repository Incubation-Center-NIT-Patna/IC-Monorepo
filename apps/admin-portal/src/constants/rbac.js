/**
 * Role-Based Access Control (RBAC) Constants & Configuration
 * 
 * 3 Core Roles:
 * 1. super_admin: Full authority over CMS, Induction Portal, User Management & System Settings.
 * 2. admin: Access to assigned functional modules (e.g. Events, Startups, Notices, Induction Evaluations).
 * 3. member: Normal member who can access and edit their own profile only.
 */

export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  MEMBER: 'member',
};

export const ROLE_LABELS = {
  [ROLES.SUPER_ADMIN]: 'Super Admin',
  [ROLES.ADMIN]: 'Module Admin',
  [ROLES.MEMBER]: 'Member',
};

export const ROLE_COLORS = {
  [ROLES.SUPER_ADMIN]: {
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
  [ROLES.MEMBER]: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    dot: 'bg-emerald-600',
  },
};

export const PERMISSIONS = {
  // CMS Permissions
  MANAGE_NOTICES: 'manage:notices',
  MANAGE_LEADERSHIP: 'manage:leadership',
  MANAGE_INCUBATIONS: 'manage:incubations',
  MANAGE_EVENTS: 'manage:events',
  MANAGE_TALKS: 'manage:talks',
  MANAGE_QUERIES: 'manage:queries',
  MANAGE_ABOUT: 'manage:about',
  MANAGE_TEAM: 'manage:team',
  MANAGE_GALLERY: 'manage:gallery',
  MANAGE_FAQS: 'manage:faqs',

  // Induction Portal Permissions
  INDUCTION_VIEW: 'induction:view',
  INDUCTION_EVALUATE: 'induction:evaluate',
  INDUCTION_SETTINGS: 'induction:settings',

  // Admin Management Permissions
  MANAGE_USERS: 'manage:users',
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
    PERMISSIONS.MANAGE_LEADERSHIP,
    PERMISSIONS.MANAGE_INCUBATIONS,
    PERMISSIONS.MANAGE_EVENTS,
    PERMISSIONS.MANAGE_TALKS,
    PERMISSIONS.MANAGE_QUERIES,
    PERMISSIONS.MANAGE_ABOUT,
    PERMISSIONS.MANAGE_TEAM,
    PERMISSIONS.MANAGE_GALLERY,
    PERMISSIONS.MANAGE_FAQS,
    PERMISSIONS.INDUCTION_VIEW,
    PERMISSIONS.INDUCTION_EVALUATE,
  ],
  [ROLES.MEMBER]: [
    PERMISSIONS.VIEW_PROFILE,
    PERMISSIONS.EDIT_PROFILE,
  ],
};

export const MOCK_USERS = [
  {
    id: 'usr-1',
    name: 'Himanshu Bharti',
    email: 'himanshu.ic@nitp.ac.in',
    role: ROLES.SUPER_ADMIN,
    post: 'Student Co-ordinator (Super Admin)',
    avatar: 'https://res.cloudinary.com/ddb6lsyht/image/upload/v1782901449/himanshu_bharti_tepyp3.jpg',
    department: 'Incubation Executive Directorate',
    assignedModules: ['all'],
    status: 'active',
    joinedAt: '2023-08-01',
  },
  {
    id: 'usr-2',
    name: 'Abhishek Keshri',
    email: 'abhishek.web@nitp.ac.in',
    role: ROLES.ADMIN,
    post: 'Web Team Co-Lead',
    avatar: 'https://res.cloudinary.com/ddb6lsyht/image/upload/v1782901445/abhishek_keshri_yuimey.jpg',
    department: 'Web Development Committee',
    assignedModules: [
      PERMISSIONS.MANAGE_NOTICES,
      PERMISSIONS.MANAGE_INCUBATIONS,
      PERMISSIONS.MANAGE_EVENTS,
      PERMISSIONS.MANAGE_TALKS,
      PERMISSIONS.MANAGE_QUERIES,
      PERMISSIONS.MANAGE_ABOUT,
      PERMISSIONS.MANAGE_TEAM,
      PERMISSIONS.MANAGE_GALLERY,
      PERMISSIONS.MANAGE_FAQS,
      PERMISSIONS.INDUCTION_VIEW,
      PERMISSIONS.INDUCTION_EVALUATE,
    ],
    status: 'active',
    joinedAt: '2023-09-15',
  },
  {
    id: 'usr-3',
    name: 'Arpita Dwivedi',
    email: 'arpita.ic@nitp.ac.in',
    role: ROLES.MEMBER,
    post: 'Student Co-ordinator & Member',
    avatar: 'https://res.cloudinary.com/ddb6lsyht/image/upload/v1782901447/arpita_dwivedi_zyvifw.jpg',
    department: 'UI/UX & Web Committee',
    assignedModules: [],
    status: 'active',
    joinedAt: '2024-02-10',
  },
];
