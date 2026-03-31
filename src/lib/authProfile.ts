import type { User } from '@supabase/supabase-js';

function cleanNamePart(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return '';
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

export function getUserDisplayName(user: User | null | undefined): string {
  if (!user) return 'Explorer';

  const metadata = user.user_metadata as Record<string, unknown> | undefined;
  const candidates = [
    metadata?.full_name,
    metadata?.name,
    metadata?.display_name,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.trim()) {
      return candidate.trim();
    }
  }

  const emailName = user.email?.split('@')[0] ?? '';
  return emailName || 'Explorer';
}

export function getUserFirstName(user: User | null | undefined): string {
  const displayName = getUserDisplayName(user);
  const firstName = displayName.split(/\s+/)[0] ?? displayName;
  return cleanNamePart(firstName) || 'Explorer';
}

export function getUserInitials(user: User | null | undefined): string {
  const displayName = getUserDisplayName(user);
  const parts = displayName
    .split(/\s+/)
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length >= 2) {
    return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase();
  }

  return (parts[0]?.slice(0, 2) ?? 'EX').toUpperCase();
}
