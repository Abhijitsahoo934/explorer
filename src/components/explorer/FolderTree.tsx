import React, { useEffect, useState } from 'react';
import { ChevronRight, Folder, FolderOpen, Loader2, Trash2, Edit3, GripVertical, LayoutGrid, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '../../lib/utils';
import { explorerService } from '../../lib/explorerService';
import type { Folder as FolderType } from '../../types/explorer';
import { RenameModal } from './RenameModal';
import { AddFolderModal } from './AddFolderModal';
import { useAuth } from '../../hooks/useAuth';

interface FolderNodeProps {
  folder: FolderType;
  allFolders: FolderType[];
  level: number;
  activeFolderId: string | null;
  onSelect: (id: string) => void;
  onTreeRefresh: () => void;
}

const FolderNode: React.FC<FolderNodeProps> = ({ folder, allFolders, level, activeFolderId, onSelect, onTreeRefresh }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [isAddSubfolderOpen, setIsAddSubfolderOpen] = useState(false);
  
  const isActive = activeFolderId === folder.id;
  const subFolders = allFolders.filter(f => f.parent_id === folder.id);
  const hasSubFolders = subFolders.length > 0;
  const isChildActive = allFolders.some(f => f.id === activeFolderId && f.parent_id === folder.id);
  const isExpanded = isOpen || isChildActive;

  const { isOver, setNodeRef: setDroppableRef } = useDroppable({
    id: folder.id,
    data: { type: 'folder', folder: folder }
  });

  const { attributes, listeners, setNodeRef: setDraggableRef, transform, isDragging } = useDraggable({
    id: folder.id,
    data: { type: 'folder', folder: folder }
  });

  const setCombinedNodeRef = (node: HTMLElement | null) => {
    setDroppableRef(node);
    setDraggableRef(node);
  };

  const dndStyle = transform ? { transform: CSS.Translate.toString(transform), zIndex: 50 } : {};

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`⚠️ Delete "${folder.name}" and all its contents?`)) {
      try {
        await explorerService.deleteFolder(folder.id);
        if (isActive) onSelect('');
      } catch (error) { console.error("Delete failed:", error); }
    }
  };

  const handleNodeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(folder.id);
    if (hasSubFolders) setIsOpen(!isExpanded); // Folder pe click karne se bhi toggle hoga!
  };

  return (
    <motion.div layout className="select-none relative">
      <motion.div 
        ref={setCombinedNodeRef}
        layout
        onClick={handleNodeClick}
        whileTap={{ scale: 0.99 }}
        className={cn(
          "flex items-center gap-1.5 py-2.5 px-2 min-h-[44px] rounded-xl cursor-pointer transition-all duration-200 group relative border mb-1",
          // THEME ADAPTIVE COLORS
          isActive 
            ? "bg-accent/10 border-accent/20 text-accent shadow-sm" 
            : isOver 
              ? "bg-accent/20 border-accent scale-[1.02] z-10 ring-2 ring-accent/50" 
              : "border-transparent text-zinc-700 dark:text-zinc-400 hover:bg-card-hover hover:border-border hover:text-foreground",
          isDragging ? "opacity-30 border-dashed border-accent/50 pointer-events-none" : ""
        )}
        style={{ paddingLeft: `${level * 16 + 8}px`, touchAction: 'none', ...dndStyle }}
      >
        {level > 0 && Array.from({ length: level }).map((_, i) => (
          <div key={i} className="absolute top-0 bottom-0 border-l border-zinc-200 dark:border-white/10" style={{ left: `${(i + 1) * 16}px` }} />
        ))}

        {/* 1. SEPARATED TOGGLE CHEVRON */}
        <div 
          className={cn(
            "flex items-center justify-center w-6 h-6 rounded-lg hover:bg-card shrink-0 z-20 transition-colors", 
            !hasSubFolders && "opacity-0 pointer-events-none"
          )}
          onClick={(e) => { e.stopPropagation(); setIsOpen(!isExpanded); }}
        >
          <motion.div animate={{ rotate: isExpanded ? 90 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronRight size={16} className={isActive ? "text-accent" : "text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300"} />
          </motion.div>
        </div>

        {/* 2. SEPARATED DRAG HANDLE */}
        <div 
          {...attributes} {...listeners}
          className="flex items-center justify-center w-5 h-6 opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing hover:bg-card rounded-lg transition-opacity shrink-0 z-20"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical size={14} className="text-zinc-400 hover:text-foreground" />
        </div>
        
        {/* 3. ICON & NAME */}
        <div className="relative z-10 flex items-center gap-2.5 flex-1 min-w-0">
          {isExpanded || isActive ? (
            <FolderOpen size={16} className={cn("shrink-0", isActive ? "text-accent" : "text-zinc-500 dark:text-zinc-400")} />
          ) : (
            <Folder size={16} className="text-zinc-400 shrink-0 group-hover:text-zinc-700 dark:group-hover:text-zinc-300 transition-colors" />
          )}
          <span className={cn(
            "text-[13px] truncate transition-all tracking-tight z-10 w-full",
            isActive ? "font-bold text-zinc-900 dark:text-white" : "font-medium"
          )}>
            {folder.name}
          </span>
        </div>

        {/* 4. ACTIONS */}
        <div className="absolute right-2 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-all duration-200 z-20 rounded-xl border border-border bg-background/95 p-1 shadow-[0_12px_30px_-18px_rgba(15,23,42,0.35)] backdrop-blur-xl">
          <button onClick={(e) => { e.stopPropagation(); setIsAddSubfolderOpen(true); }} className="p-1.5 text-zinc-500 hover:text-accent hover:bg-accent/10 rounded-md transition-colors"><Plus size={14} /></button>
          <button onClick={(e) => { e.stopPropagation(); setIsRenaming(true); }} className="p-1.5 text-zinc-500 hover:text-foreground hover:bg-card rounded-md transition-colors"><Edit3 size={14} /></button>
          <button onClick={handleDelete} className="p-1.5 text-zinc-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-md transition-colors"><Trash2 size={14} /></button>
        </div>
      </motion.div>
      
      <AnimatePresence initial={false}>
        {isExpanded && hasSubFolders && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="py-0.5">
              {subFolders.map(sub => (
                <FolderNode key={sub.id} folder={sub} allFolders={allFolders} level={level + 1} activeFolderId={activeFolderId} onSelect={onSelect} onTreeRefresh={onTreeRefresh} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {isRenaming && (
        <RenameModal
          isOpen={isRenaming}
          onClose={() => setIsRenaming(false)}
          onSuccess={() => {
            onTreeRefresh();
          }}
          itemId={folder.id}
          initialName={folder.name}
          itemType="folder"
        />
      )}
      {isAddSubfolderOpen && (
        <AddFolderModal
          isOpen={isAddSubfolderOpen}
          onClose={() => setIsAddSubfolderOpen(false)}
          parentId={folder.id}
          onSuccess={() => {
            onTreeRefresh();
            setIsOpen(true);
          }}
        />
      )}
    </motion.div>
  );
};

export const FolderTree: React.FC<{
  currentFolderId: string | null;
  onFolderSelect: (id: string | null) => void;
  /** Increment when Explorer refreshes folders so sidebar tree matches without waiting for realtime */
  syncKey?: number;
}> = ({ currentFolderId, onFolderSelect, syncKey = 0 }) => {
  const [folders, setFolders] = useState<FolderType[]>([]);
  const [loading, setLoading] = useState(true);

  const { isOver: isRootOver, setNodeRef: setRootRef } = useDroppable({ id: 'root', data: { type: 'root' } });
  const { user } = useAuth();

  const fetchFolders = async () => {
    try { setFolders(await explorerService.getFolders()); } 
    catch (error) { console.error("Tree", error); } 
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (!user?.id) return;
    fetchFolders();
    const subscription = explorerService.subscribeToWorkspace(user.id, fetchFolders);
    return () => {
      void subscription.unsubscribe();
    };
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id || syncKey === 0) return;
    void fetchFolders();
  }, [syncKey, user?.id]);

  if (loading) return <div className="py-10 flex justify-center"><Loader2 className="animate-spin text-accent" size={20} /></div>;

  return (
    <div className="space-y-0.5 pb-32 overflow-x-hidden pr-1 min-h-[50vh] transition-all rounded-2xl relative">
      <div 
        ref={setRootRef}
        onClick={() => onFolderSelect(null)}
        className={cn(
          "flex items-center gap-3 px-4 py-3.5 min-h-[48px] rounded-xl cursor-pointer transition-all mb-4 border",
          currentFolderId === null ? "bg-accent/10 border-accent/20 text-accent font-bold shadow-sm" : "border-transparent text-zinc-600 hover:bg-card-hover hover:border-border dark:text-zinc-400 hover:text-foreground",
          isRootOver ? "bg-accent/20 border-accent scale-[1.02] ring-2 ring-accent/50 z-10" : ""
        )}
      >
        <LayoutGrid size={18} className={currentFolderId === null || isRootOver ? "text-accent" : "text-zinc-400"} />
        <span className="text-[13px] uppercase tracking-widest font-bold">Vault Root</span>
      </div>

      <div className="h-px bg-zinc-200 dark:bg-white/10 mx-3 mb-4" />

      {folders.filter(f => !f.parent_id).map((folder) => (
        <FolderNode
          key={folder.id}
          folder={folder}
          allFolders={folders}
          level={0}
          activeFolderId={currentFolderId}
          onSelect={onFolderSelect}
          onTreeRefresh={fetchFolders}
        />
      ))}
    </div>
  );
};
