export type PermissionScope = "own" | "any";

export type PermissionAction =
  | "create"
  | "read"
  | "update"
  | "delete"
  | "review"
  | "publish"
  | "assign"
  | "refund"
  | "ban"
  | "moderate";

export interface PermissionDefinition {
  resource: string;
  action: PermissionAction;
  scope: PermissionScope;

  readonly key: string;
}
