import { definePermission } from "./factory";

export const CmsPermissions = {
  READ_ANY: definePermission("cms", "read", "any"),
  CREATE_ANY: definePermission("cms", "create", "any"),
  UPDATE_ANY: definePermission("cms", "update", "any"),
  DELETE_ANY: definePermission("cms", "delete", "any"),

  // Section-specific Permissions for fine-grained Team-Based Access
  GALLERY_MANAGE: definePermission("cms_gallery", "manage", "any"),
  GALLERY_READ: definePermission("cms_gallery", "read", "any"),

  NOTICES_MANAGE: definePermission("cms_notices", "manage", "any"),
  NOTICES_READ: definePermission("cms_notices", "read", "any"),

  EVENTS_MANAGE: definePermission("cms_events", "manage", "any"),
  EVENTS_READ: definePermission("cms_events", "read", "any"),

  INCUBATIONS_MANAGE: definePermission("cms_incubations", "manage", "any"),
  INCUBATIONS_READ: definePermission("cms_incubations", "read", "any"),

  TALKS_MANAGE: definePermission("cms_talks", "manage", "any"),
  TALKS_READ: definePermission("cms_talks", "read", "any"),

  FAQS_MANAGE: definePermission("cms_faqs", "manage", "any"),
  FAQS_READ: definePermission("cms_faqs", "read", "any"),

  QUERIES_MANAGE: definePermission("cms_queries", "manage", "any"),
  QUERIES_READ: definePermission("cms_queries", "read", "any"),

  TEAM_MANAGE: definePermission("cms_team", "manage", "any"),
  TEAM_READ: definePermission("cms_team", "read", "any"),
} as const;
