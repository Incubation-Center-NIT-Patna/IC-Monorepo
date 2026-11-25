/**
 * Centralized Environment Accessor for Admin Portal
 * Fails explicitly if required environment variables are not configured.
 */
export function getApiBaseUrl() {
  const url = process.env.NEXT_PUBLIC_API_URL;
  if (!url) {
    throw new Error(
      'Configuration Error: NEXT_PUBLIC_API_URL is not configured. Please set it in your environment.'
    );
  }
  return url.replace(/\/+$/, '');
}
