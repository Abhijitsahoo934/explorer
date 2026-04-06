import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { explorerService } from '../../lib/explorerService';
import { notificationService } from '../../lib/notificationService';
import { Button } from '../ui/Button';
import { trackFunnelEvent } from '../../lib/analyticsService';
import { getErrorMessage } from '../../lib/errorMessage';
import { logger } from '../../platform/observability/logger';
import { buildFaviconUrl, normalizeExternalUrl } from '../../platform/security/url';
import { WORKSPACE_TEMPLATES } from '../../lib/workspaceTemplates';
import { COMMUNITY_TEMPLATE_LIBRARY } from '../../lib/communityTemplateLibrary';
import { X, Globe, Link2, CornerDownLeft, Sparkles, Loader2 } from 'lucide-react';

interface AddAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  folderId: string | null;
}

interface AppRecommendation {
  name: string;
  url: string;
  domain: string;
  keywords: string[];
}

const KNOWN_ALIASES: Record<string, string[]> = {
  supabase: ['supa', 'postgres', 'database', 'backend'],
  github: ['gh', 'git', 'repo', 'code'],
  figma: ['design', 'ui', 'ux'],
  notion: ['docs', 'notes', 'wiki'],
  vercel: ['deploy', 'hosting'],
  jira: ['agile', 'tickets'],
  postman: ['api', 'rest'],
  openai: ['gpt', 'chatgpt', 'llm', 'ai'],
};

const BRAND_URL_OVERRIDES: Record<string, string> = {
  openai: 'https://platform.openai.com',
};

const COMMON_TLDS = ['.com', '.in', '.io', '.ai', '.co'];

function normalizeQuery(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/\/$/, '');
}

function humanizeDomainToken(token: string): string {
  if (!token) return '';
  return token.charAt(0).toUpperCase() + token.slice(1);
}

function normalizeUrlForSubmit(rawValue: string): string | null {
  const direct = normalizeExternalUrl(rawValue);
  if (direct) {
    return direct;
  }

  const q = normalizeQuery(rawValue).replace(/[^a-z0-9.-]/g, '');
  if (!q) {
    return null;
  }

  if (!q.includes('.')) {
    return normalizeExternalUrl(`${q}.com`);
  }

  return normalizeExternalUrl(q);
}

function getPreferredTldOrder(): string[] {
  if (typeof navigator === 'undefined') {
    return COMMON_TLDS;
  }

  const locale = (navigator.language || '').toLowerCase();
  const isIndiaLocale = locale.includes('-in') || locale.startsWith('hi');
  if (!isIndiaLocale) {
    return COMMON_TLDS;
  }

  const prioritized = ['.in', ...COMMON_TLDS.filter((tld) => tld !== '.in')];
  return prioritized;
}

function buildDomainCandidates(rawValue: string): string[] {
  const q = normalizeQuery(rawValue).replace(/[^a-z0-9.-]/g, '');
  if (!q) return [];

  const base = q.split('/')[0];
  if (!base) return [];

  if (base.includes('.')) {
    const normalized = normalizeExternalUrl(base);
    return normalized ? [normalized] : [];
  }

  const candidates = getPreferredTldOrder()
    .map((tld) => normalizeExternalUrl(`${base}${tld}`))
    .filter((item): item is string => !!item);

  return Array.from(new Set(candidates));
}

function getDomain(url: string): string {
  const normalized = normalizeExternalUrl(url);
  if (!normalized) return '';
  try {
    return new URL(normalized).hostname.replace(/^www\./, '').toLowerCase();
  } catch {
    return '';
  }
}

function levenshteinDistance(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;

  const matrix: number[][] = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0));

  for (let i = 0; i <= a.length; i += 1) {
    matrix[i][0] = i;
  }
  for (let j = 0; j <= b.length; j += 1) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= a.length; i += 1) {
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }

  return matrix[a.length][b.length];
}

