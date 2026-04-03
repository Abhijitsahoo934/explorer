import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { explorerService, type WorkspaceTemplate } from '../lib/explorerService';
import { useAuth } from '../hooks/useAuth';
import { base64UrlDecode } from '../lib/base64Url';
import { fetchSharedBlueprint } from '../lib/sharedBlueprints';
import { Button } from '../components/ui/Button';
import { Grain } from '../components/ui/Grain';
import { motion } from 'framer-motion';
import { FolderPlus, Link2, Sparkles, AlertCircle } from 'lucide-react';
import { trackFunnelEvent } from '../lib/analyticsService';
import { Seo } from '../components/system/Seo';

type DecodedBlueprint = WorkspaceTemplate;

function blueprintFolderEntries(folder: Record<string, unknown>): unknown[] {
  if (Array.isArray(folder.apps)) return folder.apps;
  if (Array.isArray(folder.websites)) return folder.websites;
  return [];
}

function isDecodedBlueprint(value: unknown): value is DecodedBlueprint {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;

  if (typeof v.name !== 'string') return false;
  if (!Array.isArray(v.folders)) return false;

  return v.folders.every((folder) => {
    if (!folder || typeof folder !== 'object') return false;
    const f = folder as Record<string, unknown>;
    if (typeof f.name !== 'string') return false;
    const entries = blueprintFolderEntries(f);
    return entries.every((w) => {
      if (!w || typeof w !== 'object') return false;
      const web = w as Record<string, unknown>;
      return typeof web.name === 'string' && typeof web.url === 'string';
    });
  });
}

