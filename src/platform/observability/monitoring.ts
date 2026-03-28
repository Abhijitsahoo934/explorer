interface MonitoringPayload {
  tags?: Record<string, string>;
  extra?: Record<string, unknown>;
}

let monitoringEnabled = false;

export function initializeMonitoring() {
  monitoringEnabled = true;
}

export function captureError(error: unknown, payload?: MonitoringPayload) {
  if (!monitoringEnabled) return;

  if (import.meta.env.DEV) {
    console.error('[monitoring]', error, payload);
  }

  // Sentry-ready hook point.
}

export function captureMessage(message: string, payload?: MonitoringPayload) {
  if (!monitoringEnabled) return;

  if (import.meta.env.DEV) {
    console.warn('[monitoring]', message, payload);
  }

  // Sentry-ready hook point.
}
