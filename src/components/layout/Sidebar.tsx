import React, { useState, useEffect, useCallback } from 'react';
import { LayoutGrid, FolderPlus, Plus, LogOut, Settings, PanelLeftClose, PanelLeft } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FolderTree } from '../explorer/FolderTree';
import { SettingsModal } from './SettingsModal';
import { cn } from '../../lib/utils'; // <--- YE IMPORT MISSING THA! FIX HO GAYA!

interface SidebarProps {
  onAddFolder: () => void;
  onAddApp: () => void;
  currentFolderId?: string | null;
  onFolderSelect?: (id: string | null) => void;
  /** Bump when Explorer refreshes folder list so the tree stays in sync without a full page reload */
  folderTreeSyncKey?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  onAddFolder, 
  onAddApp,
  currentFolderId = null,
  onFolderSelect = () => {},
  folderTreeSyncKey = 0,
}) => {
  const navigate = useNavigate();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
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

  return (
    <>
      <motion.aside
        animate={{ width: actualWidth }}
        transition={{ duration: isResizing ? 0 : 0.3, ease: "easeInOut" }}
        className="h-screen bg-sidebar/90 backdrop-blur-2xl border-r border-border flex flex-col relative z-20 shrink-0 select-none transition-colors shadow-[var(--panel-shadow)]"
      >
        {/* DRAG RESIZE HANDLE */}
        <div
          onMouseDown={startResizing}
          className="absolute top-0 right-0 bottom-0 w-1.5 cursor-col-resize hover:bg-accent/40 active:bg-accent z-50 transition-colors opacity-0 hover:opacity-100"
          title="Drag to resize"
        />

        {/* HEADER */}
        <div className="h-20 flex items-center justify-between px-5 border-b border-border shrink-0">
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-3 cursor-pointer group flex-1 overflow-hidden"
              >
                <div className="relative w-10 h-10 shrink-0 rounded-xl bg-[var(--surface-strong)] border border-border flex items-center justify-center text-foreground shadow-sm group-hover:scale-105 transition-transform duration-300">
                  <LayoutGrid size={20} strokeWidth={2.5} />
                </div>
                <div className="truncate pr-2">
                  <span className="font-black tracking-tighter text-lg text-foreground uppercase block leading-none truncate">Explorer</span>
                  <span className="text-[9px] uppercase tracking-[0.2em] text-accent font-bold truncate">Workspace OS</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 text-muted hover:text-foreground hover:bg-card-hover rounded-xl transition-all focus:outline-none shrink-0 mx-auto border border-transparent hover:border-border"
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? <PanelLeft size={20} className="text-accent" /> : <PanelLeftClose size={20} />}
          </button>
        </div>

        {/* QUICK ACTIONS */}
        <div className="p-4 space-y-3 border-b border-border shrink-0">
          <button
            onClick={onAddApp}
            className={cn(
              "w-full flex items-center justify-center gap-2 py-3.5 rounded-xl transition-all focus:outline-none overflow-hidden shadow-lg",
              isCollapsed ? "px-0 bg-accent text-white" : "px-4 bg-accent text-white hover:bg-accent-hover hover:shadow-[0_0_24px_rgba(99,102,241,0.28)]"
            )}
            title="Add App"
          >
            <Plus size={18} className="stroke-[3px] shrink-0" />
            {!isCollapsed && <span className="text-xs uppercase tracking-widest font-black whitespace-nowrap">Add App</span>}
          </button>

          <button
            onClick={onAddFolder}
            className={cn(
              "w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-card/60 hover:bg-card-hover transition-colors border border-border text-foreground focus:outline-none overflow-hidden",
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
                  <p className="text-[10px] uppercase tracking-[0.2em] text-muted font-black">Your Vault</p>
                </div>
                <FolderTree currentFolderId={currentFolderId} onFolderSelect={onFolderSelect} syncKey={folderTreeSyncKey} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* FOOTER / SETTINGS */}
        <div className="p-3 border-t border-border shrink-0 space-y-1 bg-card/40">
          <button
            onClick={() => setIsSettingsOpen(true)}
            className={cn(
              "w-full flex items-center gap-3 py-3 rounded-xl text-muted hover:text-foreground hover:bg-card-hover transition-all group overflow-hidden",
              isCollapsed ? "justify-center px-0" : "px-4"
            )}
            title="Settings"
          >
            <Settings size={18} className="group-hover:rotate-90 transition-transform duration-500 shrink-0" />
            {!isCollapsed && <span className="text-xs font-bold tracking-wide whitespace-nowrap">Preferences</span>}
          </button>
          
          <button
            onClick={handleLogout}
            className={cn(
              "w-full flex items-center gap-3 py-3 rounded-xl text-muted hover:text-red-500 hover:bg-red-500/10 transition-all group overflow-hidden",
              isCollapsed ? "justify-center px-0" : "px-4"
            )}
            title="Logout"
          >
            <LogOut size={18} className="group-hover:-translate-x-1 transition-transform duration-300 shrink-0" />
            {!isCollapsed && <span className="text-xs font-bold tracking-wide whitespace-nowrap">Terminate</span>}
          </button>
        </div>
      </motion.aside>

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </>
  );
};
