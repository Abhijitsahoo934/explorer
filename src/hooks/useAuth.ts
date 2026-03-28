import { useEffect, useState } from 'react';
// Using 'import type' for high-performance builds and avoiding Vite runtime errors
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { prefetchAuthenticatedRoutes } from '../lib/routePrefetch';

/**
 * useAuth Hook
 * Centralized authentication engine. 
 * Provides reactive session state and simplified user access.
 */
export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // 1. Initial Session Handshake
    const initializeAuth = async () => {
      try {
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        
        if (error) throw error;

        if (mounted) {
          setSession(initialSession);
          setUser(initialSession?.user ?? null);
          if (initialSession) prefetchAuthenticatedRoutes();
          setLoading(false);
        }
      } catch (err) {
        console.error("Critical Auth Sync Error:", err);
        if (mounted) setLoading(false);
      }
    };

    initializeAuth();

    // 2. Real-time Auth State Subscription
    // Handles login, logout, and token refreshes instantly across the app
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      if (mounted) {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        if (currentSession) prefetchAuthenticatedRoutes();
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      void subscription.unsubscribe();
    };
  }, []);

  return { 
    session, 
    user,
    loading,
    isAuthenticated: !!session 
  };
}
