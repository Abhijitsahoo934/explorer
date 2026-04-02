import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Moon, Sun, Monitor, User, Shield, Key, Database, AlertTriangle, CheckCircle2, Sparkles } from 'lucide-react';
import { useTheme } from '../ThemeProvider';
import { Button } from '../ui/Button';
import { supabase } from '../../lib/supabase';
import { getErrorMessage } from '../../lib/errorMessage';
import { APP_LOCAL_STORAGE_KEYS, APP_SESSION_STORAGE_KEYS } from '../../platform/storage/keys';
import { clearStorageKeys } from '../../platform/storage/browserStorage';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'appearance' | 'privacy';
type ThemeOption = 'light' | 'dark' | 'system';

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<TabType>('appearance');
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleClearCache = async () => {
    setLoadingAction('cache');
    setFeedback(null);
    await new Promise((resolve) => setTimeout(resolve, 800));

    const removedLocal = clearStorageKeys(localStorage, APP_LOCAL_STORAGE_KEYS);
    const removedSession = clearStorageKeys(sessionStorage, APP_SESSION_STORAGE_KEYS);
    const totalRemoved = removedLocal + removedSession;
    setTheme('system');

    setFeedback({
      type: 'success',
      message: totalRemoved > 0
        ? `Cleared ${totalRemoved} local preference ${totalRemoved === 1 ? 'entry' : 'entries'} and reset the app to system defaults. Refreshing now while preserving your signed-in session.`
        : 'No app-scoped cache was found, but the app will still refresh so you can confirm the current local state.',
    });
    setLoadingAction(null);

    window.setTimeout(() => {
      window.location.reload();
    }, 900);
  };

  const handlePasswordReset = async () => {
    setLoadingAction('password');
    setFeedback(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) {
        setFeedback({
          type: 'error',
          message: 'No email was found in the active session, so a reset link could not be sent.',
        });
        return;
      }

      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/auth/callback?flow=recovery&next=${encodeURIComponent('/update-password')}`,
      });

      if (error) {
        throw error;
      }

      setFeedback({
        type: 'success',
        message: `Password reset link sent to ${user.email}. Open that email and continue from the secure recovery page.`,
      });
    } catch (error: unknown) {
      setFeedback({
        type: 'error',
        message: getErrorMessage(error),
      });
    } finally {
      setLoadingAction(null);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm('Are you absolutely sure? This will delete all your folders, apps, and account data permanently. This action cannot be undone.');

    if (!confirmed) {
      return;
    }

    setLoadingAction('delete');
    setFeedback(null);

    try {
      const { error } = await supabase.rpc('delete_user');
      if (error) {
        throw error;
      }

      await supabase.auth.signOut();
      window.location.href = '/auth';
    } catch (error: unknown) {
      setFeedback({
        type: 'error',
        message: `Error deleting account: ${getErrorMessage(error)}`,
      });
      setLoadingAction(null);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[150] flex items-start justify-center overflow-y-auto p-3 pt-4 sm:p-4 sm:pt-6 md:items-center md:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative my-auto flex w-full max-w-4xl flex-col overflow-hidden rounded-[2rem] border border-border bg-card shadow-premium max-h-[calc(100vh-1.5rem)] sm:max-h-[calc(100vh-3rem)] md:flex-row"
          >
            <div className="w-full shrink-0 border-b border-border bg-sidebar p-4 sm:p-5 md:w-64 md:border-b-0 md:border-r md:p-6">
              <div className="mb-5">
                <p className="text-[10px] uppercase tracking-widest text-muted font-black">Settings</p>
                <h2 className="text-xl font-black text-foreground mt-2">Control Center</h2>
                <p className="text-xs text-muted mt-2 leading-relaxed">Tune the product experience, recovery flows, and device-level behavior.</p>
              </div>

              <div className="grid gap-2 md:flex md:flex-col">
                <button
                  onClick={() => setActiveTab('appearance')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
                    activeTab === 'appearance'
                      ? 'bg-accent/10 text-accent border border-accent/20'
                      : 'text-muted hover:text-foreground hover:bg-card-hover border border-transparent'
                  }`}
                >
                  <User size={16} /> Appearance
                </button>

                <button
                  onClick={() => setActiveTab('privacy')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
                    activeTab === 'privacy'
                      ? 'bg-accent/10 text-accent border border-accent/20'
                      : 'text-muted hover:text-foreground hover:bg-card-hover border border-transparent'
                  }`}
                >
                  <Shield size={16} /> Privacy & Security
                </button>
              </div>
            </div>

            <div className="relative flex-1 overflow-y-auto custom-scrollbar p-5 sm:p-6 md:p-10">
              <button
                onClick={onClose}
                className="absolute right-4 top-4 z-10 rounded-xl p-2 text-muted transition-all hover:bg-card-hover hover:text-foreground sm:right-5 sm:top-5 md:right-8 md:top-8"
              >
                <X size={20} strokeWidth={2.5} />
              </button>

              <AnimatePresence mode="wait">
                {activeTab === 'appearance' && (
                  <motion.div
                    key="appearance"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-8"
                  >
                    <div>
                      <h2 className="text-2xl font-black tracking-tight text-foreground">Appearance</h2>
                      <p className="text-sm text-muted mt-2">Choose the visual mode that fits how you like to work.</p>
                    </div>

                    {feedback && (
                      <div className={`flex items-start gap-3 rounded-2xl border p-4 ${
                        feedback.type === 'success'
                          ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-600 dark:text-emerald-300'
                          : 'border-red-500/20 bg-red-500/5 text-red-500'
                      }`}>
                        {feedback.type === 'success' ? <CheckCircle2 size={18} className="mt-0.5 shrink-0" /> : <AlertTriangle size={18} className="mt-0.5 shrink-0" />}
                        <p className="text-sm font-medium leading-relaxed">{feedback.message}</p>
                      </div>
                    )}

                    <div>
                      <label className="text-[11px] uppercase tracking-widest text-muted font-bold mb-4 block">Interface Theme</label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {[
                          { id: 'light', icon: Sun, label: 'Light Theme' },
                          { id: 'dark', icon: Moon, label: 'Dark Theme' },
                          { id: 'system', icon: Monitor, label: 'System Default' },
                        ].map((t) => (
                          <button
                            key={t.id}
                            onClick={() => setTheme(t.id as ThemeOption)}
                            className={`flex flex-col items-center gap-3 p-5 rounded-2xl border transition-all ${
                              theme === t.id
                                ? 'border-accent bg-accent/5 ring-4 ring-accent/10 shadow-sm'
                                : 'border-border bg-background hover:border-accent/40 hover:bg-card-hover'
                            }`}
                          >
                            <t.icon size={24} className={theme === t.id ? 'text-accent' : 'text-muted'} />
                            <span className={`text-xs font-bold ${theme === t.id ? 'text-accent' : 'text-muted'}`}>{t.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'privacy' && (
                  <motion.div
                    key="privacy"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-8"
                  >
                    <div>
                      <h2 className="text-2xl font-black tracking-tight text-foreground">Privacy & Security</h2>
                      <p className="text-sm text-muted mt-2">Sensitive actions should be explicit, reversible where possible, and safe by default.</p>
                    </div>

                    <div className="rounded-2xl border border-accent/15 bg-accent/5 p-5">
                      <div className="flex items-center gap-2 text-accent mb-2">
                        <Sparkles size={16} />
                        <p className="text-[11px] uppercase tracking-widest font-black">Safe Defaults</p>
                      </div>
                      <p className="text-sm text-muted leading-relaxed">
                        Password reset sends a secure recovery email to the active account. Clear Local Cache only removes app-scoped preferences and keeps your login session intact.
                      </p>
                    </div>

                    {feedback && (
                      <div className={`flex items-start gap-3 rounded-2xl border p-4 ${
                        feedback.type === 'success'
                          ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-600 dark:text-emerald-300'
                          : 'border-red-500/20 bg-red-500/5 text-red-500'
                      }`}>
                        {feedback.type === 'success' ? <CheckCircle2 size={18} className="mt-0.5 shrink-0" /> : <AlertTriangle size={18} className="mt-0.5 shrink-0" />}
                        <p className="text-sm font-medium leading-relaxed">{feedback.message}</p>
                      </div>
                    )}

                    <div className="space-y-4">
                      <h3 className="text-[11px] uppercase tracking-widest text-muted font-bold">Authentication</h3>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl border border-border bg-background gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center text-muted">
                            <Key size={18} />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-foreground">Password Reset</p>
                            <p className="text-xs text-muted font-medium mt-0.5">Send a secure recovery email to the active account.</p>
                          </div>
                        </div>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={handlePasswordReset}
                          loading={loadingAction === 'password'}
                          className="shrink-0 text-xs font-bold"
                        >
                          Send Email
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-[11px] uppercase tracking-widest text-muted font-bold">Local Data</h3>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl border border-border bg-background gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center text-muted">
                            <Database size={18} />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-foreground">Clear Local Cache</p>
                            <p className="text-xs text-muted font-medium mt-0.5">Resets theme, recents, onboarding state, and saved local templates without signing you out.</p>
                          </div>
                        </div>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={handleClearCache}
                          loading={loadingAction === 'cache'}
                          className="shrink-0 text-xs font-bold"
                        >
                          Clear Data
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-border">
                      <h3 className="text-[11px] uppercase tracking-widest text-red-500 font-bold flex items-center gap-2">
                        <AlertTriangle size={14} /> Danger Zone
                      </h3>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl border border-red-500/20 bg-red-500/5 gap-4">
                        <div>
                          <p className="text-sm font-bold text-red-500">Delete Account</p>
                          <p className="text-xs text-red-500/70 font-medium mt-0.5">Permanently remove your workspace and data.</p>
                        </div>
                        <button
                          onClick={handleDeleteAccount}
                          disabled={loadingAction === 'delete'}
                          className={`shrink-0 px-4 py-2 rounded-xl text-white text-xs font-bold transition-colors focus:outline-none focus:ring-4 focus:ring-red-500/20 ${
                            loadingAction === 'delete' ? 'bg-red-400 cursor-not-allowed' : 'bg-red-500 hover:bg-red-600'
                          }`}
                        >
                          {loadingAction === 'delete' ? 'Deleting...' : 'Delete Account'}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
