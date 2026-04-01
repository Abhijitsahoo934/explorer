import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { prefetchAuthenticatedRoutes } from '../lib/routePrefetch';
import { trackFunnelEvent } from '../lib/analyticsService';
import { Grain } from '../components/ui/Grain';
import { STORAGE_KEYS } from '../platform/storage/keys';
import { readStorageValue, removeStorageValue } from '../platform/storage/browserStorage';
import { Seo } from '../components/system/Seo';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const handleCallback = async () => {
      try {
        const url = new URL(window.location.href);
        const authCode = url.searchParams.get('code');
        const nextRoute = url.searchParams.get('next');
        const flow = url.searchParams.get('flow');
        const hashParams = new URLSearchParams(url.hash.startsWith('#') ? url.hash.slice(1) : url.hash);
        const hashType = hashParams.get('type');
        const authError =
          url.searchParams.get('error_description') ??
          url.searchParams.get('error');

        if (authError) {
          throw new Error(authError);
        }

        if (authCode) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(authCode);
          if (exchangeError) {
            throw exchangeError;
          }
        }

        const { data, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
          throw sessionError;
        }

        if (!active) {
          return;
        }

        if (data.session) {
          const isRecoveryFlow = flow === 'recovery' || hashType === 'recovery';
          if (!isRecoveryFlow) {
            trackFunnelEvent('oauth_login');
          }
          prefetchAuthenticatedRoutes();
          const storedReturnTo = readStorageValue(sessionStorage, STORAGE_KEYS.authReturnTo);
          removeStorageValue(sessionStorage, STORAGE_KEYS.authReturnTo);
          navigate(isRecoveryFlow ? nextRoute || '/update-password' : storedReturnTo || '/dashboard', { replace: true });
        } else {
          throw new Error('Google sign-in did not create a session.');
        }
      } catch (err) {
        if (!active) {
          return;
        }

        const message = err instanceof Error ? err.message : 'Unable to complete Google sign-in.';
        setError(message);
      }
    };

    void handleCallback();

    return () => {
      active = false;
    };
  }, [navigate]);

  if (error) {
    return <Navigate to={`/auth?error=${encodeURIComponent(error)}`} replace />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center relative overflow-hidden">
      <Seo title="Authenticating | Explorer" robots="noindex,nofollow" canonicalPath="/auth/callback" />
      <Grain opacity={0.03} />
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full bg-accent/10 blur-[140px]" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-sky-400/10 blur-[140px]" />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-5 text-center px-6">
        <div className="relative w-14 h-14">
          <div className="absolute inset-0 rounded-2xl border-2 border-border border-t-accent animate-spin" />
          <div className="absolute inset-2 rounded-xl bg-accent/10 animate-pulse" />
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-[0.25em] text-muted font-black">Auth Callback</p>
          <h1 className="text-2xl font-black tracking-tight mt-2">Completing Google sign-in</h1>
          <p className="text-sm text-muted mt-2">We are securing your session and taking you into the workspace.</p>
        </div>
      </div>
    </div>
  );
}
