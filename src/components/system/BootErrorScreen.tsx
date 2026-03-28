import { AlertTriangle, TerminalSquare } from 'lucide-react';
import { Grain } from '../ui/Grain';

interface BootErrorScreenProps {
  title: string;
  summary: string;
  details: string[];
}

export function BootErrorScreen({ title, summary, details }: BootErrorScreenProps) {
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6 relative overflow-hidden">
      <Grain opacity={0.04} />
      <div className="absolute top-[-10%] left-[-10%] h-80 w-80 rounded-full bg-red-500/10 blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] h-80 w-80 rounded-full bg-amber-500/10 blur-[140px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-3xl rounded-[2rem] border border-red-500/15 bg-card/90 backdrop-blur-2xl shadow-premium overflow-hidden">
        <div className="border-b border-border px-8 py-6 flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400">
            <AlertTriangle size={24} />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.22em] font-black text-red-400">Boot Failure</p>
            <h1 className="text-2xl font-black tracking-tight mt-2">{title}</h1>
          </div>
        </div>

        <div className="px-8 py-8 space-y-6">
          <p className="text-sm text-muted leading-relaxed">{summary}</p>

          <div className="rounded-[1.5rem] border border-border bg-background/70 p-5">
            <div className="flex items-center gap-2 text-muted mb-4">
              <TerminalSquare size={16} />
              <p className="text-[10px] uppercase tracking-[0.18em] font-black">Required Fixes</p>
            </div>
            <div className="space-y-2">
              {details.map((detail) => (
                <div key={detail} className="rounded-xl border border-border bg-card/70 px-4 py-3 text-sm text-foreground">
                  {detail}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-accent/15 bg-accent/5 p-5 text-sm text-muted leading-relaxed">
            Add the missing variables to `.env` or your deployment environment, then reload the app. Explorer intentionally stops at boot when runtime config is unsafe.
          </div>
        </div>
      </div>
    </div>
  );
}
