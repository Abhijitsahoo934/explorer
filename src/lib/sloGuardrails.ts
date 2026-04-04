import type { ProductEventRow } from './analyticsService';

export type SLOStatus = 'good' | 'warn' | 'fail';

export interface SLOItem {
  key: string;
  label: string;
  status: SLOStatus;
  value: string;
  target: string;
}

interface VitalStat {
  p50: number;
  n: number;
}

interface VitalStats {
  lcp: VitalStat;
  fcp: VitalStat;
  ttfb: VitalStat;
  cls: VitalStat;
}

const LIMITS = {
  commandPaletteLoadP95Ms: { good: 800, warn: 1200 },
  commandPaletteFailureRatePct: { good: 0.5, warn: 2 },
  dragDropFailureRatePct: { good: 1, warn: 3 },
  lcpP50Ms: { good: 2500, warn: 4000 },
  ttfbP50Ms: { good: 800, warn: 1200 },
  clsP50: { good: 0.1, warn: 0.2 },
};

function statusByThreshold(value: number, goodMax: number, warnMax: number): SLOStatus {
  if (value <= goodMax) return 'good';
  if (value <= warnMax) return 'warn';
  return 'fail';
}

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const rank = (p / 100) * (sorted.length - 1);
  const lo = Math.floor(rank);
  const hi = Math.ceil(rank);
  if (lo === hi) return sorted[lo];
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (rank - lo);
}

function toNumber(input: unknown): number | null {
  if (typeof input === 'number' && Number.isFinite(input)) return input;
  if (typeof input === 'string') {
    const parsed = Number(input);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

export function evaluateSLOGuardrails(events: ProductEventRow[], vitals: VitalStats): SLOItem[] {
  const commandPaletteSuccess = events.filter((e) => e.event_name === 'command_palette_loaded');
  const commandPaletteFailures = events.filter((e) => e.event_name === 'command_palette_load_failed');

  const commandPaletteLoadMs = commandPaletteSuccess
    .map((event) => toNumber((event.metadata ?? {}).load_ms))
    .filter((value): value is number => value !== null)
    .sort((a, b) => a - b);

  const commandPaletteLoadP95 = percentile(commandPaletteLoadMs, 95);
  const commandPaletteTotal = commandPaletteSuccess.length + commandPaletteFailures.length;
  const commandPaletteFailureRate = commandPaletteTotal > 0
    ? (commandPaletteFailures.length / commandPaletteTotal) * 100
    : 0;

  const dragSuccess = events.filter(
    (e) => e.event_name === 'workspace_app_moved' || e.event_name === 'workspace_folder_moved'
  ).length;
  const dragFailures = events.filter((e) => e.event_name === 'workspace_drag_drop_failed').length;
  const dragTotal = dragSuccess + dragFailures;
  const dragFailureRate = dragTotal > 0 ? (dragFailures / dragTotal) * 100 : 0;

  return [
    {
      key: 'command_palette_load_p95',
      label: 'Command Palette Load p95',
      status: statusByThreshold(
        commandPaletteLoadP95,
        LIMITS.commandPaletteLoadP95Ms.good,
        LIMITS.commandPaletteLoadP95Ms.warn
      ),
      value: `${Math.round(commandPaletteLoadP95)} ms`,
      target: `<= ${LIMITS.commandPaletteLoadP95Ms.good} ms`,
    },
    {
      key: 'command_palette_failure_rate',
      label: 'Command Palette Failure Rate',
      status: statusByThreshold(
        commandPaletteFailureRate,
        LIMITS.commandPaletteFailureRatePct.good,
        LIMITS.commandPaletteFailureRatePct.warn
      ),
      value: `${commandPaletteFailureRate.toFixed(2)}%`,
      target: `<= ${LIMITS.commandPaletteFailureRatePct.good}%`,
    },
    {
      key: 'drag_drop_failure_rate',
      label: 'Drag-Drop Failure Rate',
      status: statusByThreshold(
        dragFailureRate,
        LIMITS.dragDropFailureRatePct.good,
        LIMITS.dragDropFailureRatePct.warn
      ),
      value: `${dragFailureRate.toFixed(2)}%`,
      target: `<= ${LIMITS.dragDropFailureRatePct.good}%`,
    },
    {
      key: 'lcp_p50',
      label: 'LCP p50',
      status: statusByThreshold(vitals.lcp.p50, LIMITS.lcpP50Ms.good, LIMITS.lcpP50Ms.warn),
      value: `${Math.round(vitals.lcp.p50)} ms`,
      target: `<= ${LIMITS.lcpP50Ms.good} ms`,
    },
    {
      key: 'ttfb_p50',
      label: 'TTFB p50',
      status: statusByThreshold(vitals.ttfb.p50, LIMITS.ttfbP50Ms.good, LIMITS.ttfbP50Ms.warn),
      value: `${Math.round(vitals.ttfb.p50)} ms`,
      target: `<= ${LIMITS.ttfbP50Ms.good} ms`,
    },
    {
      key: 'cls_p50',
      label: 'CLS p50',
      status: statusByThreshold(vitals.cls.p50, LIMITS.clsP50.good, LIMITS.clsP50.warn),
      value: vitals.cls.p50.toFixed(4),
      target: `<= ${LIMITS.clsP50.good}`,
    },
  ];
}

export function summarizeReleaseReadiness(items: SLOItem[]): {
  status: 'go' | 'warn' | 'no-go';
  failures: number;
  warnings: number;
} {
  const failures = items.filter((item) => item.status === 'fail').length;
  const warnings = items.filter((item) => item.status === 'warn').length;

  if (failures > 0) return { status: 'no-go', failures, warnings };
  if (warnings > 1) return { status: 'warn', failures, warnings };
  return { status: 'go', failures, warnings };
}
