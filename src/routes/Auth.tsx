import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { prefetchAuthenticatedRoutes } from '../lib/routePrefetch';
import { trackFunnelEvent } from '../lib/analyticsService';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { STORAGE_KEYS } from '../platform/storage/keys';
import { removeStorageValue, writeStorageValue } from '../platform/storage/browserStorage';
import { Button } from '../components/ui/Button';
import { Grain } from '../components/ui/Grain';
import { LayoutGrid, Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';
import { GoogleLogo } from '../components/ui/GoogleLogo';

const Auth: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get('returnTo') ?? null;

  useEffect(() => {
    const authError = searchParams.get('error');
    if (authError) {
      setError(authError);
    }
  }, [searchParams]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        trackFunnelEvent('signup_submitted');
        setError('Verification link sent. Check your inbox to activate your workspace.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        trackFunnelEvent('email_login');
        prefetchAuthenticatedRoutes();
        navigate(returnTo || '/dashboard');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unable to authenticate.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      // OAuth callback route par hum sessionStorage se returnTo recover karenge.
      if (returnTo) writeStorageValue(sessionStorage, STORAGE_KEYS.authReturnTo, returnTo);
      else removeStorageValue(sessionStorage, STORAGE_KEYS.authReturnTo);

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            prompt: 'select_account',
          },
        },
      });
      if (error) throw error;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unable to start Google sign-in.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6 relative overflow-hidden selection:bg-accent/20 selection:text-accent transition-colors duration-300">
      <Grain />
      
      {/* Dynamic Background Glows */}
      <div className="absolute top-0 -left-1/4 w-1/2 h-1/2 bg-accent/10 rounded-full blur-[160px] pointer-events-none transition-colors duration-700" />
      <div className="absolute bottom-0 -right-1/4 w-1/2 h-1/2 bg-accent/5 rounded-full blur-[150px] pointer-events-none transition-colors duration-700" />

      <motion.div 
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-card/80 backdrop-blur-2xl border border-border p-8 md:p-10 rounded-[2.5rem] shadow-premium transition-colors duration-300">
          
          {/* Header */}
          <div className="text-center mb-10">
            <motion.div 
              whileHover={{ rotate: 180, scale: 1.05 }}
              transition={{ duration: 0.6, ease: "anticipate" }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-[1.25rem] bg-foreground text-background mb-6 shadow-md border border-border/50 cursor-pointer"
              onClick={() => navigate('/')}
            >
              <LayoutGrid size={28} strokeWidth={2.5} />
            </motion.div>
            <h1 className="text-3xl font-black tracking-tight mb-2 text-foreground">
              {isSignUp ? 'Create Workspace' : 'Welcome Back'}
            </h1>
            <p className="text-muted text-sm font-medium">
              {isSignUp ? 'Join the future of workspace organization.' : 'Securely access your digital vault.'}
            </p>
          </div>

          <div className="space-y-6">
            {/* Social Sign In */}
            <button 
              className="w-full py-3.5 rounded-xl border border-border bg-background hover:bg-card-hover hover:border-accent/30 transition-all font-bold tracking-wide flex items-center justify-center gap-3 text-sm text-foreground shadow-sm focus:outline-none focus:ring-4 focus:ring-accent/10"
              onClick={handleGoogleLogin}
            >
              <GoogleLogo />
              Continue with Google
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border"></span></div>
              <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-black">
                <span className="bg-card px-4 text-muted transition-colors duration-300">Or use email</span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleAuth} className="space-y-4">
              <div className="space-y-2">
                <label className="block text-[10px] uppercase tracking-widest text-muted font-bold ml-1">
                  Email Address
                </label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-accent transition-colors" size={16} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl px-4 py-3.5 pl-11 text-sm text-foreground focus:outline-none focus:border-accent/50 focus:ring-4 focus:ring-accent/10 transition-all placeholder:text-muted/50 shadow-sm"
                    placeholder="name@company.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] uppercase tracking-widest text-muted font-bold ml-1">
                  Password
                </label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-accent transition-colors" size={16} />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl px-4 py-3.5 pl-11 text-sm text-foreground focus:outline-none focus:border-accent/50 focus:ring-4 focus:ring-accent/10 transition-all placeholder:text-muted/50 shadow-sm"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {/* Error State */}
              <AnimatePresence mode="wait">
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                    animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                    className="flex items-center gap-2 text-red-500 text-xs bg-red-500/10 border border-red-500/20 p-3 rounded-xl font-medium overflow-hidden"
                  >
                    <AlertCircle size={14} className="shrink-0" />
                    <span>{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <Button 
                type="submit" 
                className="w-full mt-2 py-4 rounded-xl text-xs font-black uppercase tracking-widest shadow-md hover:shadow-glow group"
                loading={loading}
              >
                {isSignUp ? 'Initialize' : 'Launch Explorer'}
                {!loading && <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />}
              </Button>
            </form>

            {/* Toggle Sign Up / In */}
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError(null);
                }}
                className="group text-muted hover:text-foreground text-xs font-bold transition-colors focus:outline-none"
              >
                {isSignUp ? 'Already on the grid?' : "New to the system?"} 
                <span className="ml-2 text-accent group-hover:text-accent/80 group-hover:underline underline-offset-4 transition-colors">
                  {isSignUp ? 'Sign In' : 'Create Account'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
