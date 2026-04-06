import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { explorerService } from '../../lib/explorerService';
import { notificationService } from '../../lib/notificationService'; // Added for real-time bell updates!
import { getErrorMessage } from '../../lib/errorMessage';
import { Button } from '../ui/Button';
import { logger } from '../../platform/observability/logger';
import { X, FolderPlus, Folder as FolderIcon, CornerDownLeft } from 'lucide-react';

interface AddFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  parentId: string | null;
}

export const AddFolderModal: React.FC<AddFolderModalProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess, 
  parentId 
}) => {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input automatically when modal opens & Handle Escape key
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setError(null);
      
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    } else {
      setName(''); // Reset form on close
    }
  }, [isOpen, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const folderName = name.trim();
    if (!folderName) return;
    
    setLoading(true);
    try {
      // 1. Create the folder in Supabase
      await explorerService.createFolder(folderName, parentId);
      
      // 2. Trigger a real-time notification for the Topbar Bell! 🔔
      try {
        await notificationService.createNotification(
          'Folder Created',
          `"${folderName}" has been successfully added to your vault.`,
          'success'
        );
      } catch (e) {
        // Notification failure should not break the main action.
        logger.warn('add_folder_notification', 'Notification failed after folder create', { error: e });
      }

      // 3. Refresh Dashboard & Close Modal
      onSuccess();
      onClose();
    } catch (error) {
      logger.error('add_folder', error, { parentId });
      setError(getErrorMessage(error, 'Could not create folder.'));
      // Optional: Send error notification
      try {
        await notificationService.createNotification(
          'Action Failed',
          'Could not create folder. Please try again.',
          'warning'
        );
      } catch (e) {
        logger.warn('add_folder_notification', 'Notification failed after folder create error', { error: e });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-150 flex items-start justify-center overflow-y-auto overscroll-contain p-3 pt-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] sm:p-6 sm:pt-8">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="absolute inset-0 bg-black/40 dark:bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", damping: 25, stiffness: 400 }}
            className="relative my-auto w-full max-w-sm overflow-y-auto overflow-hidden rounded-3xl border border-border bg-card/95 p-5 shadow-premium backdrop-blur-2xl max-h-[calc(100dvh-0.75rem)] sm:rounded-4xl sm:max-h-[calc(100vh-4rem)] custom-scrollbar sm:p-7"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            {/* Top decorative gradient glow */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-linear-to-r from-transparent via-accent to-transparent opacity-50" />
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-32 h-32 bg-accent/20 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10 mb-5 flex items-start justify-between gap-4 sm:mb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-background border border-border flex items-center justify-center shadow-sm">
                  <FolderPlus size={22} className="text-accent" />
                </div>
                <div>
                  <h3 id="modal-title" className="font-black text-foreground tracking-tight text-lg sm:text-xl">New Folder</h3>
                  <p className="text-[11px] text-muted font-bold tracking-wide mt-0.5 uppercase">Organize workspace</p>
                </div>
              </div>
              <button 
                onClick={onClose} 
                className="p-2.5 text-muted hover:text-foreground hover:bg-card-hover hover:rotate-90 rounded-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-accent/20"
                aria-label="Close add folder modal"
              >
                <X size={18} strokeWidth={2.5} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
              {error && (
                <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-300">
                  {error}
                </div>
              )}
              <div>
                <label 
                  htmlFor="folderName" 
                  className="block text-[10px] uppercase tracking-widest text-muted font-black mb-2 ml-1"
                >
                  Folder Name
                </label>
                <div className="relative group">
                  <FolderIcon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-accent transition-colors duration-300" />
                  <input
                    id="folderName"
                    ref={inputRef}
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full min-h-12 bg-background border border-border rounded-xl px-4 py-3.5 pl-11 text-sm font-bold text-foreground placeholder:text-muted/50 focus:outline-none focus:border-accent/50 focus:ring-4 focus:ring-accent/10 transition-all shadow-sm"
                    placeholder="e.g. Design Assets, Tech Docs..."
                    autoComplete="off"
                  />
                  
                  {/* Subtle input background glow on hover */}
                  <div className="absolute inset-0 rounded-xl bg-linear-to-r from-accent/5 to-transparent opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-500" />
                </div>
                
                <div className="flex items-center gap-1 mt-2.5 ml-1 opacity-60">
                  <CornerDownLeft size={10} className="text-muted" />
                  <span className="text-[9px] font-bold text-muted uppercase tracking-widest">Press Enter to create</span>
                </div>
              </div>
              
              <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 min-h-12 px-4 py-3.5 rounded-xl bg-transparent border border-border text-foreground text-xs font-bold hover:bg-card-hover transition-colors focus:outline-none focus:ring-4 focus:ring-accent/10"
                >
                  Cancel
                </button>
                <Button 
                  type="submit" 
                  className="flex-1 min-h-12 py-3.5 rounded-xl text-xs uppercase tracking-widest font-black shadow-md hover:shadow-glow transition-all" 
                  loading={loading}
                  disabled={!name.trim() || loading}
                >
                  {loading ? 'Creating...' : 'Create Folder'}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
