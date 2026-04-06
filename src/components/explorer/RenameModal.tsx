import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { explorerService } from '../../lib/explorerService';
import { getErrorMessage } from '../../lib/errorMessage';
import { Button } from '../ui/Button';
import { logger } from '../../platform/observability/logger';
import { buildFaviconUrl, normalizeExternalUrl } from '../../platform/security/url';
import { X, Folder, Globe, Link2, Sparkles } from 'lucide-react';

interface RenameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  itemId: string;
  initialName: string;
  initialUrl?: string; // New prop to handle URLs
  itemType: 'folder' | 'app';
}

export const RenameModal: React.FC<RenameModalProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess, 
  itemId, 
  initialName,
  initialUrl = '',
  itemType 
}) => {
  const [newName, setNewName] = useState(initialName);
  const [newUrl, setNewUrl] = useState(initialUrl);
  const [loading, setLoading] = useState(false);
  const [faviconUrl, setFaviconUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Focus input and sync states
  useEffect(() => {
    if (isOpen) {
      setNewName(initialName);
      setNewUrl(initialUrl);
      setError(null);
      setTimeout(() => {
        if (nameInputRef.current) {
          nameInputRef.current.focus();
          nameInputRef.current.select();
        }
      }, 100);
      
      const handleEscape = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, initialName, initialUrl, onClose]);

  // SMART LOGIC: Dynamic Favicon Fetching while editing URL
  useEffect(() => {
    if (itemType === 'app' && newUrl.length > 3) {
      setFaviconUrl(buildFaviconUrl(newUrl, 128));
    } else {
      setFaviconUrl(null);
    }
  }, [newUrl, itemType]);

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = newName.trim();
    const finalUrl = itemType === 'app' ? normalizeExternalUrl(newUrl.trim()) : null;
    
    // Validate
    if (!trimmedName) return;
    if (itemType === 'app' && !finalUrl) {
      setError('Enter a valid HTTP(S) URL for this app.');
      return;
    }

    // Check if anything actually changed
    const isNameUnchanged = trimmedName === initialName;
    const isUrlUnchanged = finalUrl === normalizeExternalUrl(initialUrl.trim());
    
    if (itemType === 'folder' && isNameUnchanged) { onClose(); return; }
    if (itemType === 'app' && isNameUnchanged && isUrlUnchanged) { onClose(); return; }

    setLoading(true);
    setError(null);
    try {
      if (itemType === 'folder') {
        await explorerService.updateFolder(itemId, trimmedName);
      } else {
        await explorerService.updateApp(itemId, trimmedName, finalUrl ?? undefined);
      }
      onSuccess();
      onClose();
    } catch (error) {
      logger.error('rename_item', error, { itemType, itemId });
      setError(getErrorMessage(error, `Unable to update ${itemType}.`));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-200 flex items-start justify-center overflow-y-auto overscroll-contain p-3 pt-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] sm:p-6 sm:pt-8">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="absolute inset-0 bg-black/45 dark:bg-black/70 backdrop-blur-md"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", damping: 25, stiffness: 400 }}
            className="relative my-auto w-full max-w-105 bg-card/95 border border-border rounded-3xl sm:rounded-[2.5rem] p-4 sm:p-8 shadow-2xl backdrop-blur-3xl overflow-hidden max-h-[calc(100dvh-0.75rem)] sm:max-h-[calc(100vh-4rem)] overflow-y-auto custom-scrollbar"
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-transparent via-accent to-transparent opacity-40" />
            <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-48 h-48 bg-accent/20 rounded-full blur-[60px] pointer-events-none" />

            <div className="flex justify-between items-start mb-8 relative z-10">
              <div className="flex items-center gap-4">
                
                {/* Dynamic Icon Container */}
                <div className="w-14 h-14 rounded-[1.25rem] bg-(--surface-strong) border border-border flex items-center justify-center shadow-lg relative overflow-hidden group">
                  {itemType === 'folder' ? (
                    <Folder size={24} className="text-accent relative z-10" />
                  ) : (
                    <AnimatePresence mode="wait">
                      {faviconUrl ? (
                        <motion.img 
                          key="favicon" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                          src={faviconUrl} alt="Preview" className="w-8 h-8 object-contain relative z-10"
                          onError={() => setFaviconUrl(null)}
                        />
                      ) : (
                        <motion.div key="globe" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative z-10">
                          <Globe size={24} className="text-accent" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  )}
                  <div className="absolute inset-0 bg-accent/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                </div>
                
                <div>
                  <h3 className="font-black text-foreground tracking-tight text-xl sm:text-2xl capitalize">
                    Edit {itemType === 'folder' ? 'folder' : 'app'}
                  </h3>
                  <p className="text-[10px] text-muted font-bold tracking-[0.15em] mt-1 uppercase flex items-center gap-1.5">
                    Update Properties <Sparkles size={12} className="text-accent" />
                  </p>
                </div>
              </div>
              <button onClick={onClose} className="p-2.5 text-muted hover:text-foreground hover:bg-card-hover hover:rotate-90 rounded-xl transition-all duration-300" aria-label="Close edit modal">
                <X size={18} strokeWidth={3} />
              </button>
            </div>

            <form onSubmit={handleEdit} className="space-y-5 relative z-10">
              {error && (
                <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-300">
                  {error}
                </div>
              )}
              
              {/* Common Field: Name */}
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-muted font-black mb-2.5 ml-1">
                  Display Name
                </label>
                <div className="relative group">
                  <input
                    ref={nameInputRef}
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full min-h-12 bg-background/70 border border-border rounded-2xl px-4 py-4 text-sm font-bold text-foreground placeholder:text-muted focus:outline-none focus:border-accent/40 focus:bg-background/90 focus:ring-4 focus:ring-accent/5 transition-all shadow-inner"
                    autoComplete="off"
                  />
                </div>
              </div>

              {/* Conditional Field: URL (apps only) */}
              {itemType === 'app' && (
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-muted font-black mb-2.5 ml-1">
                    App URL
                  </label>
                  <div className="relative group">
                    <Link2 size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-accent transition-colors duration-300" />
                    <input
                      required
                      type="text"
                      value={newUrl}
                      onChange={(e) => setNewUrl(e.target.value)}
                      className="w-full min-h-12 bg-background/70 border border-border rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-foreground placeholder:text-muted focus:outline-none focus:border-accent/40 focus:bg-background/90 focus:ring-4 focus:ring-accent/5 transition-all shadow-inner"
                      placeholder="e.g. github.com"
                      autoComplete="off"
                    />
                  </div>
                </div>
              )}
              
              <div className="sticky bottom-0 -mx-1 mt-2 border-t border-border bg-background/85 px-1 pt-3 pb-[calc(0.25rem+env(safe-area-inset-bottom))] backdrop-blur-sm">
                <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 min-h-12 px-4 py-4 rounded-2xl border border-border bg-card/70 text-foreground text-xs uppercase tracking-widest font-black hover:bg-card-hover hover:border-(--border-hover) transition-all"
                  >
                    Cancel
                  </button>
                  <Button 
                    type="submit" 
                    className="flex-1 min-h-12 py-4 rounded-2xl text-xs uppercase tracking-widest font-black shadow-[0_0_20px_rgba(var(--accent),0.2)] hover:shadow-[0_0_30px_rgba(var(--accent),0.4)] transition-all" 
                    loading={loading}
                    disabled={!newName.trim() || (itemType === 'app' && !newUrl.trim()) || loading}
                  >
                    {loading ? 'Saving...' : 'Update Details'}
                  </Button>
                </div>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
