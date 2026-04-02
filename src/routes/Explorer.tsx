import React, { useCallback, useEffect, useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  DndContext, 
  DragOverlay, 
  pointerWithin, 
  KeyboardSensor, 
  MouseSensor, 
  TouchSensor, 
  useSensor, 
  useSensors, 
  useDroppable 
} from '@dnd-kit/core';
import type { DragStartEvent, DragEndEvent } from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useSearchParams } from 'react-router-dom';
import { Sidebar } from '../components/layout/Sidebar';
import { Topbar } from '../components/layout/Topbar';
import { Grain } from '../components/ui/Grain';
import { AppGrid } from '../components/explorer/AppGrid';
import { AddFolderModal } from '../components/explorer/AddFolderModal';
import { AddAppModal } from '../components/explorer/AddAppModal';
import { explorerService } from '../lib/explorerService';
import type { Folder, App } from '../types/explorer';
import { ChevronRight, Plus, Folder as FolderIcon, LayoutGrid, ArrowDownToLine, Globe } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { cn } from '../lib/utils';
import { useAuth } from '../hooks/useAuth';
import { recordFolderUsage } from '../lib/contextEngine';
import { logger } from '../platform/observability/logger';
import { getErrorMessage } from '../lib/errorMessage';
import { Seo } from '../components/system/Seo';

// --- MAIN WORKSPACE DROPPABLE FOLDER CARD ---
const WorkspaceFolderCard = ({ folder, onClick }: { folder: Folder, onClick: () => void }) => {
  const { isOver, setNodeRef } = useDroppable({
    // FIX: Unique ID for workspace folders to prevent conflict with Sidebar folders!
    id: `workspace-folder-${folder.id}`, 
    data: { type: 'folder', folder }
  });

  return (
    <motion.div
      ref={setNodeRef}
      layout={false}
      variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
      whileHover={{ y: -5, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "h-48 rounded-[2.5rem] border transition-all duration-300 cursor-pointer group flex flex-col items-center justify-center gap-5 shadow-sm hover:shadow-xl relative surface-panel",
        isOver 
          ? "bg-accent border-accent shadow-[0_0_40px_rgba(var(--accent),0.4)] scale-[1.05] z-10" 
          : "hover:bg-card-hover hover:border-accent/30"
      )}
    >
      <div className={cn(
        "transition-all duration-300 flex flex-col items-center gap-4",
        isOver ? "opacity-0 scale-50 absolute" : "opacity-100 scale-100"
      )}>
        <div className="relative isolate w-20 h-20 rounded-3xl border border-border flex items-center justify-center bg-[var(--surface-strong)] group-hover:bg-accent group-hover:shadow-[0_26px_50px_-26px_rgba(79,70,229,0.5)] transition-all duration-500">
          <FolderIcon size={32} className="text-muted group-hover:text-white transition-colors" />
        </div>
        <span className="text-sm font-black tracking-wide text-muted group-hover:text-foreground transition-colors truncate w-full px-4 text-center">
          {folder.name}
        </span>
      </div>

      <div className={cn(
        "absolute inset-0 flex flex-col items-center justify-center bg-accent text-white transition-all duration-300 pointer-events-none",
        isOver ? "opacity-100 scale-100" : "opacity-0 scale-110"
      )}>
        <ArrowDownToLine size={40} className="mb-2 animate-bounce" />
        <span className="text-lg font-black uppercase tracking-widest">Drop Here</span>
      </div>
    </motion.div>
  );
};

