import { Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { CommandPaletteProvider } from './hooks/useCommandPalette';
import { GoogleAnalyticsTracker } from './components/system/GoogleAnalyticsTracker';
import { lazyWithRetry } from './lib/lazyWithRetry';

const Landing = lazyWithRetry(() => import('./routes/Landing'), 'route-landing');
const Auth = lazyWithRetry(() => import('./routes/Auth'), 'route-auth');
const AuthCallback = lazyWithRetry(() => import('./routes/AuthCallback'), 'route-auth-callback');
const Dashboard = lazyWithRetry(() => import('./routes/Dashboard'), 'route-dashboard');
const Explorer = lazyWithRetry(() => import('./routes/Explorer'), 'route-explorer');
const TemplateMarketplace = lazyWithRetry(() => import('./routes/TemplateMarketplace'), 'route-template-marketplace');
const TemplateSeoPage = lazyWithRetry(() => import('./routes/TemplateSeoPage'), 'route-template-seo');
const AboutExplorero = lazyWithRetry(() => import('./routes/AboutExplorero'), 'route-about-explorero');
const BlogArticlePage = lazyWithRetry(() => import('./routes/BlogArticlePage'), 'route-blog-article');
const LearnHub = lazyWithRetry(() => import('./routes/LearnHub'), 'route-learn-hub');
const UpdatePassword = lazyWithRetry(() => import('./routes/UpdatePassword'), 'route-update-password');
const BlueprintImport = lazyWithRetry(() => import('./routes/BlueprintImport'), 'route-blueprint-import');
const Insights = lazyWithRetry(() => import('./routes/Insights'), 'route-insights');
const AuthGate = lazyWithRetry(() => import('./components/system/AuthGate'), 'component-auth-gate');

const RouteLoader = () => (
  <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6 p-4 transition-colors duration-300">
    <div className="relative w-12 h-12">
      <div className="absolute inset-0 rounded-2xl border-2 border-border border-t-accent animate-spin" />
      <div className="absolute inset-2 rounded-xl bg-accent/10 animate-pulse" />
    </div>
    <p className="text-[10px] uppercase tracking-widest font-black text-muted animate-pulse text-center px-4">
      Loading Experience...
    </p>
  </div>
);

const RecoveryHashRedirect = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const hash = window.location.hash.startsWith('#') ? window.location.hash.slice(1) : window.location.hash;
    if (!hash) return;

    const hashParams = new URLSearchParams(hash);
    const hasRecoveryToken =
      Boolean(hashParams.get('access_token')) &&
      hashParams.get('type') === 'recovery';

    if (!hasRecoveryToken || location.pathname === '/update-password' || location.pathname === '/auth/callback') {
      return;
    }

    navigate(`/update-password${window.location.hash}`, { replace: true });
  }, [location.pathname, navigate]);

  return null;
};

function App() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const warmRoutes = () => {
      void import('./routes/Auth');
      void import('./routes/Dashboard');
      void import('./routes/Explorer');
      void import('./routes/TemplateMarketplace');
    };

    if ('requestIdleCallback' in window) {
      const idleId = window.requestIdleCallback(warmRoutes, { timeout: 1800 });
      return () => window.cancelIdleCallback(idleId);
    }

    const timer = globalThis.setTimeout(warmRoutes, 1200);
    return () => globalThis.clearTimeout(timer);
  }, []);

  return (
    <Router>
      <CommandPaletteProvider>
      <GoogleAnalyticsTracker />
      <RecoveryHashRedirect />
      <Suspense fallback={<RouteLoader />}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          
          {/* Auth Route (Only for logged-out users) */}
          <Route 
            path="/auth" 
            element={
              <AuthGate mode="auth">
                <Auth />
              </AuthGate>
            } 
          />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/about-explorero" element={<AboutExplorero />} />
          <Route path="/blog/:slug" element={<BlogArticlePage />} />
          <Route path="/learn" element={<LearnHub />} />
          
          {/* Protected Routes: Sirf Login ke baad dikhenge */}
          <Route 
            path="/dashboard" 
            element={
              <AuthGate mode="protected">
                <Dashboard />
              </AuthGate>
            } 
          />
          <Route 
            path="/explorer" 
            element={
              <AuthGate mode="protected">
                <Explorer />
              </AuthGate>
            } 
          />
          <Route
            path="/templates"
            element={
              <AuthGate mode="protected">
                <TemplateMarketplace />
              </AuthGate>
            }
          />
          <Route path="/templates/:slug" element={<TemplateSeoPage />} />

          <Route path="/blueprint" element={<BlueprintImport />} />

          <Route
            path="/insights"
            element={
              <AuthGate mode="founder">
                <Insights />
              </AuthGate>
            }
          />

          {/* Password Reset Page (Standalone route) */}
          <Route path="/update-password" element={<UpdatePassword />} />

          {/* Catch-all: Agar koi galat URL dale toh Landing par bhej do */}
          {/* FIX: Ye hamesha sabse last mein hona chahiye! */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
      </CommandPaletteProvider>
    </Router>
  );
}

export default App;
