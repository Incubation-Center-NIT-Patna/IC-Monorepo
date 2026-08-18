export class AuthorizationError extends Error {
  constructor(
    message = "You are not authorized to perform this action. Contact the administrator.",
  ) {
    super(message);

    this.name = "AuthorizationError";
  }
}
