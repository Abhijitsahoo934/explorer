export type AppEnvironment = 'development' | 'staging' | 'production';

export interface RuntimeConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  appEnv: AppEnvironment;
}

export interface RuntimeConfigValidation {
  isValid: boolean;
  config: RuntimeConfig | null;
  errors: string[];
}

const VALID_APP_ENVS: readonly AppEnvironment[] = ['development', 'staging', 'production'];

export function validateRuntimeConfig(env: ImportMetaEnv = import.meta.env): RuntimeConfigValidation {
  const supabaseUrl = env.VITE_SUPABASE_URL?.trim() ?? '';
  const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY?.trim() ?? '';
  const appEnvCandidate = env.VITE_APP_ENV?.trim() ?? 'development';

  const errors: string[] = [];

  if (!supabaseUrl) {
    errors.push('Missing `VITE_SUPABASE_URL`.');
  }

  if (!supabaseAnonKey) {
    errors.push('Missing `VITE_SUPABASE_ANON_KEY`.');
  }

  if (supabaseUrl) {
    try {
      const url = new URL(supabaseUrl);
      if (!/^https?:$/.test(url.protocol)) {
        errors.push('`VITE_SUPABASE_URL` must be an HTTP(S) URL.');
      }
    } catch {
      errors.push('`VITE_SUPABASE_URL` is not a valid URL.');
    }
  }

  if (!VALID_APP_ENVS.includes(appEnvCandidate as AppEnvironment)) {
    errors.push('`VITE_APP_ENV` must be one of: development, staging, production.');
  }

  if (errors.length > 0) {
    return {
      isValid: false,
      config: null,
      errors,
    };
  }

  return {
    isValid: true,
    config: {
      supabaseUrl,
      supabaseAnonKey,
      appEnv: appEnvCandidate as AppEnvironment,
    },
    errors: [],
  };
}
