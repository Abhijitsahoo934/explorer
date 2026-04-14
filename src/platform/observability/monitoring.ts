interface MonitoringPayload {
  tags?: Record<string, string>;
  extra?: Record<string, unknown>;
}

interface MonitoringAdapter {
  captureError?: (error: unknown, payload?: MonitoringPayload) => void;
  captureMessage?: (message: string, payload?: MonitoringPayload) => void;
}

let monitoringEnabled = false;
let listenersBound = false;
let adapter: MonitoringAdapter | null = null;

function logDev(kind: 'error' | 'warn', label: string, payload?: unknown) {
  if (!import.meta.env.DEV) return;
  if (kind === 'error') {
    console.error(label, payload);
    return;
  }
  console.warn(label, payload);
}

function bindGlobalListeners() {
  if (listenersBound || typeof window === 'undefined') return;
  listenersBound = true;

  window.addEventListener('error', (event) => {
    captureError(event.error ?? event.message, {
      tags: { source: 'window.error' },
      extra: {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      },
    });
  });

  window.addEventListener('unhandledrejection', (event) => {
    captureError(event.reason, {
      tags: { source: 'window.unhandledrejection' },
    });
  });

  if (typeof PerformanceObserver !== 'undefined') {
    try {
      const observer = new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          const duration = 'duration' in entry ? Number(entry.duration.toFixed(1)) : 0;
          if (duration < 120) continue;

          captureMessage('Long task detected', {
            tags: { source: 'performance.longtask' },
            extra: {
              duration,
              name: entry.name,
              startTime: Number(entry.startTime.toFixed(1)),
            },
          });
        }
      });

      observer.observe({ type: 'longtask', buffered: true });
    } catch {
      // Ignore unsupported observer types.
    }
  }
}

function resolveGlobalMonitoringAdapter(): MonitoringAdapter | null {
  if (typeof window === 'undefined') return null;

  const globalObj = window as unknown as {
    Sentry?: {
      captureException?: (error: unknown, context?: unknown) => void;
      captureMessage?: (message: string, context?: unknown) => void;
    };
  };

  if (!globalObj.Sentry) return null;

  return {
    captureError: (error, payload) => {
      globalObj.Sentry?.captureException?.(error, payload);
    },
    captureMessage: (message, payload) => {
      globalObj.Sentry?.captureMessage?.(message, payload);
    },
  };
}

export function setMonitoringAdapter(nextAdapter: MonitoringAdapter | null) {
  adapter = nextAdapter;
}

export function initializeMonitoring() {
  monitoringEnabled = true;
  adapter = adapter ?? resolveGlobalMonitoringAdapter();
  bindGlobalListeners();
}

export function captureError(error: unknown, payload?: MonitoringPayload) {
  if (!monitoringEnabled) return;

  logDev('error', '[monitoring:error]', {
    error,
    payload,
  });

  adapter?.captureError?.(error, payload);
}

export function captureMessage(message: string, payload?: MonitoringPayload) {
  if (!monitoringEnabled) return;

  logDev('warn', '[monitoring:message]', {
    message,
    payload,
  });

  adapter?.captureMessage?.(message, payload);
}