function buildRecommendationCatalog(): AppRecommendation[] {
  const byDomain = new Map<string, AppRecommendation>();

  const pushEntry = (name: string, url: string) => {
    const safeName = name.trim();
    const safeUrl = normalizeExternalUrl(url);
    if (!safeName || !safeUrl) return;

    const domain = getDomain(safeUrl);
    if (!domain) return;

    const baseToken = domain.split('.')[0] ?? domain;
    const nameTokens = safeName.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
    const aliasTokens = KNOWN_ALIASES[baseToken] ?? [];
    const keywords = Array.from(new Set([baseToken, ...nameTokens, ...aliasTokens]));

    if (!byDomain.has(domain)) {
      byDomain.set(domain, {
        name: safeName,
        url: safeUrl,
        domain,
        keywords,
      });
      return;
    }

    const existing = byDomain.get(domain);
    if (!existing) return;
    const mergedKeywords = Array.from(new Set([...existing.keywords, ...keywords]));
    if (safeName.length < existing.name.length) {
      byDomain.set(domain, { ...existing, name: safeName, keywords: mergedKeywords });
    } else {
      byDomain.set(domain, { ...existing, keywords: mergedKeywords });
    }
  };

  for (const template of WORKSPACE_TEMPLATES) {
    for (const folder of template.template.folders) {
      for (const app of folder.apps) {
        pushEntry(app.name, app.url);
      }
    }
  }

  for (const template of COMMUNITY_TEMPLATE_LIBRARY) {
    for (const folder of template.folders) {
      for (const app of folder.apps) {
        pushEntry(app.name, app.url);
      }
    }
  }

  return Array.from(byDomain.values());
}

function buildAliasFallbackRecommendations(query: string): AppRecommendation[] {
  if (!query) return [];

  return Object.entries(KNOWN_ALIASES)
    .filter(([brand, aliases]) => {
      const normalizedBrand = brand.toLowerCase();
      if (normalizedBrand.startsWith(query) || query.startsWith(normalizedBrand)) {
        return true;
      }
      return aliases.some((alias) => alias.startsWith(query) || query.startsWith(alias));
    })
    .slice(0, 4)
    .map(([brand, aliases]) => {
      const fallbackUrl = BRAND_URL_OVERRIDES[brand] ?? `https://${brand}.com`;
      return {
        name: humanizeDomainToken(brand),
        url: fallbackUrl,
        domain: getDomain(fallbackUrl),
        keywords: [brand, ...aliases],
      };
    })
    .filter((rec) => !!rec.domain);
}

const APP_RECOMMENDATION_CATALOG = buildRecommendationCatalog();

