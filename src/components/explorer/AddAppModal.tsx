import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { explorerService } from '../../lib/explorerService';
import { notificationService } from '../../lib/notificationService';
import { Button } from '../ui/Button';
import { trackFunnelEvent } from '../../lib/analyticsService';
import { logger } from '../../platform/observability/logger';
import { buildFaviconUrl, normalizeExternalUrl } from '../../platform/security/url';
import { X, Globe, Link2, CornerDownLeft, Sparkles, Loader2 } from 'lucide-react';

interface AddAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  folderId: string | null;
}

export const AddAppModal: React.FC<AddAppModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  folderId,
}) => {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [faviconUrl, setFaviconUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    } else {
      setName('');
      setUrl('');
      setFaviconUrl(null);
      setError(null);
    }
  }, [isOpen, onClose]);

  useEffect(() => {
    if (url.length > 3) {
      const normalized = normalizeExternalUrl(url);
      const nextFavicon = buildFaviconUrl(url, 128);
      if (!normalized) {
        setFaviconUrl(null);
        return;
      }

      setFaviconUrl(nextFavicon);

      const hostname = (() => {
        try {
          return new URL(normalized).hostname;
        } catch {
          return null;
        }
      })();

      if (!name && hostname) {
        const domainParts = hostname.replace('www.', '').split('.');
        if (domainParts.length > 0) {
          const extractedName = domainParts[0].charAt(0).toUpperCase() + domainParts[0].slice(1);
          setName(extractedName);
        }
      }
    } else {
      setFaviconUrl(null);
    }
  }, [url, name]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const appName = name.trim();
    const finalUrl = normalizeExternalUrl(url.trim());

    if (!appName) {
      setError('App name is required.');
      return;
    }

    if (!finalUrl) {
      setError('Enter a valid HTTP(S) URL to save this app.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await explorerService.addApp(appName, finalUrl, folderId);
      trackFunnelEvent('app_added', { name: appName, folder_id: folderId });
      try {
        await notificationService.createNotification(
          'App saved',
          `"${appName}" added to your workspace.`,
          'success'
        );
      } catch (e) {
        logger.warn('add_app_notification', 'Notification failed after app create', { error: e });
      }
      onSuccess();
      onClose();
    } catch (error) {
      logger.error('add_app', error, { folderId });
      setError(error instanceof Error ? error.message : 'Unable to save app.');
      try {
        await notificationService.createNotification(
          'Action failed',
          'Could not save app.',
          'warning'
        );
      } catch (e) {
        logger.warn('add_app_notification', 'Notification failed after app create error', { error: e });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
            className="absolute inset-0 bg-[#050505]/80 backdrop-blur-md"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 400 }}
            className="relative w-full max-w-[420px] bg-card/95 border border-white/10 rounded-[2.5rem] p-8 shadow-2xl backdrop-blur-3xl overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-accent to-transparent opacity-30" />
            <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-48 h-48 bg-accent/20 rounded-full blur-[60px] pointer-events-none" />

            <div className="flex justify-between items-start mb-8 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-[1.25rem] bg-black/50 border border-white/5 flex items-center justify-center shadow-lg relative overflow-hidden group">
                  <AnimatePresence mode="wait">
                    {faviconUrl ? (
                      <motion.img
                        key="favicon"
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        src={faviconUrl}
                        alt="Preview"
                        className="w-8 h-8 object-contain relative z-10"
                        onError={() => setFaviconUrl(null)}
                      />
                    ) : (
                      <motion.div key="globe" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative z-10">
                        <Globe size={24} className="text-accent" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <div className="absolute inset-0 bg-accent/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                </div>

                <div>
                  <h3 className="font-black text-white tracking-tight text-2xl">Add app</h3>
                  <p className="text-[10px] text-zinc-500 font-bold tracking-[0.15em] mt-1 uppercase flex items-center gap-1.5">
                    Workspace OS <Sparkles size={12} className="text-accent" />
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-zinc-500 hover:text-white hover:bg-white/5 hover:rotate-90 rounded-xl transition-all duration-300 focus:outline-none"
              >
                <X size={18} strokeWidth={3} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
              {error && (
                <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                  {error}
                </div>
              )}
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-zinc-500 font-black mb-2.5 ml-1">
                  URL
                </label>
                <div className="relative group">
                  <Link2 size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-accent transition-colors duration-300" />
                  <input
                    ref={inputRef}
                    required
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-white placeholder:text-zinc-600 focus:outline-none focus:border-accent/40 focus:bg-black/60 focus:ring-4 focus:ring-accent/5 transition-all shadow-inner"
                    placeholder="github.com, figma.com..."
                    autoComplete="off"
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center justify-between text-[10px] uppercase tracking-widest text-zinc-500 font-black mb-2.5 ml-1">
                  <span>Display name</span>
                  {url && !name && <span className="text-accent animate-pulse text-[9px]">Auto-detecting...</span>}
                </label>
                <div className="relative group">
                  <input
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-4 text-sm font-bold text-white placeholder:text-zinc-600 focus:outline-none focus:border-accent/40 focus:bg-black/60 focus:ring-4 focus:ring-accent/5 transition-all shadow-inner"
                    placeholder="e.g. GitHub"
                    autoComplete="off"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-1.5 opacity-60">
                  <CornerDownLeft size={12} className="text-zinc-500" />
                  <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Press Enter to save</span>
                </div>
              </div>

              <div className="flex gap-4 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-4 rounded-2xl bg-transparent border border-white/10 text-white text-xs uppercase tracking-widest font-black hover:bg-white/5 transition-all"
                >
                  Cancel
                </button>
                <Button
                  type="submit"
                  className="flex-1 py-4 rounded-2xl text-xs uppercase tracking-widest font-black shadow-[0_0_20px_rgba(var(--accent),0.2)] hover:shadow-[0_0_30px_rgba(var(--accent),0.4)] transition-all"
                  disabled={!name.trim() || !url.trim() || loading}
                >
                  {loading ? <Loader2 size={16} className="animate-spin mx-auto" /> : 'Save app'}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
