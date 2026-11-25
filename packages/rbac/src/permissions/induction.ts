import { definePermission } from "./factory";

export const InductionPermissions = {
  // Application permissions
  APPLICATION_READ_ANY: definePermission("induction_application", "read", "any"),
  APPLICATION_READ_OWN: definePermission("induction_application", "read", "own"),
  APPLICATION_UPDATE_STATUS: definePermission(
    "induction_application",
    "update",
    "any",
  ),

  // Evaluation & Interview permissions
  EVALUATION_READ_ANY: definePermission("induction_evaluation", "read", "any"),
  EVALUATION_READ_OWN: definePermission("induction_evaluation", "read", "own"),
  EVALUATION_CREATE_ANY: definePermission(
    "induction_evaluation",
    "create",
    "any",
  ),
  EVALUATION_CREATE_OWN: definePermission(
    "induction_evaluation",
    "create",
    "own",
  ),
  EVALUATION_UPDATE_ANY: definePermission(
    "induction_evaluation",
    "update",
    "any",
  ),
  EVALUATION_UPDATE_OWN: definePermission(
    "induction_evaluation",
    "update",
    "own",
  ),
  INTERVIEWER_ASSIGN: definePermission("induction_interview", "assign", "any"),

  // Settings & Parameters permissions
  SETTINGS_READ: definePermission("induction_settings", "read", "any"),
  SETTINGS_UPDATE: definePermission("induction_settings", "update", "any"),

  // Induction Account Management permissions
  ACCOUNT_READ_ANY: definePermission("induction_account", "read", "any"),
  ACCOUNT_CREATE_ANY: definePermission("induction_account", "create", "any"),
  ACCOUNT_UPDATE_ANY: definePermission("induction_account", "update", "any"),
} as const;

