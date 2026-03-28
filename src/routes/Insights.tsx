import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/layout/Sidebar';
import { Topbar } from '../components/layout/Topbar';
import { Grain } from '../components/ui/Grain';
import { Button } from '../components/ui/Button';
import { fetchMyProductEvents, type ProductEventRow } from '../lib/analyticsService';
import { BarChart3, RefreshCw, TrendingUp, MousePointerClick, Activity } from 'lucide-react';

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const rank = (p / 100) * (sorted.length - 1);
  const lo = Math.floor(rank);
  const hi = Math.ceil(rank);
  if (lo === hi) return sorted[lo];
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (rank - lo);
}

const FUNNEL_LABELS: Record<string, string> = {
  funnel_email_login: 'Email login',
  funnel_oauth_login: 'Google login',
  funnel_signup_submitted: 'Sign up submitted',
  funnel_template_installed: 'Template installed',
  funnel_blueprint_installed: 'Blueprint installed',
  funnel_app_added: 'App saved',
};

export default function Insights() {
  const navigate = useNavigate();
  const [events, setEvents] = useState<ProductEventRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const rows = await fetchMyProductEvents(1000);
      setEvents(rows);
    } catch (e) {
      setEvents([]);
      setError(e instanceof Error ? e.message : 'Could not load analytics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const funnelCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const row of events) {
      if (row.event_name.startsWith('funnel_')) {
        counts[row.event_name] = (counts[row.event_name] ?? 0) + 1;
      }
    }
    return counts;
  }, [events]);

  const vitalStats = useMemo(() => {
    const byName: Record<string, number[]> = {};
    for (const row of events) {
      if (row.metric_type === 'web_vital' || row.metric_type === 'performance') {
        if (row.event_name === 'fcp' || row.event_name === 'lcp' || row.event_name === 'cls' || row.event_name === 'ttfb') {
          if (!byName[row.event_name]) byName[row.event_name] = [];
          byName[row.event_name].push(row.metric_value);
        }
      }
    }
    const keys = ['lcp', 'fcp', 'ttfb', 'cls'] as const;
    const out: Record<string, { p50: number; n: number }> = {};
    for (const key of keys) {
      const vals = (byName[key] ?? []).slice().sort((a, b) => a - b);
      out[key] = { p50: percentile(vals, 50), n: vals.length };
    }
    return out;
  }, [events]);

  const recent = useMemo(() => events.slice(0, 40), [events]);

  const handleFolderSelect = (folderId: string | null) => {
    if (folderId) {
      navigate(`/explorer?folder=${encodeURIComponent(folderId)}`);
      return;
    }
    navigate('/explorer');
  };

  return (
    <div className="app-shell flex h-screen bg-background text-foreground overflow-hidden selection:bg-accent/20 selection:text-accent transition-colors duration-300">
      <Grain />
      <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-accent/5 rounded-full blur-[120px] pointer-events-none" />

      <Sidebar
        currentFolderId={null}
        onFolderSelect={handleFolderSelect}
        onAddFolder={() => navigate('/explorer')}
        onAddApp={() => navigate('/explorer')}
      />

      <main className="flex-1 flex flex-col relative z-10 overflow-hidden bg-background/40 border-l border-border backdrop-blur-3xl">
        <Topbar />

        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-10">
          <div className="max-w-5xl mx-auto space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-[10px] uppercase tracking-[0.22em] font-black text-accent mb-3">
                  <BarChart3 size={12} />
                  Product insights
                </div>
                <h1 className="text-3xl md:text-4xl font-black tracking-tight text-foreground">Your workspace telemetry</h1>
                <p className="text-sm text-muted mt-2 max-w-2xl leading-relaxed">
                  Funnel counts and Core Web Vitals from your sessions. Requires the <code className="text-xs bg-card px-1.5 py-0.5 rounded border border-border">product_events</code> table in Supabase.
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="h-11 px-4 rounded-2xl text-[11px] uppercase tracking-widest font-black"
                  onClick={() => navigate('/dashboard')}
                >
                  Dashboard
                </Button>
                <Button className="h-11 px-4 rounded-2xl text-[11px] uppercase tracking-widest font-black" onClick={() => void load()} disabled={loading}>
                  <RefreshCw size={14} className={loading ? 'animate-spin mr-2' : 'mr-2'} />
                  Refresh
                </Button>
              </div>
            </div>

            {error && (
              <div className="rounded-3xl border border-amber-500/30 bg-amber-500/5 p-4 text-sm text-amber-800 dark:text-amber-200">
                {error}
              </div>
            )}

            <section className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="rounded-3xl border border-border bg-card/70 p-6 backdrop-blur-md">
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-black text-muted mb-4">
                  <MousePointerClick size={14} className="text-accent" />
                  Activation funnel (your account)
                </div>
                {loading ? (
                  <p className="text-sm text-muted">Loading…</p>
                ) : Object.keys(funnelCounts).length === 0 ? (
                  <p className="text-sm text-muted">No funnel events yet. Use the app (login, install template, add app) to populate data.</p>
                ) : (
                  <ul className="space-y-3">
                    {Object.entries(funnelCounts)
                      .sort((a, b) => b[1] - a[1])
                      .map(([name, count]) => (
                        <li key={name} className="flex items-center justify-between rounded-2xl border border-border bg-background/50 px-4 py-3">
                          <span className="text-sm font-bold text-foreground">{FUNNEL_LABELS[name] ?? name}</span>
                          <span className="text-xs font-black text-accent tabular-nums">{count}</span>
                        </li>
                      ))}
                  </ul>
                )}
              </div>

              <div className="rounded-3xl border border-border bg-card/70 p-6 backdrop-blur-md">
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-black text-muted mb-4">
                  <Activity size={14} className="text-accent" />
                  Web vitals (p50, recent samples)
                </div>
                {loading ? (
                  <p className="text-sm text-muted">Loading…</p>
                ) : (
                  <ul className="space-y-3">
                    {(['lcp', 'fcp', 'ttfb', 'cls'] as const).map((key) => {
                      const stat = vitalStats[key];
                      const label = key.toUpperCase();
                      const unit = key === 'cls' ? '' : ' ms';
                      const display =
                        key === 'cls' ? stat.p50.toFixed(4) : Math.round(stat.p50).toString();
                      return (
                        <li key={key} className="flex items-center justify-between rounded-2xl border border-border bg-background/50 px-4 py-3">
                          <span className="text-sm font-bold text-foreground">{label}</span>
                          <span className="text-xs text-muted font-mono">
                            p50: <span className="text-foreground font-black">{display}{unit}</span>
                            <span className="ml-2 text-muted">n={stat.n}</span>
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </section>

            <section className="rounded-3xl border border-border bg-card/50 p-6 backdrop-blur-md">
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-black text-muted mb-4">
                <TrendingUp size={14} className="text-accent" />
                Recent events
              </div>
              {loading ? (
                <p className="text-sm text-muted">Loading…</p>
              ) : recent.length === 0 ? (
                <p className="text-sm text-muted">No rows in product_events for this user.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="text-[10px] uppercase tracking-widest text-muted border-b border-border">
                        <th className="pb-3 pr-4 font-black">Time</th>
                        <th className="pb-3 pr-4 font-black">Event</th>
                        <th className="pb-3 pr-4 font-black">Type</th>
                        <th className="pb-3 pr-4 font-black">Value</th>
                        <th className="pb-3 font-black">Path</th>
                      </tr>
                    </thead>
                    <tbody className="text-foreground">
                      {recent.map((row) => (
                        <tr key={row.id} className="border-b border-border/60">
                          <td className="py-2.5 pr-4 text-xs text-muted whitespace-nowrap">
                            {new Date(row.created_at).toLocaleString()}
                          </td>
                          <td className="py-2.5 pr-4 font-medium">{row.event_name}</td>
                          <td className="py-2.5 pr-4 text-xs text-muted">{row.metric_type}</td>
                          <td className="py-2.5 pr-4 font-mono text-xs tabular-nums">{row.metric_value}</td>
                          <td className="py-2.5 text-xs text-muted truncate max-w-[180px]">{row.path}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