const Explorer: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const folderFromUrl = searchParams.get('folder');
  const [folders, setFolders] = useState<Folder[]>([]);
  const [apps, setApps] = useState<App[]>([]);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(folderFromUrl);
  const [loading, setLoading] = useState(true);
  const [contentLoading, setContentLoading] = useState(false);
  const [folderTreeSyncKey, setFolderTreeSyncKey] = useState(0);
  const [workspaceError, setWorkspaceError] = useState<string | null>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const folderIdRef = useRef<string | null>(currentFolderId);
  const loadGenerationRef = useRef(0);
  const isFirstExplorerLoadRef = useRef(true);

  const { user } = useAuth();

  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [isAppModalOpen, setIsAppModalOpen] = useState(false);
  
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeType, setActiveType] = useState<'folder' | 'app' | null>(null);

  const handleFolderChange = useCallback((folderId: string | null) => {
    setMobileSidebarOpen(false);
    if (folderId) {
      recordFolderUsage(folderId);
    }
    setCurrentFolderId(folderId);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (folderId) next.set('folder', folderId);
      else next.delete('folder');
      return next;
    });
  }, [setSearchParams]);

  useEffect(() => {
    if (folderFromUrl !== currentFolderId) {
      setCurrentFolderId(folderFromUrl);
    }
  }, [currentFolderId, folderFromUrl]);

  const loadData = useCallback(async () => {
    const gen = ++loadGenerationRef.current;
    const folderForLoad = folderIdRef.current;

    setContentLoading(true);
    if (isFirstExplorerLoadRef.current) {
      setLoading(true);
    }
    try {
      setWorkspaceError(null);
      const fetchedFolders = await explorerService.getFolders();
      if (gen !== loadGenerationRef.current) return;
      setFolders(fetchedFolders);

      const fetchedApps = await explorerService.getApps(folderForLoad);
      if (gen !== loadGenerationRef.current) return;
      setApps(fetchedApps);
    } catch (error) {
      logger.error('explorer_load', error, { folderId: folderForLoad });
      setWorkspaceError(getErrorMessage(error, 'Unable to load workspace.'));
    } finally {
      if (gen === loadGenerationRef.current) {
        setLoading(false);
        isFirstExplorerLoadRef.current = false;
        setContentLoading(false);
        setFolderTreeSyncKey((k) => k + 1);
      }
    }
  }, []);

  useEffect(() => {
    if (!user?.id) return;

    const subscription = explorerService.subscribeToWorkspace(user.id, () => {
      void (async () => {
        try {
          const nextFolders = await explorerService.getFolders();
          setFolders(nextFolders);
          const fid = folderIdRef.current;
          const nextApps = await explorerService.getApps(fid);
          setApps(nextApps);
        } catch (e) {
          logger.warn('explorer_realtime_refresh', 'Realtime workspace refresh failed', { error: e });
        }
      })();
    });

    return () => {
      void subscription.unsubscribe();
    };
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) return;
    folderIdRef.current = currentFolderId;
    setApps([]);
    void loadData();
  }, [currentFolderId, user?.id, loadData]);

  const breadcrumbs = useMemo(() => {
    const path: Folder[] = [];
    let tempId = currentFolderId;
    while (tempId) {
      const folder = folders.find(f => f.id === tempId);
      if (folder) {
        path.unshift(folder);
        tempId = folder.parent_id;
      } else break;
    }
    return path;
  }, [currentFolderId, folders]);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);
    setActiveType(active.data.current?.type || null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setActiveType(null);

    if (!over) return;

    // INTELLIGENT ID PARSING: Resolve where the drop actually happened
    let targetFolderId: string | null = null;
    const overId = String(over.id);

    if (overId === 'root') {
      targetFolderId = null; // Dropped on Vault Root in Sidebar
    } else if (overId.startsWith('workspace-folder-')) {
      targetFolderId = overId.replace('workspace-folder-', ''); // Dropped on Jumbo Folder in Main Workspace
    } else {
      targetFolderId = overId; // Dropped directly on a Folder in the Sidebar!
    }

    // Prevent dropping on itself or dropping a folder into itself
    if (active.id === targetFolderId || active.id === over.id) return;

    try {
      if (active.data.current?.type === 'app') {
        setApps((prev) => prev.filter((a) => a.id !== active.id)); // Optimistic UI
        await explorerService.moveApp(active.id as string, targetFolderId);
      } else if (active.data.current?.type === 'folder') {
        await explorerService.moveFolder(active.id as string, targetFolderId);
      }
      setTimeout(loadData, 50); 
    } catch (error) {
      logger.error('explorer_drag_drop', error, { activeId: active.id, overId: over.id });
      loadData();
    }
  };

  const currentFolder = folders.find(f => f.id === currentFolderId);
  const currentFolderName = currentFolder?.name || 'Vault';
  const currentSubFolders = folders.filter(f => f.parent_id === currentFolderId);

  return (
    <DndContext 
      sensors={sensors} 
      collisionDetection={pointerWithin} 
      onDragStart={handleDragStart} 
      onDragEnd={handleDragEnd}
    >
      <div className="app-shell flex h-screen bg-background text-foreground overflow-hidden selection:bg-accent/30 selection:text-white transition-colors duration-500 relative">
        <Seo title="Explorer Workspace | Explorer" robots="noindex,nofollow" canonicalPath="/explorer" />
        <Grain opacity={0.3} />
        
        <div className="absolute top-[10%] right-[-10%] w-[600px] h-[600px] bg-accent/10 rounded-full blur-[150px] pointer-events-none mix-blend-screen" />
        <div className="absolute bottom-[-10%] left-[10%] w-[500px] h-[500px] bg-sky-400/10 dark:bg-sky-400/5 rounded-full blur-[150px] pointer-events-none mix-blend-screen" />
        
        {/* SIDEBAR NOW FULLY RECEIVES DROPS */}
        <Sidebar 
          currentFolderId={currentFolderId}
          onFolderSelect={handleFolderChange}
          onAddFolder={() => setIsFolderModalOpen(true)} 
          onAddApp={() => setIsAppModalOpen(true)}
          folderTreeSyncKey={folderTreeSyncKey}
          mobileOpen={mobileSidebarOpen}
          onMobileClose={() => setMobileSidebarOpen(false)}
        />
        
        <main className="flex-1 flex flex-col relative z-10 overflow-hidden bg-background/35 backdrop-blur-3xl border-l border-border">
          <Topbar onOpenSidebar={() => setMobileSidebarOpen(true)} />

          <div className="relative flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 md:p-8 lg:p-12">
            <AnimatePresence mode="wait">
              {loading && folders.length === 0 ? (
                <motion.div 
                  key="loader"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="absolute inset-0 flex flex-col items-center justify-center text-muted gap-5"
                >
                  <div className="w-12 h-12 border-2 border-accent/20 border-t-accent rounded-full animate-spin" />
                </motion.div>
              ) : (
                <motion.div 
                  key={currentFolderId ?? 'vault-root'}
                  initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className="max-w-[1400px] mx-auto"
                >
                  <div className="relative z-10 mb-8 flex flex-col justify-between gap-6 sm:mb-10 md:flex-row md:items-end lg:mb-12">
                    <div className="flex items-start gap-4 sm:items-center sm:gap-6">
                      <motion.div 
                        className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-[1.5rem] border border-border bg-card shadow-[0_18px_40px_-28px_rgba(15,23,42,0.18)] backdrop-blur-2xl group sm:h-20 sm:w-20 sm:rounded-[2rem]"
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        {currentFolderId ? <FolderIcon size={32} className="text-accent relative z-10" /> : <LayoutGrid size={32} className="text-accent relative z-10" />}
                      </motion.div>
                      
                        <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-3 overflow-x-auto no-scrollbar py-1">
                          <button 
                            onClick={() => handleFolderChange(null)}
                            className="text-muted hover:text-foreground text-[10px] uppercase tracking-widest font-black transition-colors flex items-center gap-1 shrink-0"
                          >
                            <LayoutGrid size={12} /> Root
                          </button>
                          
                          {breadcrumbs.map((crumb, idx) => (
                            <React.Fragment key={crumb.id}>
                              <ChevronRight size={12} className="text-muted shrink-0" />
                              <button 
                                onClick={() => handleFolderChange(crumb.id)}
                                className={`text-[10px] uppercase tracking-widest font-black px-2.5 py-1 rounded-md transition-all shrink-0 ${
                                  idx === breadcrumbs.length - 1 
                                    ? "bg-accent/10 text-accent border border-accent/20" 
                                    : "text-muted hover:text-foreground hover:bg-card-hover"
                                }`}
                              >
                                {crumb.name}
                              </button>
                            </React.Fragment>
                          ))}
                        </div>
                        <h1 className="bg-gradient-to-br from-foreground via-foreground to-accent/60 bg-clip-text text-3xl font-black tracking-tighter text-transparent sm:text-4xl md:text-5xl lg:text-6xl">
                          {currentFolderName}
                        </h1>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                       <Button size="sm" variant="outline" className="h-11 w-full rounded-2xl px-5 text-[11px] uppercase tracking-widest font-black sm:h-12 sm:px-6" onClick={() => setIsFolderModalOpen(true)}>
                         <FolderIcon size={14} className="mr-2" /> New Folder
                       </Button>
                       <Button size="sm" className="h-11 w-full rounded-2xl px-5 text-[11px] uppercase tracking-widest font-black shadow-[0_0_20px_rgba(var(--accent),0.3)] transition-all hover:shadow-[0_0_30px_rgba(var(--accent),0.5)] sm:h-12 sm:px-8" onClick={() => setIsAppModalOpen(true)}>
                         <Plus size={16} className="mr-2 stroke-[3.5px]" /> Add App
                       </Button>
                    </div>
                  </div>

                  {currentSubFolders.length > 0 && (
                    <section className={cn("mb-16 transition-opacity duration-200", contentLoading && "opacity-60 pointer-events-none")}>
                      <p className="text-[10px] uppercase tracking-[0.2em] text-muted font-black mb-6 flex items-center gap-3">
                        Sub-directories <span className="h-px flex-1 bg-border" />
                      </p>
                      <motion.div 
                        initial="hidden" animate="show"
                        variants={{ show: { transition: { staggerChildren: 0.05 } } }}
                        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6"
                      >
                        {currentSubFolders.map((folder) => (
                          <WorkspaceFolderCard 
                            key={folder.id} 
                            folder={folder} 
                            onClick={() => handleFolderChange(folder.id)} 
                          />
                        ))}
                      </motion.div>
                    </section>
                  )}

                  <section className={cn("relative", contentLoading && "min-h-[200px]")}>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-muted font-black mb-6 flex items-center gap-3">
                      Resources <span className="h-px flex-1 bg-border" />
                    </p>

                    {workspaceError && !contentLoading && (
                      <div className="mb-6 rounded-3xl border border-amber-500/20 bg-amber-500/5 p-4 text-sm font-medium text-amber-700 dark:text-amber-300">
                        {workspaceError}
                      </div>
                    )}
                    
                    {contentLoading && (
                      <div className="absolute inset-0 top-10 z-10 flex items-start justify-center pt-16 bg-background/40 backdrop-blur-[2px] rounded-3xl pointer-events-none">
                        <div className="w-10 h-10 border-2 border-accent/20 border-t-accent rounded-full animate-spin" />
                      </div>
                    )}
                    {apps.length > 0 ? (
                      <AppGrid
                        key={currentFolderId ?? 'root'}
                        apps={apps}
                        scopeKey={currentFolderId ?? 'root'}
                        onWorkspaceChange={loadData}
                      />
                    ) : !contentLoading ? (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
                        className="surface-panel h-80 w-full rounded-[3rem] border-2 border-dashed border-border flex flex-col items-center justify-center text-center p-10 hover:bg-card-hover transition-all duration-500 cursor-pointer group"
                        onClick={() => setIsAppModalOpen(true)}
                      >
                        <div className="w-20 h-20 rounded-3xl bg-[var(--surface-strong)] border border-border flex items-center justify-center text-muted mb-6 group-hover:text-accent transition-all shadow-xl">
                           <Plus size={36} className="stroke-[2.5px]" />
                        </div>
                        <h3 className="text-xl font-black text-foreground mb-3">Vault is empty</h3>
                        <p className="text-muted text-sm max-w-sm leading-relaxed font-medium">
                          Organize your digital workspace by adding your first web application.
                        </p>
                      </motion.div>
                    ) : null}
                  </section>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>

        <DragOverlay dropAnimation={{ duration: 250, easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)' }}>
          {activeId ? (
            <div className="p-4 rounded-3xl bg-card border border-accent shadow-[0_0_50px_rgba(var(--accent),0.4)] opacity-95 scale-105 rotate-3 flex items-center gap-4 backdrop-blur-xl">
              <div className="w-12 h-12 rounded-2xl bg-accent/20 flex items-center justify-center">
                {activeType === 'folder' ? <FolderIcon size={20} className="text-accent" /> : <Globe size={20} className="text-accent" />}
              </div>
              <div className="pr-4">
                <p className="text-[10px] uppercase tracking-widest text-muted font-bold mb-0.5">Moving Item</p>
                <p className="text-base font-black text-foreground capitalize">{activeType}</p>
              </div>
            </div>
          ) : null}
        </DragOverlay>

        <AddFolderModal isOpen={isFolderModalOpen} onClose={() => setIsFolderModalOpen(false)} onSuccess={loadData} parentId={currentFolderId} />
        <AddAppModal isOpen={isAppModalOpen} onClose={() => setIsAppModalOpen(false)} onSuccess={loadData} folderId={currentFolderId} />
      </div>
    </DndContext>
  );
};

export default Explorer;
