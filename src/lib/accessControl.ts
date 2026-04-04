import type { User } from '@supabase/supabase-js';

function parseFounderEmails(raw: string | undefined): string[] {
  if (!raw) return [];
  return raw
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function isFounderUser(user: User | null): boolean {
  if (!user) return false;

  const role = String(user.app_metadata?.role ?? user.user_metadata?.role ?? '').toLowerCase();
  if (role === 'founder' || role === 'admin' || role === 'owner') return true;

  const founders = parseFounderEmails(import.meta.env.VITE_FOUNDER_EMAILS);
  if (founders.length === 0) return false;

  const email = String(user.email ?? '').toLowerCase();
  return founders.includes(email);
}
