import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Folder,
  Globe,
  CornerDownLeft,
  Sparkles,
  LayoutGrid,
  LayoutDashboard,
  Layers,
  BarChart3,
  Zap,
} from 'lucide-react';
import type { CommandPaletteItem } from '../../lib/commandPaletteUtils';
import { cn } from '../../lib/utils';
import { subscribeMediaQuery } from '../../platform/browser/mediaQuery';

const MAX_RENDERED_ITEMS_DEFAULT = 80;
const MAX_RENDERED_ITEMS_ACTIVE_FILTER = 120;

function HighlightMatch({ text, query }: { text: string; query: string }) {
  const q = query.trim();
  if (!q) return <>{text}</>;

  const lower = text.toLowerCase();
  const qi = lower.indexOf(q.toLowerCase());
  if (qi === -1) {
    return <>{text}</>;
  }

  const before = text.slice(0, qi);
  const match = text.slice(qi, qi + q.length);
  const after = text.slice(qi + q.length);

  return (
    <>
      {before}
      <mark className="rounded bg-accent/25 px-0.5 text-foreground">{match}</mark>
      {after}
    </>
  );
}

const ACTION_ICONS: Record<string, React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>> = {
  'action-explorer': LayoutGrid,
  'action-dashboard': LayoutDashboard,
  'action-templates': Layers,
  'action-insights': BarChart3,
};

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  query: string;
  onQueryChange: (q: string) => void;
  debouncedQuery: string;
  items: CommandPaletteItem[];
  loading: boolean;
  selectedIndex: number;
  onSelectIndex: (i: number) => void;
  onExecute: (item: CommandPaletteItem) => void;
  quickActionCount: number;
  macroCutoff: number;
  contextCutoff: number;
  recentCutoff: number;
  hasActiveFilter: boolean;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  query,
  onQueryChange,
  debouncedQuery,
  items,
  loading,
  selectedIndex,
  onSelectIndex,
  onExecute,
  quickActionCount,
  macroCutoff,
  contextCutoff,
  recentCutoff,
  hasActiveFilter,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [isCompactViewport, setIsCompactViewport] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const compactMedia = window.matchMedia('(max-width: 768px)');
    const motionMedia = window.matchMedia('(prefers-reduced-motion: reduce)');

    const apply = () => {
      setIsCompactViewport(compactMedia.matches);
      setPrefersReducedMotion(motionMedia.matches);
    };

    apply();

    const unsubscribeCompact = subscribeMediaQuery(compactMedia, apply);
    const unsubscribeMotion = subscribeMediaQuery(motionMedia, apply);

    return () => {
      unsubscribeCompact();
      unsubscribeMotion();
    };
  }, []);

  const maxRenderedItems = hasActiveFilter ? MAX_RENDERED_ITEMS_ACTIVE_FILTER : MAX_RENDERED_ITEMS_DEFAULT;
  const visibleItems = useMemo(() => items.slice(0, maxRenderedItems), [items, maxRenderedItems]);
  const truncatedCount = Math.max(0, items.length - visibleItems.length);

  useEffect(() => {
    if (!isOpen) return;
    const id = window.setTimeout(() => inputRef.current?.focus(), 50);
    return () => window.clearTimeout(id);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const clampedIndex = Math.min(selectedIndex, Math.max(0, visibleItems.length - 1));
    if (clampedIndex !== selectedIndex) {
      onSelectIndex(clampedIndex);
      return;
    }
    const el = listRef.current?.querySelector<HTMLElement>(`[data-cmd-index="${clampedIndex}"]`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [isOpen, selectedIndex, visibleItems, onSelectIndex]);

  useEffect(() => {
    if (!isOpen) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        onSelectIndex(Math.min(selectedIndex + 1, Math.max(0, visibleItems.length - 1)));
        return;
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        onSelectIndex(Math.max(0, selectedIndex - 1));
        return;
      }

      if (e.key === 'Enter' && visibleItems[selectedIndex]) {
        e.preventDefault();
        onExecute(visibleItems[selectedIndex]);
      }
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, visibleItems, onClose, onExecute, onSelectIndex, selectedIndex]);

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  const contextStart = quickActionCount + macroCutoff;
  const recentStart = quickActionCount + macroCutoff + contextCutoff;
  const workspaceStart = quickActionCount + macroCutoff + contextCutoff + recentCutoff;
  const showWorkspaceSection = !hasActiveFilter && visibleItems.length > workspaceStart;

  const rowKeys = useMemo(() => visibleItems.map((it) => `${it.type}:${it.id}`), [visibleItems]);
  const firstAiIndex = useMemo(() => visibleItems.findIndex((it) => it.type === 'ai'), [visibleItems]);
  const reducedMotionExperience = isCompactViewport || prefersReducedMotion;
  const shouldAnimateRows = !reducedMotionExperience;

  const content = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-240 flex items-start justify-center p-4 pt-[min(12vh,120px)] sm:pt-[15vh]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reducedMotionExperience ? 0.12 : 0.2 }}
        >
          <motion.button
            type="button"
            aria-label="Close command palette"
            className="absolute inset-0 bg-[#030306]/75 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Command palette"
            initial={reducedMotionExperience ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 8 }}
            animate={reducedMotionExperience ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
            exit={reducedMotionExperience ? { opacity: 0 } : { opacity: 0, scale: 0.98, y: 6 }}
            transition={
              reducedMotionExperience
                ? { duration: 0.12, ease: 'easeOut' }
                : { type: 'spring', damping: 28, stiffness: 380 }
            }
            className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/85 shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_24px_80px_rgba(0,0,0,0.65)] backdrop-blur-2xl"
          >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-accent/40 to-transparent" />

            <div className="flex items-center gap-3 border-b border-white/5 px-4 py-3">
              <Search className="shrink-0 text-zinc-500" size={18} strokeWidth={2.5} />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => onQueryChange(e.target.value)}
                placeholder="Search actions, folders, apps, and memory…"
                className="flex-1 bg-transparent text-sm font-medium text-zinc-100 placeholder:text-zinc-600 focus:outline-none"
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
              />
              <kbd className="hidden sm:inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-[10px] font-black uppercase tracking-widest text-zinc-500">
                esc
              </kbd>
            </div>

            <div ref={listRef} className="max-h-[min(60vh,520px)] overflow-y-auto custom-scrollbar px-2 py-2">
              {loading && visibleItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-3 py-16">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent/30 border-t-accent" />
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Indexing workspace…</p>
                </div>
              ) : !loading && visibleItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
                  <Sparkles className="text-zinc-600" size={28} />
                  <p className="text-sm font-bold text-zinc-400">No results found</p>
                  <p className="max-w-xs text-xs text-zinc-600">
                    Try another keyword. Quick actions, folders, apps, and memory are all searchable.
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  {!hasActiveFilter && quickActionCount > 0 && (
                    <p className="px-3 pb-1 pt-1 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
                      Quick actions
                    </p>
                  )}

                  {visibleItems.map((item, index) => {
                    const isAi = item.type === 'ai';

                    return (
                      <React.Fragment key={rowKeys[index]}>
                        {hasActiveFilter && index === firstAiIndex && isAi && (
                          <p className="px-3 pb-1 pt-2 text-[10px] font-black uppercase tracking-[0.2em] text-cyan-300/90">
                            Smart suggestions
                          </p>
                        )}

                        {!hasActiveFilter && index === quickActionCount && contextCutoff > 0 && (
                          <p className="px-3 pb-1 pt-3 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400/90">
                            Workflow macros
                          </p>
                        )}
                        {!hasActiveFilter && index === contextStart && contextCutoff > 0 && (
                          <p className="px-3 pb-1 pt-3 text-[10px] font-black uppercase tracking-[0.2em] text-purple-400/90">
                            Context memory
                          </p>
                        )}

                        {!hasActiveFilter && index === recentStart && recentCutoff > 0 && (
                          <p className="px-3 pb-1 pt-3 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
                            Recent
                          </p>
                        )}

                        {!hasActiveFilter && index === workspaceStart && showWorkspaceSection && (
                          <p className="px-3 pb-1 pt-3 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
                            Workspace
                          </p>
                        )}

                        <motion.button
                          type="button"
                          data-cmd-index={index}
                          onMouseEnter={() => onSelectIndex(index)}
                          onClick={() => onExecute(item)}
                          initial={shouldAnimateRows ? { opacity: 0, y: 4 } : false}
                          animate={shouldAnimateRows ? { opacity: 1, y: 0 } : undefined}
                          transition={
                            shouldAnimateRows
                              ? { delay: Math.min(index * 0.008, 0.1), duration: 0.13 }
                              : { duration: 0.08 }
                          }
                          className={cn(
                            'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all',
                            isAi &&
                              'border border-cyan-400/20 bg-cyan-400/10 hover:border-cyan-300/35 hover:bg-cyan-400/14',
                            !isAi && selectedIndex === index && 'bg-accent/15 ring-1 ring-accent/30 shadow-[0_0_24px_rgba(99,102,241,0.12)]',
                            isAi && selectedIndex === index && 'ring-1 ring-cyan-300/45 shadow-[0_0_24px_rgba(34,211,238,0.18)]',
                            !isAi && selectedIndex !== index && 'hover:bg-white/5 hover:shadow-[0_8px_30px_rgba(0,0,0,0.25)]'
                          )}
                        >
                          <div
                            className={cn(
                              'flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border bg-zinc-900/80',
                              isAi ? 'border-cyan-400/30' : 'border-white/10',
                              selectedIndex === index && !isAi && 'border-accent/40',
                              selectedIndex === index && isAi && 'border-cyan-300/50'
                            )}
                          >
                            {item.type === 'ai' ? (
                              <Sparkles size={18} className="text-cyan-200" />
                            ) : item.type === 'action' ? (
                              (() => {
                                const Icon = ACTION_ICONS[item.id] ?? Zap;
                                return <Icon size={18} className={item.onRun ? 'text-amber-300' : 'text-emerald-400'} />;
                              })()
                            ) : item.type === 'folder' ? (
                              <Folder size={18} className="text-accent" />
                            ) : item.icon ? (
                              <img src={item.icon} alt="" className="h-5 w-5 object-contain" draggable={false} />
                            ) : (
                              <Globe size={18} className="text-zinc-600" />
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className={cn('truncate text-sm font-bold', isAi ? 'text-cyan-50' : 'text-zinc-100')}>
                                <HighlightMatch text={item.name} query={debouncedQuery} />
                              </span>
                              <span
                                className={cn(
                                  'max-w-30 shrink-0 truncate rounded-md border px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wide',
                                  item.type === 'ai'
                                    ? 'border-cyan-300/35 bg-cyan-400/20 text-cyan-100'
                                    : item.type === 'action'
                                      ? item.onRun
                                        ? 'border-amber-500/30 bg-amber-500/10 text-amber-300'
                                        : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                                      : item.type === 'folder'
                                        ? 'border-sky-500/30 bg-sky-500/10 text-sky-300'
                                        : 'border-violet-500/30 bg-violet-500/10 text-violet-300'
                                )}
                              >
                                {item.type === 'ai'
                                  ? 'Suggested'
                                  : item.type === 'action'
                                    ? item.onRun
                                      ? 'Macro'
                                      : 'Action'
                                    : item.type === 'folder'
                                      ? 'Folder'
                                      : 'App'}
                              </span>
                            </div>
                            <p className={cn('mt-0.5 truncate text-[11px]', isAi ? 'text-cyan-100/70' : 'text-zinc-500')}>
                              <HighlightMatch text={item.subtext} query={debouncedQuery} />
                            </p>
                          </div>

                          {selectedIndex === index && (
                            <CornerDownLeft size={14} className={cn('shrink-0', isAi ? 'text-cyan-200' : 'text-accent')} />
                          )}
                        </motion.button>
                      </React.Fragment>
                    );
                  })}
                </div>
              )}

              {truncatedCount > 0 && (
                <p className="px-3 pb-2 pt-3 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
                  Showing top {visibleItems.length} results · refine search for {truncatedCount} more
                </p>
              )}
            </div>

            <div className="flex items-center justify-between border-t border-white/5 px-4 py-2 text-[10px] text-zinc-600">
              <span className="font-medium">
                <kbd className="rounded border border-white/10 bg-white/5 px-1.5 py-0.5 font-mono">↑</kbd>{' '}
                <kbd className="rounded border border-white/10 bg-white/5 px-1.5 py-0.5 font-mono">↓</kbd>{' '}
                navigate · <kbd className="rounded border border-white/10 bg-white/5 px-1.5 py-0.5 font-mono">↵</kbd>{' '}
                open
              </span>
              <span className="hidden sm:inline">Workspace</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return typeof document !== 'undefined' ? createPortal(content, document.body) : null;
};
