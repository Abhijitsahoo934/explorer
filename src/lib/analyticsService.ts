import { supabase } from './supabase';

type AnalyticsMetricType = 'web_vital' | 'performance';

interface AnalyticsPayload {
  name: string;
  value: number;
  type: AnalyticsMetricType;
  path: string;
  metadata?: Record<string, unknown>;
}

export interface ProductEventRow {
  id: string;
  user_id: string | null;
  session_id: string;
  event_name: string;
  metric_value: number;
  metric_type: string;
  path: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

let analyticsWriteDisabled = false;
const sessionId =
  typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `session-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
let clsValue = 0;
let telemetryInitialized = false;

async function insertProductEvent(payload: AnalyticsPayload) {
  if (analyticsWriteDisabled) return;

  const { data: { user } } = await supabase.auth.getUser();

  const { error } = await supabase.from('product_events').insert([
    {
      user_id: user?.id ?? null,
      session_id: sessionId,
      event_name: payload.name,
      metric_value: payload.value,
      metric_type: payload.type,
      path: payload.path,
      metadata: payload.metadata ?? {},
    },
  ]);

  if (error) {
    // If analytics table is not provisioned yet, disable further writes to avoid noise.
    analyticsWriteDisabled = true;
    if (import.meta.env.DEV) {
      console.warn('Analytics write disabled:', error.message);
    }
  }
}

function trackMetric(payload: AnalyticsPayload) {
  void insertProductEvent(payload);
}

/**
 * Activation / funnel events. Stored as metric_type `performance` with value `1`
 * so existing DB CHECK constraints stay valid without migrations.
 */
export function trackFunnelEvent(eventName: string, metadata?: Record<string, unknown>) {
  const name = eventName.startsWith('funnel_') ? eventName : `funnel_${eventName}`;
  void insertProductEvent({
    name,
    value: 1,
    type: 'performance',
    path: typeof window !== 'undefined' ? window.location.pathname : '/',
    metadata,
  });
}

export async function fetchMyProductEvents(limit = 800): Promise<ProductEventRow[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('product_events')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data as ProductEventRow[]) ?? [];
}

export function initPerformanceTelemetry() {
  if (telemetryInitialized) return;
  telemetryInitialized = true;

  if (typeof window === 'undefined' || typeof performance === 'undefined') return;

  const path = window.location.pathname;

  // Navigation timing metrics (safe if supported).
  const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
  if (navigationEntry) {
    trackMetric({
      name: 'ttfb',
      value: navigationEntry.responseStart,
      type: 'performance',
      path,
    });
  }

  // FCP
  let paintObserver: PerformanceObserver | null = null;
  if (typeof PerformanceObserver !== 'undefined') {
    try {
      paintObserver = new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntriesByName('first-contentful-paint')) {
          trackMetric({
            name: 'fcp',
            value: entry.startTime,
            type: 'web_vital',
            path: window.location.pathname,
          });
        }
      });
      paintObserver.observe({ type: 'paint', buffered: true });
    } catch {
      // Ignore unsupported observer types.
    }
  }

  // LCP
  let lcpObserver: PerformanceObserver | null = null;
  if (typeof PerformanceObserver !== 'undefined') {
    try {
      lcpObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1];
        if (lastEntry) {
          trackMetric({
            name: 'lcp',
            value: lastEntry.startTime,
            type: 'web_vital',
            path: window.location.pathname,
          });
        }
      });
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
    } catch {
      // Ignore unsupported observer types.
    }
  }

  // CLS
  let clsObserver: PerformanceObserver | null = null;
  if (typeof PerformanceObserver !== 'undefined') {
    try {
      clsObserver = new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries() as Array<PerformanceEntry & { hadRecentInput?: boolean; value?: number }>) {
          if (!entry.hadRecentInput && typeof entry.value === 'number') clsValue += entry.value;
        }
      });
      clsObserver.observe({ type: 'layout-shift', buffered: true });
    } catch {
      // Ignore unsupported observer types.
    }
  }

  let hasFlushed = false;
  const finalizeVitals = () => {
    if (hasFlushed) return;
    hasFlushed = true;

    trackMetric({
      name: 'cls',
      value: Number(clsValue.toFixed(4)),
      type: 'web_vital',
      path: window.location.pathname,
    });
    paintObserver?.disconnect();
    lcpObserver?.disconnect();
    clsObserver?.disconnect();
  };

  // Flush just before tab is hidden/closed.
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') finalizeVitals();
  });
}

