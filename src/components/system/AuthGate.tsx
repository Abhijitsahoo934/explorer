import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { isFounderUser } from '../../lib/accessControl';

interface AuthGateProps {
  mode: 'auth' | 'protected' | 'founder';
  children: React.ReactNode;
}

const LoadingScreen = () => (
  <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6 p-4 transition-colors duration-300">
    <div className="relative w-12 h-12">
      <div className="absolute inset-0 rounded-2xl border-2 border-border border-t-accent animate-spin" />
      <div className="absolute inset-2 rounded-xl bg-accent/10 animate-pulse" />
    </div>
    <p className="text-[10px] uppercase tracking-widest font-black text-muted animate-pulse text-center px-4">
      Authenticating workspace...
    </p>
  </div>
);

const BlankLoadingScreen = () => <div className="min-h-screen bg-background transition-colors duration-300" />;

export default function AuthGate({ mode, children }: AuthGateProps) {
  const { session, user, loading } = useAuth();

  if (loading) {
    if (mode === 'auth' || mode === 'founder') {
      return <BlankLoadingScreen />;
    }

    return <LoadingScreen />;
  }

  if (mode === 'protected') {
    if (!session) {
      return <Navigate to="/auth" replace />;
    }
    return <>{children}</>;
  }

  if (mode === 'auth') {
    if (session) {
      return <Navigate to="/dashboard" replace />;
    }
    return <>{children}</>;
  }

  if (!session) {
    return <Navigate to="/auth" replace />;
  }

  if (!isFounderUser(user)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}