export default function BlueprintImport() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated, loading: authLoading } = useAuth();

  const [isInstalling, setIsInstalling] = useState(false);
  const [installError, setInstallError] = useState<string | null>(null);
  const [resolvedSharedBlueprint, setResolvedSharedBlueprint] = useState<DecodedBlueprint | null>(null);
  const [resolvingShare, setResolvingShare] = useState(false);

  const dataParam = searchParams.get('data');
  const shareParam = searchParams.get('share');

  const decoded = useMemo<DecodedBlueprint | null>(() => {
    if (!dataParam) return null;
    try {
      const json = base64UrlDecode(dataParam);
      const parsed = JSON.parse(json) as unknown;
      return isDecodedBlueprint(parsed) ? parsed : null;
    } catch {
      return null;
    }
  }, [dataParam]);

  useEffect(() => {
    let cancelled = false;

    if (!shareParam) {
      setResolvedSharedBlueprint(null);
      setResolvingShare(false);
      return;
    }

    setResolvingShare(true);
    setInstallError(null);

    fetchSharedBlueprint(shareParam)
      .then((blueprint) => {
        if (cancelled) return;
        setResolvedSharedBlueprint(blueprint);
        if (!blueprint) {
          setInstallError('This shared blueprint no longer exists or is unavailable.');
        }
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        const message =
          error instanceof Error ? error.message : 'Failed to load the shared blueprint.';
        setInstallError(message);
        setResolvedSharedBlueprint(null);
      })
      .finally(() => {
        if (!cancelled) {
          setResolvingShare(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [shareParam]);

  const activeBlueprint = shareParam ? resolvedSharedBlueprint : decoded;

  const derivedStats = useMemo(() => {
    if (!activeBlueprint) return null;
    const folderCount = activeBlueprint.folders.length;
    const appCount = activeBlueprint.folders.reduce((acc, f) => {
      const frec = f as unknown as Record<string, unknown>;
      return acc + blueprintFolderEntries(frec).length;
    }, 0);
    return { folderCount, appCount };
  }, [activeBlueprint]);

  const shareReturnTo = useMemo(() => {
    // Used when we have to redirect user to login.
    if (shareParam) {
      return `/blueprint?share=${encodeURIComponent(shareParam)}`;
    }
    if (dataParam) {
      return `/blueprint?data=${encodeURIComponent(dataParam)}`;
    }
    return '/dashboard';
  }, [dataParam, shareParam]);

  const handleInstall = async () => {
    setInstallError(null);
    if (!activeBlueprint) return;

    if (!isAuthenticated) {
      navigate(`/auth?returnTo=${encodeURIComponent(shareReturnTo)}`);
      return;
    }

    setIsInstalling(true);
    try {
      await explorerService.seedWorkspaceTemplate(activeBlueprint);
      trackFunnelEvent('blueprint_installed', { name: activeBlueprint.name });
      navigate('/explorer', { replace: true });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to install blueprint.';
      setInstallError(message);
    } finally {
      setIsInstalling(false);
    }
  };

  const missingOrInvalid =
    (!shareParam && !dataParam) ||
    (!resolvingShare && !activeBlueprint);

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6 relative overflow-hidden selection:bg-accent/20 selection:text-accent transition-colors duration-300">
      <Seo title="Install Blueprint | Explorer" robots="noindex,nofollow" canonicalPath="/blueprint" />
      <Grain opacity={0.05} />

      <div className="absolute top-0 -left-1/4 w-1/2 h-1/2 bg-accent/10 rounded-full blur-[160px] pointer-events-none transition-colors duration-700" />
      <div className="absolute bottom-0 -right-1/4 w-1/2 h-1/2 bg-accent/5 rounded-full blur-[150px] pointer-events-none transition-colors duration-700" />

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-2xl relative z-10"
      >
        <div className="bg-card/80 backdrop-blur-2xl border border-border p-7 md:p-9 rounded-[2.5rem] shadow-premium overflow-hidden">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-accent/10 border border-border flex items-center justify-center">
                <Sparkles size={22} className="text-accent" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.25em] text-muted font-black">Blueprint Install</p>
                <h1 className="text-3xl font-black tracking-tight mt-1">Install a shared workspace setup</h1>
                <p className="text-sm text-muted mt-2">
                  {resolvingShare
                    ? 'Loading shared blueprint preview...'
                    : missingOrInvalid
                      ? 'This link is missing or invalid.'
                      : 'Preview what will be added to your vault.'}
                </p>
              </div>
            </div>
          </div>

          {activeBlueprint && derivedStats && (
            <div className="rounded-[1.75rem] border border-border bg-background/50 p-5 mb-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center">
                  <FolderPlus size={18} className="text-accent" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-widest font-black text-muted">Blueprint Name</p>
                  <p className="text-xl font-black truncate">{activeBlueprint.name}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <div className="px-4 py-2 rounded-2xl border border-border bg-card/60 text-center">
                  <p className="text-[10px] uppercase tracking-widest text-muted font-black">Folders</p>
                  <p className="text-lg font-black">{derivedStats.folderCount}</p>
                </div>
                <div className="px-4 py-2 rounded-2xl border border-border bg-card/60 text-center">
                  <p className="text-[10px] uppercase tracking-widest text-muted font-black">Apps</p>
                  <p className="text-lg font-black">{derivedStats.appCount}</p>
                </div>
              </div>

              <div className="mt-5 space-y-2">
                {activeBlueprint.folders.map((f) => {
                  const frec = f as unknown as Record<string, unknown>;
                  const entries = blueprintFolderEntries(frec) as Array<{ name: string; url: string }>;
                  return (
                  <div key={f.name} className="rounded-2xl border border-border bg-card/50 p-4">
                    <p className="text-sm font-black">{f.name}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {entries.map((w) => (
                        <span key={`${f.name}:${w.url}`} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-border bg-background/50 text-xs text-muted font-bold truncate max-w-[220px]">
                          <Link2 size={12} className="text-accent shrink-0" />
                          {w.name}
                        </span>
                      ))}
                      {entries.length === 0 && <p className="text-xs text-muted">No apps</p>}
                    </div>
                  </div>
                  );
                })}
              </div>
            </div>
          )}

          {installError && (
            <div className="flex items-start gap-3 rounded-3xl border border-red-500/20 bg-red-500/5 p-4 text-red-600 dark:text-red-300 mb-5">
              <AlertCircle size={18} className="mt-0.5 shrink-0" />
              <p className="text-sm font-medium leading-relaxed">{installError}</p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <Button
              className="h-12 px-8 rounded-2xl text-[11px] uppercase tracking-widest font-black flex-1"
              loading={isInstalling || authLoading}
              onClick={handleInstall}
              disabled={missingOrInvalid || authLoading}
            >
              {isInstalling ? 'Installing...' : 'Install into my workspace'}
            </Button>

            <Button
              variant="outline"
              className="h-12 px-6 rounded-2xl text-[11px] uppercase tracking-widest font-black sm:w-auto"
              onClick={() => navigate('/templates')}
            >
              Back to Templates
            </Button>
          </div>

          <p className="text-xs text-muted mt-5 leading-relaxed">
            Note: This install will add new folders and apps based on the shared blueprint snapshot.
          </p>
        </div>
      </motion.div>

      {missingOrInvalid && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-xs text-muted">
          Tip: Share links must be created from your Template Marketplace.
        </div>
      )}
    </div>
  );
}

