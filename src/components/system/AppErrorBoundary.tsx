import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import { captureError } from '../../platform/observability/monitoring';
import { Grain } from '../ui/Grain';

interface AppErrorBoundaryProps {
  children: ReactNode;
}

interface AppErrorBoundaryState {
  hasError: boolean;
}

export class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  state: AppErrorBoundaryState = {
    hasError: false,
  };

  static getDerivedStateFromError(): AppErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    captureError(error, {
      tags: { scope: 'app_error_boundary' },
      extra: { componentStack: errorInfo.componentStack },
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6 relative overflow-hidden">
          <Grain opacity={0.04} />
          <div className="relative z-10 w-full max-w-2xl rounded-[2rem] border border-red-500/15 bg-card/90 backdrop-blur-2xl shadow-premium p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400">
                <AlertTriangle size={24} />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] font-black text-red-400">Unexpected Error</p>
                <h1 className="text-2xl font-black tracking-tight mt-2">Explorer hit a runtime problem</h1>
              </div>
            </div>
            <p className="text-sm text-muted leading-relaxed">
              The app has been stopped to protect your session and data. Refresh the page, and if the problem repeats, review your latest changes before deployment.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
