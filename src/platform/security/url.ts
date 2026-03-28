const ALLOWED_PROTOCOLS = new Set(['http:', 'https:']);

export function normalizeExternalUrl(rawValue: string): string | null {
  const trimmed = rawValue.trim();
  if (!trimmed) return null;

  const withProtocol =
    trimmed.startsWith('http://') || trimmed.startsWith('https://')
      ? trimmed
      : `https://${trimmed}`;

  try {
    const parsed = new URL(withProtocol);
    if (!ALLOWED_PROTOCOLS.has(parsed.protocol)) return null;
    return parsed.toString();
  } catch {
    return null;
  }
}

export function getHostnameFromUrl(rawValue: string): string | null {
  const normalized = normalizeExternalUrl(rawValue);
  if (!normalized) return null;

  try {
    return new URL(normalized).hostname;
  } catch {
    return null;
  }
}

export function buildFaviconUrl(rawValue: string, size = 128): string | null {
  const hostname = getHostnameFromUrl(rawValue);
  if (!hostname) return null;
  return `https://www.google.com/s2/favicons?domain=${hostname}&sz=${size}`;
}

export function openExternalUrl(rawValue: string, newTab = true): boolean {
  const normalized = normalizeExternalUrl(rawValue);
  if (!normalized || typeof window === 'undefined') return false;

  if (newTab) {
    window.open(normalized, '_blank', 'noopener,noreferrer');
  } else {
    window.location.assign(normalized);
  }

  return true;
}
