import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Lock, ShieldCheck, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const UpdatePassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isRecoveryReady, setIsRecoveryReady] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    const validateRecoverySession = async () => {
      const { data } = await supabase.auth.getSession();
      if (mounted) {
        setIsRecoveryReady(Boolean(data.session));
      }
    };

    void validateRecoverySession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsRecoveryReady(true);
      }
    });

    return () => {
      mounted = false;
      void subscription.unsubscribe();
    };
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isRecoveryReady) {
      setError('Recovery session not found. Please open the password reset link from your email again.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    const { error: updateError } = await supabase.auth.updateUser({ password });

    setLoading(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setSuccessMessage('Password updated successfully. Redirecting you to the dashboard...');
    setTimeout(() => {
      navigate('/dashboard');
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6 relative overflow-hidden transition-colors duration-300">
      <div className="absolute top-1/4 -left-1/4 w-1/2 h-1/2 bg-accent/10 rounded-full blur-[150px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-card border border-border p-8 md:p-10 rounded-[2.5rem] shadow-premium text-center relative z-10"
      >
        <div className="w-16 h-16 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto mb-6">
          <ShieldCheck size={32} className="text-accent" />
        </div>
        <h2 className="text-2xl font-black mb-2 tracking-tight">Set New Password</h2>
        <p className="text-muted text-sm mb-8 font-medium">
          {isRecoveryReady ? 'Enter a strong, secure password for your vault.' : 'Waiting for a valid recovery session from your reset email.'}
        </p>

        <form onSubmit={handleUpdate} className="space-y-4">
          <div className="relative group text-left">
            <label className="block text-[10px] uppercase tracking-widest text-muted font-bold ml-1 mb-2">
              New Password
            </label>
            <Lock className="absolute left-4 top-[38px] text-muted group-focus-within:text-accent transition-colors" size={16} />
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-background border border-border rounded-xl px-4 py-3.5 pl-11 text-sm focus:outline-none focus:border-accent/50 focus:ring-4 focus:ring-accent/10 transition-all shadow-sm"
              placeholder="Enter new password"
              disabled={!isRecoveryReady}
            />
          </div>

          <div className="relative group text-left">
            <label className="block text-[10px] uppercase tracking-widest text-muted font-bold ml-1 mb-2">
              Confirm Password
            </label>
            <Lock className="absolute left-4 top-[38px] text-muted group-focus-within:text-accent transition-colors" size={16} />
            <input
              type="password"
              required
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-background border border-border rounded-xl px-4 py-3.5 pl-11 text-sm focus:outline-none focus:border-accent/50 focus:ring-4 focus:ring-accent/10 transition-all shadow-sm"
              placeholder="Confirm new password"
              disabled={!isRecoveryReady}
            />
          </div>

          <AnimatePresence mode="wait">
            {successMessage && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-2 text-emerald-600 dark:text-emerald-300 text-xs bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl font-medium text-left"
              >
                <CheckCircle2 size={14} className="shrink-0" />
                <span>{successMessage}</span>
              </motion.div>
            )}

            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-2 text-red-500 text-xs bg-red-500/10 border border-red-500/20 p-3 rounded-xl font-medium text-left"
              >
                <AlertCircle size={14} className="shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <Button
            type="submit"
            loading={loading}
            disabled={!isRecoveryReady || !password || password !== confirmPassword}
            className="w-full mt-4 py-4 rounded-xl text-xs font-black uppercase tracking-widest shadow-md"
          >
            Update Password
          </Button>
        </form>
      </motion.div>
    </div>
  );
};

export default UpdatePassword;
