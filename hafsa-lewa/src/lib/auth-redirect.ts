import type { Href } from 'expo-router';

const AUTH_PATHS = new Set(['/welcome', '/sign-in', '/create-account', '/(auth)', '/(auth)/welcome', '/(auth)/sign-in', '/(auth)/create-account']);

/**
 * Accept only an in-app path. Reject protocol-relative URLs, auth screens
 * (which would loop), and anything that is not a single path segment string.
 */
export function safeReturnTo(value: string | string[] | undefined | null): string | null {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw) return null;

  let path = raw.trim();
  try {
    path = decodeURIComponent(path);
  } catch {
    return null;
  }

  if (!path.startsWith('/') || path.startsWith('//') || path.includes('\\') || path.includes('://')) return null;
  if (path.includes('..')) return null;

  const pathname = path.split('?')[0] ?? path;
  if (AUTH_PATHS.has(pathname) || pathname.startsWith('/(auth)/')) return null;

  return path;
}

export function authHref(screen: 'sign-in' | 'create-account', returnTo?: string | null): Href {
  const path = screen === 'sign-in' ? '/(auth)/sign-in' : '/(auth)/create-account';
  const safe = safeReturnTo(returnTo);
  if (!safe) return path;
  return `${path}?returnTo=${encodeURIComponent(safe)}` as Href;
}

export function destinationAfterAuth(returnTo: string | string[] | undefined | null): Href {
  return (safeReturnTo(returnTo) ?? '/(tabs)') as Href;
}
