import React, { useState, useEffect, useCallback } from 'react';
import { FolderPlus, Plus, LogOut, Settings, PanelLeftClose, PanelLeft, X, LayoutDashboard } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FolderTree } from '../explorer/FolderTree';
import { cn } from '../../lib/utils'; // <--- YE IMPORT MISSING THA! FIX HO GAYA!
import { BrandLogo } from '../ui/BrandLogo';
import { SettingsModal } from './SettingsModal';

interface SidebarProps {
  onAddFolder: () => void;
  onAddApp: () => void;
  currentFolderId?: string | null;
  onFolderSelect?: (id: string | null) => void;
  /** Bump when Explorer refreshes folder list so the tree stays in sync without a full page reload */
  folderTreeSyncKey?: number;
  activeDragId?: string | null;
  activeDragType?: 'folder' | 'app' | null;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  onAddFolder, 
  onAddApp,
  currentFolderId = null,
  onFolderSelect = () => {},
  folderTreeSyncKey = 0,
  activeDragId = null,
  activeDragType = null,
  mobileOpen = false,
  onMobileClose,
}) => {
  const navigate = useNavigate();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const goToDashboard = () => {
    onMobileClose?.();
    navigate('/dashboard');
  };
  
  // --- RESIZE & COLLAPSE LOGIC ---
  const [sidebarWidth, setSidebarWidth] = useState(280);
  const [isResizing, setIsResizing] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const startResizing = useCallback(() => setIsResizing(true), []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      let newWidth = e.clientX;
      
      // If width gets too small, auto-collapse
      if (newWidth < 150) {
        setIsCollapsed(true);
        setSidebarWidth(280); // Memory of expanded width
      } else {
        setIsCollapsed(false);
        if (newWidth > 450) newWidth = 450; // Max width
        setSidebarWidth(newWidth);
      }
    };

    const handleMouseUp = () => setIsResizing(false);

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize'; 
    } else {
      document.body.style.cursor = 'default';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/auth', { replace: true });
    } catch (error) { console.error('Logout failed:', error); }
  };

  const actualWidth = isCollapsed ? 84 : sidebarWidth;
  const desktopWidth = `${actualWidth}px`;

  return (
    <>
      <AnimatePresence>
        {mobileOpen && (
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onMobileClose}
            className="fixed inset-0 z-30 bg-slate-950/45 backdrop-blur-sm lg:hidden"
            aria-label="Close navigation"
          />
        )}
      </AnimatePresence>

      <motion.aside
        animate={{ width: desktopWidth }}
        transition={{ duration: isResizing ? 0 : 0.3, ease: "easeInOut" }}
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex h-screen w-[min(92vw,340px)] max-w-85 shrink-0 flex-col border-r border-border/85 bg-sidebar/90 shadow-(--panel-shadow) backdrop-blur-2xl transition-all duration-300 lg:static lg:z-20 lg:w-auto lg:max-w-none lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
          "lg:transform-none!"
        )}
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-accent/35 to-transparent" />
        {/* DRAG RESIZE HANDLE */}
        <div
          onMouseDown={startResizing}
          className="absolute top-0 right-0 bottom-0 z-50 hidden w-1.5 cursor-col-resize opacity-0 transition-colors hover:bg-accent/40 hover:opacity-100 active:bg-accent lg:block"
          title="Drag to resize"
        />

        {/* HEADER */}
        <div className="flex h-20 items-center justify-between border-b border-border/80 px-4 shrink-0 lg:px-5">
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-3 cursor-pointer group flex-1 overflow-hidden"
              >
                <BrandLogo className="relative h-10 w-10 shrink-0 rounded-xl group-hover:scale-105 transition-transform duration-300" />
                <div className="truncate pr-2">
                  <span className="font-black tracking-tighter text-lg text-foreground uppercase block leading-none truncate">Explorer</span>
                  <span className="text-[9px] uppercase tracking-[0.2em] text-accent font-bold truncate">Workspace</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="mx-auto hidden shrink-0 rounded-xl border border-transparent p-2 text-muted transition-all hover:border-border hover:bg-card-hover hover:text-foreground active:scale-95 focus:outline-none focus-visible:ring-4 focus-visible:ring-accent/10 lg:block"
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? <PanelLeft size={20} className="text-accent" /> : <PanelLeftClose size={20} />}
          </button>

          <button
            type="button"
            onClick={onMobileClose}
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-border p-2 text-muted transition-all hover:bg-card-hover hover:text-foreground active:scale-95 lg:hidden"
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>

        {/* QUICK ACTIONS */}
        <div className="p-4 space-y-3 border-b border-border/80 shrink-0">
          {!isCollapsed && (
            <p className="px-1 text-[10px] uppercase tracking-[0.22em] text-muted font-black">Quick Actions</p>
          )}
          <button
            onClick={goToDashboard}
            className={cn(
              "w-full flex items-center justify-center gap-2 rounded-xl bg-card/70 hover:bg-card-hover transition-colors border border-border text-foreground focus:outline-none focus-visible:ring-4 focus-visible:ring-accent/10 active:scale-[0.99] overflow-hidden min-h-12",
              isCollapsed ? "px-0" : "px-4"
            )}
            title="Dashboard"
          >
            <LayoutDashboard size={16} className={cn("shrink-0", isCollapsed ? "text-foreground" : "text-muted")} />
            {!isCollapsed && <span className="text-[11px] uppercase tracking-widest font-bold whitespace-nowrap">Home</span>}
          </button>

          <button
            onClick={onAddApp}
            className={cn(
              "w-full flex items-center justify-center gap-2 rounded-xl transition-all focus:outline-none focus-visible:ring-4 focus-visible:ring-accent/25 active:scale-[0.99] overflow-hidden shadow-lg min-h-12",
              isCollapsed ? "px-0 bg-linear-to-r from-accent to-sky-500 text-white" : "px-4 bg-linear-to-r from-accent to-sky-500 text-white hover:from-accent-hover hover:to-sky-600 hover:shadow-[0_0_24px_rgba(56,189,248,0.32)]"
            )}
            title="Add App"
          >
            <Plus size={18} className="stroke-[3px] shrink-0" />
            {!isCollapsed && <span className="text-xs uppercase tracking-widest font-black whitespace-nowrap">Add App</span>}
          </button>

          <button
            onClick={onAddFolder}
            className={cn(
              "w-full flex items-center justify-center gap-2 rounded-xl bg-card/70 hover:bg-card-hover transition-colors border border-border text-foreground focus:outline-none focus-visible:ring-4 focus-visible:ring-accent/10 active:scale-[0.99] overflow-hidden min-h-12",
              isCollapsed ? "px-0" : "px-4"
            )}
            title="New Folder"
          >
            <FolderPlus size={16} className={cn("shrink-0", isCollapsed ? "text-foreground" : "text-muted")} />
            {!isCollapsed && <span className="text-[11px] uppercase tracking-widest font-bold whitespace-nowrap">New Folder</span>}
          </button>
        </div>

        {/* FOLDER TREE AREA */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 custom-scrollbar relative">
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-0.5 whitespace-nowrap">
                <div className="mb-4 px-2 mt-2">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-muted font-black">Workspace</p>
                  {activeDragType === 'folder' && (
                    <p className="mt-2 rounded-lg border border-accent/30 bg-accent/10 px-2.5 py-1.5 text-[10px] font-black uppercase tracking-wider text-accent">
                      Drop on folder to nest. Drop on Root to move out.
                    </p>
                  )}
                </div>
                <FolderTree
                  currentFolderId={currentFolderId}
                  onFolderSelect={onFolderSelect}
                  syncKey={folderTreeSyncKey}
                  activeDragId={activeDragId}
                  activeDragType={activeDragType}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* FOOTER / SETTINGS */}
        <div className="p-3 border-t border-border/80 shrink-0 space-y-1 bg-card/45">
          {!isCollapsed && <p className="px-4 pb-1 text-[10px] uppercase tracking-[0.22em] text-muted font-black">Account</p>}
          <button
            onClick={() => setIsSettingsOpen(true)}
            className={cn(
              "w-full flex items-center gap-3 rounded-xl text-muted hover:text-foreground hover:bg-card-hover transition-all group overflow-hidden min-h-11 focus:outline-none focus-visible:ring-4 focus-visible:ring-accent/10 active:scale-[0.99]",
              isCollapsed ? "justify-center px-0" : "px-4"
            )}
            title="Settings"
          >
            <Settings size={18} className="group-hover:rotate-90 transition-transform duration-500 shrink-0" />
            {!isCollapsed && <span className="text-xs font-bold tracking-wide whitespace-nowrap">Settings</span>}
          </button>
          
          <button
            onClick={handleLogout}
            className={cn(
              "w-full flex items-center gap-3 rounded-xl text-muted hover:text-red-500 hover:bg-red-500/10 transition-all group overflow-hidden min-h-11 focus:outline-none focus-visible:ring-4 focus-visible:ring-red-500/20 active:scale-[0.99]",
              isCollapsed ? "justify-center px-0" : "px-4"
            )}
            title="Logout"
          >
            <LogOut size={18} className="group-hover:-translate-x-1 transition-transform duration-300 shrink-0" />
            {!isCollapsed && <span className="text-xs font-bold tracking-wide whitespace-nowrap">Sign out</span>}
          </button>
        </div>
      </motion.aside>

      {isSettingsOpen && <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />}
    </>
  );
};
