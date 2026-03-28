import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css'; // Fixed path to match your actual CSS file
import { ThemeProvider } from './components/ThemeProvider.tsx';
import { initPerformanceTelemetry } from './lib/analyticsService.ts';
import { BootErrorScreen } from './components/system/BootErrorScreen.tsx';
import { AppErrorBoundary } from './components/system/AppErrorBoundary.tsx';
import { STORAGE_KEYS } from './platform/storage/keys.ts';
import { supabaseRuntimeValidation } from './lib/supabase.ts';
import { initializeMonitoring } from './platform/observability/monitoring.ts';

const root = ReactDOM.createRoot(document.getElementById('root')!);

if (!supabaseRuntimeValidation.isValid) {
  root.render(
    <React.StrictMode>
      <BootErrorScreen
        title="Explorer could not start"
        summary="Runtime configuration is incomplete or invalid, so the app stopped before initializing auth, data, or realtime."
        details={supabaseRuntimeValidation.errors}
      />
    </React.StrictMode>
  );
} else {
  initializeMonitoring();
  initPerformanceTelemetry();

  root.render(
    <React.StrictMode>
      <AppErrorBoundary>
        <ThemeProvider defaultTheme="light" storageKey={STORAGE_KEYS.theme}>
          <App />
        </ThemeProvider>
      </AppErrorBoundary>
    </React.StrictMode>
  );
}