function scoreRecommendation(rec: AppRecommendation, query: string): number {
  if (!query) return 0;

  const q = normalizeQuery(query);
  const name = rec.name.toLowerCase();
  const domain = rec.domain;
  const url = rec.url.toLowerCase();

  let score = 0;
  if (domain.startsWith(q)) score += 120;
  if (name.startsWith(q)) score += 100;
  if (rec.keywords.some((kw) => kw.startsWith(q))) score += 80;
  if (domain.includes(q)) score += 50;
  if (name.includes(q)) score += 40;
  if (url.includes(q)) score += 20;

  const baseDomainToken = domain.split('.')[0] ?? domain;
  const typoDistance = levenshteinDistance(q, baseDomainToken);
  if (q.length >= 4 && typoDistance <= 2) {
    // Reward near-matches for common typos: supabse -> supabase.
    score += 70 - typoDistance * 15;
  }

  const closestKeywordDistance = rec.keywords.reduce((closest, keyword) => {
    const next = levenshteinDistance(q, keyword);
    return Math.min(closest, next);
  }, Number.POSITIVE_INFINITY);

  if (q.length >= 4 && closestKeywordDistance <= 2) {
    score += 40 - closestKeywordDistance * 10;
  }

  // Prefer concise brands at similar score for cleaner autofill.
  score -= Math.min(rec.name.length, 24) * 0.1;
  return score;
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
  const [activeRecommendationIndex, setActiveRecommendationIndex] = useState(0);
  const [isNameEdited, setIsNameEdited] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const recommendationItemRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const recommendationImpressionRef = useRef<string>('');

  const urlQuery = normalizeQuery(url);
  const recommendations = useMemo(() => {
    if (urlQuery.length >= 1) {
      const minScore = urlQuery.length <= 2 ? 18 : 32;
      const scored = APP_RECOMMENDATION_CATALOG
        .map((rec) => ({ rec, score: scoreRecommendation(rec, urlQuery) }))
        .filter((row) => row.score > minScore)
        .sort((a, b) => b.score - a.score)
        .slice(0, 5)
        .map((row) => row.rec);

      const aliasFallback = buildAliasFallbackRecommendations(urlQuery);
      const mergedScored = [...scored];
      const mergedDomains = new Set(mergedScored.map((rec) => rec.domain));
      for (const fallbackRec of aliasFallback) {
        if (!mergedDomains.has(fallbackRec.domain)) {
          mergedScored.push(fallbackRec);
          mergedDomains.add(fallbackRec.domain);
        }
      }

      // Fallback: let users add any browser site quickly even if not in catalog.
      const fallbackUrl = buildDomainCandidates(urlQuery)[0] ?? null;
      const fallbackHost = fallbackUrl ? getDomain(fallbackUrl) : '';
      const hasFallbackAlready = !!fallbackHost && mergedScored.some((rec) => rec.domain === fallbackHost);

      if (fallbackUrl && fallbackHost && !hasFallbackAlready) {
        const baseToken = fallbackHost.split('.')[0] ?? fallbackHost;
        return [
          {
            name: humanizeDomainToken(baseToken),
            url: fallbackUrl,
            domain: fallbackHost,
            keywords: [baseToken],
          },
          ...mergedScored,
        ].slice(0, 5);
      }

      return mergedScored.slice(0, 5);
    }

    return [] as AppRecommendation[];
  }, [urlQuery]);

  const hasRecommendations = recommendations.length > 0;
  const recommendationHeader = 'Suggestions';

  const domainSuggestions = useMemo(() => {
    if (urlQuery.length < 2) {
      return [] as string[];
    }

    const suggestionPool = buildDomainCandidates(urlQuery);
    const recommendationDomains = new Set(recommendations.map((item) => item.domain));
    return suggestionPool
      .filter((candidateUrl) => {
        const candidateDomain = getDomain(candidateUrl);
        return candidateDomain && !recommendationDomains.has(candidateDomain);
      })
      .slice(0, 4);
  }, [urlQuery, recommendations]);

  useEffect(() => {
    setActiveRecommendationIndex(0);
  }, [urlQuery, recommendations.length]);

  useEffect(() => {
    if (!isOpen || !hasRecommendations) {
      recommendationImpressionRef.current = '';
      return;
    }

    const impressionKey = `${urlQuery || 'quick'}:${recommendations.map((item) => item.domain).join('|')}`;
    if (recommendationImpressionRef.current === impressionKey) {
      return;
    }

    recommendationImpressionRef.current = impressionKey;
    trackFunnelEvent('app_recommendation_shown', {
      query: urlQuery,
      count: recommendations.length,
      top_domain: recommendations[0]?.domain ?? null,
      mode: 'query',
    });
  }, [isOpen, hasRecommendations, recommendations, urlQuery]);

  const handlePickRecommendation = (recommendation: AppRecommendation, source: 'click' | 'keyboard' = 'click') => {
    setUrl(recommendation.url);
    setName(recommendation.name);
    setIsNameEdited(false);
    setError(null);
    trackFunnelEvent('app_recommendation_applied', {
      recommendation: recommendation.name,
      domain: recommendation.domain,
      source,
    });
  };

  const handleApplyDomainSuggestion = (suggestedUrl: string) => {
    const domain = getDomain(suggestedUrl);
    const baseToken = domain.split('.')[0] ?? domain;

    setUrl(suggestedUrl);
    if (!isNameEdited) {
      setName(humanizeDomainToken(baseToken));
    }
    setError(null);

    trackFunnelEvent('app_domain_suggestion_applied', {
      suggested_url: suggestedUrl,
      domain,
    });
  };

  const handleUrlInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!hasRecommendations) {
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveRecommendationIndex((previous) => (previous + 1) % recommendations.length);
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveRecommendationIndex((previous) => (previous - 1 + recommendations.length) % recommendations.length);
      return;
    }

    if (event.key === 'Enter' && recommendations[activeRecommendationIndex]) {
      event.preventDefault();
      handlePickRecommendation(recommendations[activeRecommendationIndex], 'keyboard');
    }
  };

  const keyboardHintLabel = hasRecommendations
    ? 'Press Enter to apply suggestion'
    : 'Press Enter to save';

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const motionMedia = window.matchMedia('(prefers-reduced-motion: reduce)');
    const apply = () => setPrefersReducedMotion(motionMedia.matches);
    apply();

    motionMedia.addEventListener('change', apply);
    return () => motionMedia.removeEventListener('change', apply);
  }, []);

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
      setActiveRecommendationIndex(0);
      setIsNameEdited(false);
    }
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    const previousTouchAction = document.body.style.touchAction;
    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';

    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.touchAction = previousTouchAction;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!hasRecommendations) {
      return;
    }

    const activeElement = recommendationItemRefs.current[activeRecommendationIndex];
    activeElement?.scrollIntoView({ block: 'nearest', behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  }, [activeRecommendationIndex, hasRecommendations, prefersReducedMotion]);

  useEffect(() => {
    if (url.length > 3) {
      const normalized = normalizeUrlForSubmit(url);
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

      if (hostname && !isNameEdited) {
        const domainParts = hostname.replace('www.', '').split('.');
        if (domainParts.length > 0) {
          const extractedName = humanizeDomainToken(domainParts[0]);
          setName(extractedName);
        }
      }
    } else {
      setFaviconUrl(null);
    }
  }, [url, isNameEdited]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const appName = name.trim();
    const finalUrl = normalizeUrlForSubmit(url.trim());

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
      setError(getErrorMessage(error, 'Unable to save app.'));
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
        <div className="fixed inset-0 z-150 flex items-start justify-center overflow-y-auto overscroll-contain p-2 pt-3 pb-[calc(0.5rem+env(safe-area-inset-bottom))] sm:p-6 sm:pt-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: prefersReducedMotion ? 0.14 : 0.22, ease: 'easeOut' }}
            className="absolute inset-0 bg-[#050505]/80 backdrop-blur-md"
            onClick={onClose}
          />

          <motion.div
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95, y: 20 }}
            animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95, y: 10 }}
            transition={
              prefersReducedMotion
                ? { duration: 0.14, ease: 'easeOut' }
                : { type: 'spring', damping: 25, stiffness: 400 }
            }
            className="relative my-auto w-full max-w-105 overflow-hidden rounded-4xl border border-border bg-card/95 p-4 shadow-2xl backdrop-blur-3xl sm:p-8 sm:rounded-[2.5rem] max-h-[calc(100dvh-0.75rem)] sm:max-h-[calc(100vh-4rem)] overflow-y-auto custom-scrollbar"
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-transparent via-accent to-transparent opacity-30" />
            <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-48 h-48 bg-accent/20 rounded-full blur-[60px] pointer-events-none" />

            <div className="relative z-10 mb-6 flex items-start justify-between gap-4 sm:mb-8">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-[1.25rem] bg-(--surface-strong) border border-border flex items-center justify-center shadow-lg relative overflow-hidden group">
                  <AnimatePresence mode="wait">
                    {faviconUrl ? (
                      <motion.img
                        key="favicon"
                        initial={prefersReducedMotion ? { opacity: 0 } : { scale: 0.5, opacity: 0 }}
                        animate={prefersReducedMotion ? { opacity: 1 } : { scale: 1, opacity: 1 }}
                        transition={{ duration: prefersReducedMotion ? 0.12 : 0.2, ease: 'easeOut' }}
                        src={faviconUrl}
                        alt="Preview"
                        className="w-8 h-8 object-contain relative z-10"
                        onError={() => setFaviconUrl(null)}
                      />
                    ) : (
                      <motion.div
                        key="globe"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: prefersReducedMotion ? 0.1 : 0.16, ease: 'easeOut' }}
                        className="relative z-10"
                      >
                        <Globe size={24} className="text-accent" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <div className="absolute inset-0 bg-accent/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                </div>

                <div>
                  <h3 className="font-black text-foreground tracking-tight text-xl sm:text-2xl">Add app</h3>
                  <p className="text-[10px] text-muted font-bold tracking-[0.15em] mt-1 uppercase flex items-center gap-1.5">
                    Workspace <Sparkles size={12} className="text-accent" />
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2.5 text-muted hover:text-foreground hover:bg-card-hover hover:rotate-90 rounded-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-accent/20"
                aria-label="Close add app modal"
              >
                <X size={18} strokeWidth={3} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
              {error && (
                <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-300">
                  {error}
                </div>
              )}
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-muted font-black mb-2.5 ml-1">
                  URL
                </label>
                <div className="relative group">
                  <Link2 size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-accent transition-colors duration-300" />
                  <input
                    ref={inputRef}
                    required
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    onKeyDown={handleUrlInputKeyDown}
                    className="w-full bg-background/70 border border-border rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-foreground placeholder:text-muted focus:outline-none focus:border-accent/40 focus:bg-background/90 focus:ring-4 focus:ring-accent/5 transition-all shadow-inner"
                    placeholder="github.com, figma.com..."
                    autoComplete="off"
                  />
                </div>

                {domainSuggestions.length > 0 && (
                  <div className="mt-2.5 px-1">
                    <p className="mb-2 text-[9px] font-black uppercase tracking-[0.14em] text-muted">Did you mean</p>
                    <div className="flex flex-wrap gap-2">
                      {domainSuggestions.map((suggestion) => (
                        <button
                          key={suggestion}
                          type="button"
                          onClick={() => handleApplyDomainSuggestion(suggestion)}
                          className="rounded-full border border-border bg-card/60 px-3 py-1.5 text-[10px] font-black text-foreground transition-all hover:-translate-y-0.5 hover:border-accent/40 hover:bg-accent/10"
                        >
                          {suggestion.replace(/^https?:\/\//, '')}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {hasRecommendations && (
                  <div className="mt-3 rounded-2xl border border-border bg-card/70 p-2.5 shadow-inner sm:p-3">
                    <div className="mb-2 flex items-center justify-between gap-2 px-1">
                      <div className="flex items-center gap-1.5">
                        <Sparkles size={12} className="text-accent" />
                        <p className="text-[10px] uppercase tracking-[0.15em] text-muted font-black">{recommendationHeader}</p>
                      </div>
                      <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-muted">
                        ↑↓ Navigate | Enter Select
                      </p>
                    </div>
                    <div
                      className="space-y-1.5 max-h-56 overflow-y-auto pr-1 custom-scrollbar overscroll-contain"
                      role="listbox"
                      aria-label="App recommendations"
                      aria-activedescendant={`recommendation-option-${activeRecommendationIndex}`}
                    >
                      {recommendations.map((recommendation, index) => (
                        <button
                          id={`recommendation-option-${index}`}
                          ref={(node) => {
                            recommendationItemRefs.current[index] = node;
                          }}
                          key={recommendation.domain}
                          type="button"
                          onClick={() => handlePickRecommendation(recommendation, 'click')}
                          onMouseEnter={() => setActiveRecommendationIndex(index)}
                          role="option"
                          aria-selected={index === activeRecommendationIndex}
                          className={`w-full rounded-xl border px-3 py-2.5 text-left transition-all ${
                            index === activeRecommendationIndex
                              ? 'border-accent/30 bg-accent/12 shadow-[0_0_0_1px_rgba(var(--accent),0.18)]'
                                : 'border-transparent bg-background/60 hover:border-accent/30 hover:bg-accent/8'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex min-w-0 items-center gap-2.5">
                              <span className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-card">
                                <img
                                  src={buildFaviconUrl(recommendation.url, 64) ?? ''}
                                  alt=""
                                  className="h-4 w-4 object-contain"
                                  loading="lazy"
                                />
                              </span>
                              <span className="truncate text-sm font-black text-foreground">{recommendation.name}</span>
                            </div>
                            {index === 0 && (
                              <span className="rounded-full border border-accent/30 bg-accent/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.08em] text-accent">
                                Best match
                              </span>
                            )}
                          </div>
                          <p className="mt-1 truncate text-xs text-muted">{recommendation.url}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="flex items-center justify-between text-[10px] uppercase tracking-widest text-muted font-black mb-2.5 ml-1">
                  <span>Display name</span>
                  {url && !name && <span className={`text-accent text-[9px] ${prefersReducedMotion ? '' : 'animate-pulse'}`}>Auto-detecting...</span>}
                </label>
                <div className="relative group">
                  <input
                    required
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      setIsNameEdited(true);
                    }}
                    className="w-full bg-background/70 border border-border rounded-2xl px-4 py-4 text-sm font-bold text-foreground placeholder:text-muted focus:outline-none focus:border-accent/40 focus:bg-background/90 focus:ring-4 focus:ring-accent/5 transition-all shadow-inner"
                    placeholder="e.g. GitHub"
                    autoComplete="off"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-1.5 opacity-60">
                  <CornerDownLeft size={12} className="text-muted" />
                  <span className="text-[10px] font-black text-muted uppercase tracking-widest">{keyboardHintLabel}</span>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted/80">Esc to close</span>
              </div>

              <div className="sticky bottom-0 -mx-1 mt-1 border-t border-border bg-linear-to-t from-background via-background/90 to-transparent px-1 pt-3 pb-[calc(0.25rem+env(safe-area-inset-bottom))] backdrop-blur-md">
                <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 rounded-2xl border border-border bg-card/70 px-4 py-4 text-xs font-black uppercase tracking-widest text-foreground transition-all hover:border-(--border-hover) hover:bg-card-hover"
                  >
                    Cancel
                  </button>
                <Button
                  type="submit"
                  className="flex-1 rounded-2xl py-4 text-xs font-black uppercase tracking-widest shadow-[0_0_20px_rgba(var(--accent),0.2)] transition-all hover:-translate-y-0.5 hover:shadow-[0_0_30px_rgba(var(--accent),0.4)]"
                  disabled={!name.trim() || !url.trim() || loading}
                >
                  {loading ? <Loader2 size={16} className="animate-spin mx-auto" /> : 'Save app'}
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
