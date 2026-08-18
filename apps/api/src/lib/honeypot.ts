/**
 * A lightweight anti-bot honeypot check for public form endpoints.
 * `fieldName` should be a hidden form field real users never see or fill
 * in - bots that auto-fill every field on a form end up tripping it.
 *
 * Callers should treat a tripped honeypot as a silent success (never
 * reveal to the bot that it was caught) while skipping the real side
 * effect (sending an OTP, creating an application, etc).
 */
export function isHoneypotTripped(
  body: Record<string, unknown>,
  fieldName = "website",
): boolean {
  const value = body[fieldName];
  return typeof value === "string" && value.trim().length > 0;
}
