import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { CommandPaletteProvider } from './hooks/useCommandPalette';
import { GoogleAnalyticsTracker } from './components/system/GoogleAnalyticsTracker';
import { isFounderUser } from './lib/accessControl';

const Landing = lazy(() => import('./routes/Landing'));
const Auth = lazy(() => import('./routes/Auth'));
const AuthCallback = lazy(() => import('./routes/AuthCallback'));
const Dashboard = lazy(() => import('./routes/Dashboard'));
const Explorer = lazy(() => import('./routes/Explorer'));
const TemplateMarketplace = lazy(() => import('./routes/TemplateMarketplace'));
const TemplateSeoPage = lazy(() => import('./routes/TemplateSeoPage'));
const AboutExplorero = lazy(() => import('./routes/AboutExplorero'));
const BlogArticlePage = lazy(() => import('./routes/BlogArticlePage'));
const LearnHub = lazy(() => import('./routes/LearnHub'));
const UpdatePassword = lazy(() => import('./routes/UpdatePassword'));
const BlueprintImport = lazy(() => import('./routes/BlueprintImport'));
const Insights = lazy(() => import('./routes/Insights'));

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

/**
 * Protected Route Wrapper
 * Checks if the user is authenticated. 
 * If not, redirects securely to the /auth page.
 */
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6 p-4 transition-colors duration-300">
        <div className="relative w-12 h-12">
          {/* Premium Startup Spinner */}
          <div className="absolute inset-0 rounded-2xl border-2 border-border border-t-accent animate-spin" />
          <div className="absolute inset-2 rounded-xl bg-accent/10 animate-pulse" />
        </div>
        <p className="text-[10px] uppercase tracking-widest font-black text-muted animate-pulse text-center px-4">
          Authenticating workspace...
        </p>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

/**
 * Auth Route Wrapper
 * Ensures that logged-in users cannot access the login/signup page.
 * Redirects them straight to their dashboard.
 */
const AuthRoute = ({ children }: { children: React.ReactNode }) => {
  const { session, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen bg-background transition-colors duration-300" />; // Premium blank state while checking
  }

  if (session) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

const FounderRoute = ({ children }: { children: React.ReactNode }) => {
  const { session, user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen bg-background transition-colors duration-300" />;
  }

  if (!session) {
    return <Navigate to="/auth" replace />;
  }

  if (!isFounderUser(user)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

function App() {
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
              <AuthRoute>
                <Auth />
              </AuthRoute>
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
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/explorer" 
            element={
              <ProtectedRoute>
                <Explorer />
              </ProtectedRoute>
            } 
          />
          <Route
            path="/templates"
            element={
              <ProtectedRoute>
                <TemplateMarketplace />
              </ProtectedRoute>
            }
          />
          <Route path="/templates/:slug" element={<TemplateSeoPage />} />

          <Route path="/blueprint" element={<BlueprintImport />} />

          <Route
            path="/insights"
            element={
              <FounderRoute>
                <Insights />
              </FounderRoute>
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
