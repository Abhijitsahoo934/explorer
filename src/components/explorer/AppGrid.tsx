import React, { useState } from 'react';
import { ExternalLink, Trash2, Edit3, Globe, GripVertical, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { SpotlightCard } from '../ui/SpotlightCard';
import type { App } from '../../types/explorer';
import { explorerService } from '../../lib/explorerService';
import { RenameModal } from './RenameModal';
import { recordAppUsage } from '../../lib/contextEngine';
import { cn } from '../../lib/utils';
import { buildFaviconUrl, normalizeExternalUrl, openExternalUrl } from '../../platform/security/url';
import { logger } from '../../platform/observability/logger';

interface AppGridProps {
  apps: App[];
  scopeKey?: string;
  reducedMotion?: boolean;
  onWorkspaceChange?: () => void;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } },
};

const getFavicon = (url: string) => {
  return buildFaviconUrl(url, 128);
};

const DraggableAppCard = ({
  app,
  onEdit,
  onDelete,
  onTogglePin,
  reducedMotion,
}: {
  app: App;
  onEdit: (app: App) => void;
  onDelete: (e: React.MouseEvent, id: string) => void;
  onTogglePin: (e: React.MouseEvent, app: App) => void;
  reducedMotion: boolean;
}) => {
  const [imgError, setImgError] = useState(false);
  const favicon = app.icon || getFavicon(app.url);
  const resolvedUrl = normalizeExternalUrl(app.url);

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: app.id,
    data: { type: 'app', app },
  });

  const style = transform
    ? {
        transform: CSS.Translate.toString(transform),
        zIndex: isDragging ? 999 : 1,
        transition: isDragging ? 'none' : 'transform 180ms cubic-bezier(0.22, 1, 0.36, 1)',
      }
    : undefined;

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="h-full w-full rounded-4xl border-2 border-dashed border-accent/50 bg-accent/5 opacity-40 min-h-55"
      />
    );
  }

  const handleOpenApp = () => {
    if (!resolvedUrl) return;
    recordAppUsage(app.id);
    void explorerService.recordAppOpened(app.id);
    openExternalUrl(resolvedUrl);
  };

  return (
    <div
      ref={setNodeRef}
      style={{ ...style, touchAction: reducedMotion ? 'manipulation' : 'none' }}
      {...attributes}
      {...listeners}
      className="h-full cursor-grab active:cursor-grabbing group/drag"
    >
      <motion.div
        variants={reducedMotion ? undefined : itemVariants}
        initial={reducedMotion ? false : undefined}
        layout={false}
        className="h-full pointer-events-none"
      >
        <SpotlightCard
          className={`p-6 group border-border bg-card/80 hover:bg-card hover:border-accent/30 transition-all duration-200 h-full flex flex-col rounded-4xl pointer-events-auto relative select-none cursor-pointer ${
            reducedMotion ? 'backdrop-blur-sm shadow-sm' : 'backdrop-blur-xl hover:shadow-premium'
          }`}
          onClick={handleOpenApp}
        >
          <div className={cn(
            "absolute top-4 right-4 transition-opacity",
            reducedMotion ? "opacity-35" : "opacity-0 group-hover/drag:opacity-30"
          )}>
            <GripVertical size={16} className="text-muted" />
          </div>

          <div className="flex justify-between items-start mb-8 relative z-10">
            <div className="relative w-16 h-16 rounded-[1.25rem] bg-(--surface-strong) flex items-center justify-center overflow-hidden border border-border group-hover:border-accent/30 transition-all duration-200 group-hover:scale-105 shadow-[0_18px_36px_-24px_rgba(15,23,42,0.35)]">
              {favicon && !imgError ? (
                <img
                  src={favicon}
                  alt=""
                  className="w-8 h-8 object-contain"
                  onError={() => setImgError(true)}
                  draggable={false}
                />
              ) : (
                <Globe size={28} className="text-muted group-hover:text-accent transition-colors" />
              )}
            </div>

            <div className={cn(
              "flex gap-1.5 transition-all duration-200 bg-background/95 p-1.5 rounded-xl border border-border shadow-[0_18px_40px_-26px_rgba(15,23,42,0.35)] backdrop-blur-xl",
              reducedMotion ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 group-hover:translate-y-0 group-hover:opacity-100"
            )}>
              <button
                type="button"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => onTogglePin(e, app)}
                className={`p-2 rounded-lg transition-colors ${
                  app.is_pinned ? 'text-amber-400 bg-amber-500/10' : 'text-zinc-400 hover:text-amber-400 hover:bg-amber-500/10'
                }`}
                title={app.is_pinned ? 'Unpin' : 'Pin'}
              >
                <Star size={14} className={app.is_pinned ? 'fill-current' : ''} />
              </button>
              <button
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(app);
                }}
                className="p-2 text-zinc-400 hover:text-accent hover:bg-accent/10 transition-colors rounded-lg"
              >
                <Edit3 size={14} />
              </button>
              <button
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(e, app.id);
                }}
                className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-500/10 transition-colors rounded-lg"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>

          <div className="space-y-1.5 mb-6 flex-1">
            <h3 className="text-base font-black text-foreground truncate group-hover:text-accent transition-colors tracking-tight">
              {app.name}
            </h3>
            <p className="text-[11px] text-muted truncate font-medium transition-colors">
              {app.url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')}
            </p>
          </div>

          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              handleOpenApp();
            }}
            className="flex w-full items-center justify-between pt-4 border-t border-border no-underline group/link mt-auto relative z-20 hover:bg-card-hover px-2 -mx-2 rounded-xl transition-all text-left"
          >
            <span className="text-[10px] text-muted uppercase tracking-widest font-black group-hover/link:text-foreground transition-colors duration-300">
              Open app
            </span>
            <ExternalLink
              size={14}
              className="text-muted group-hover/link:text-accent group-hover/link:translate-x-1 group-hover/link:-translate-y-1 transition-all duration-200"
            />
          </button>
        </SpotlightCard>
      </motion.div>
    </div>
  );
};

export const AppGrid: React.FC<AppGridProps> = ({ apps, scopeKey = 'default', reducedMotion = false, onWorkspaceChange }) => {
  const [editTarget, setEditTarget] = useState<App | null>(null);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm('Remove this app from your workspace?')) {
      try {
        await explorerService.deleteApp(id);
        onWorkspaceChange?.();
      } catch (error) {
        logger.error('delete_app', error, { appId: id });
      }
    }
  };

  const handleTogglePin = async (e: React.MouseEvent, app: App) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await explorerService.setAppPinned(app.id, !app.is_pinned);
      onWorkspaceChange?.();
    } catch (error) {
      logger.error('pin_app', error, { appId: app.id });
    }
  };

  return (
    <>
      <motion.div
        key={scopeKey}
        variants={reducedMotion ? undefined : containerVariants}
        initial={reducedMotion ? false : 'hidden'}
        animate={reducedMotion ? undefined : 'show'}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6"
      >
        {apps.map((app) => (
          <DraggableAppCard
            key={app.id}
            app={app}
            reducedMotion={reducedMotion}
            onEdit={(full) => setEditTarget(full)}
            onDelete={handleDelete}
            onTogglePin={handleTogglePin}
          />
        ))}
      </motion.div>

      {editTarget && (
        <RenameModal
          isOpen={!!editTarget}
          onClose={() => setEditTarget(null)}
          onSuccess={() => onWorkspaceChange?.()}
          itemId={editTarget.id}
          initialName={editTarget.name}
          initialUrl={editTarget.url}
          itemType="app"
        />
      )}
    </>
  );
};
