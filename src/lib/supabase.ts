import { createClient } from '@supabase/supabase-js';
import { validateRuntimeConfig } from '../platform/supabase/runtimeConfig';

const runtimeValidation = validateRuntimeConfig();
const runtimeConfig = runtimeValidation.config;
const fallbackUrl = 'https://invalid.explorer.local';
const fallbackAnonKey = 'invalid-anon-key';

export const supabase = createClient(
  runtimeConfig?.supabaseUrl ?? fallbackUrl,
  runtimeConfig?.supabaseAnonKey ?? fallbackAnonKey,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  }
);

export const supabaseRuntimeValidation = runtimeValidation;
